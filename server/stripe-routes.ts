import { Router } from "express";
import Stripe from "stripe";
import { db } from "./db";
import { users, subscriptionHistory } from "../shared/schema";
import { eq } from "drizzle-orm";
import { STRIPE_PRICE_IDS, getTierFromPriceId, getCreditsForTier, getNextResetDate } from "./stripe-config";
import { authenticateSupabase } from "./auth-routes";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export const stripeRouter = Router();

// Create checkout session (protected route)
stripeRouter.post("/create-checkout-session", authenticateSupabase, async (req, res) => {
  try {
    const { tier } = req.body as { tier: keyof typeof STRIPE_PRICE_IDS };
    const userId = req.user!.id;

    if (!tier || !STRIPE_PRICE_IDS[tier]) {
      return res.status(400).json({ error: "Invalid subscription tier" });
    }

    const priceId = STRIPE_PRICE_IDS[tier];

    // Get user from database
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to user record
      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    // Determine the base URL for success/cancel redirects
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : req.headers.origin || 'http://localhost:5000';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        userId: user.id,
        tier: tier,
      },
    });

    res.json({ checkoutUrl: session.url });
  } catch (error: any) {
    console.error("Checkout session error:", error);
    res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
});

// Stripe webhook handler (public route - signature verified)
stripeRouter.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (!userId || !tier) {
          console.error("Missing metadata in checkout session");
          break;
        }

        // Get subscription tier from metadata or line items
        const subscriptionTier = tier.includes('pro') ? 'pro' : 'premium';
        const credits = getCreditsForTier(subscriptionTier);

        // Update user record
        await db.update(users)
          .set({
            subscriptionTier,
            subscriptionStatus: 'active',
            stripeSubscriptionId: session.subscription as string,
            creditsRemaining: credits,
            creditsResetDate: subscriptionTier === 'pro' ? getNextResetDate() : null,
          })
          .where(eq(users.id, userId));

        // Insert subscription history
        await db.insert(subscriptionHistory).values({
          userId,
          eventType: 'subscribed',
          fromTier: 'free',
          toTier: subscriptionTier,
          amountPaid: session.amount_total ? (session.amount_total / 100).toString() : '0',
          stripeInvoiceId: session.invoice as string || null,
        });

        console.log(`User ${userId} subscribed to ${subscriptionTier}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Find user by subscription ID
        const [user] = await db.select().from(users)
          .where(eq(users.stripeSubscriptionId, subscriptionId));

        if (!user) {
          console.error("User not found for subscription:", subscriptionId);
          break;
        }

        // Keep status active and reset LinkedIn credits for Pro users
        const updates: any = { subscriptionStatus: 'active' };
        if (user.subscriptionTier === 'pro') {
          updates.creditsRemaining = { resume: -1, interview: -1, linkedin: 10 };
          updates.creditsResetDate = getNextResetDate();
        }

        await db.update(users)
          .set(updates)
          .where(eq(users.id, user.id));

        // Insert renewal history
        await db.insert(subscriptionHistory).values({
          userId: user.id,
          eventType: 'renewed',
          fromTier: user.subscriptionTier,
          toTier: user.subscriptionTier,
          amountPaid: invoice.amount_paid ? (invoice.amount_paid / 100).toString() : '0',
          stripeInvoiceId: invoice.id,
        });

        console.log(`Subscription renewed for user ${user.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const [user] = await db.select().from(users)
          .where(eq(users.stripeSubscriptionId, subscriptionId));

        if (!user) break;

        await db.update(users)
          .set({ subscriptionStatus: 'past_due' })
          .where(eq(users.id, user.id));

        console.log(`Payment failed for user ${user.id}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const [user] = await db.select().from(users)
          .where(eq(users.stripeCustomerId, customerId));

        if (!user) break;

        // Get price ID from subscription items
        const priceId = subscription.items.data[0]?.price.id;
        const newTier = getTierFromPriceId(priceId);

        if (!newTier) break;

        const oldTier = user.subscriptionTier;
        const eventType = oldTier === 'free' ? 'subscribed' : 
                         (newTier === 'premium' && oldTier === 'pro') ? 'upgraded' : 'downgraded';

        const credits = getCreditsForTier(newTier);

        await db.update(users)
          .set({
            subscriptionTier: newTier,
            creditsRemaining: credits,
            creditsResetDate: newTier === 'pro' ? getNextResetDate() : null,
          })
          .where(eq(users.id, user.id));

        await db.insert(subscriptionHistory).values({
          userId: user.id,
          eventType,
          fromTier: oldTier,
          toTier: newTier,
          amountPaid: '0',
        });

        console.log(`User ${user.id} ${eventType} from ${oldTier} to ${newTier}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const [user] = await db.select().from(users)
          .where(eq(users.stripeCustomerId, customerId));

        if (!user) break;

        // Downgrade to free tier
        await db.update(users)
          .set({
            subscriptionTier: 'free',
            subscriptionStatus: 'cancelled',
            stripeSubscriptionId: null,
            creditsRemaining: { resume: 5, interview: 2, linkedin: 1 },
            creditsResetDate: getNextResetDate(),
          })
          .where(eq(users.id, user.id));

        await db.insert(subscriptionHistory).values({
          userId: user.id,
          eventType: 'cancelled',
          fromTier: user.subscriptionTier,
          toTier: 'free',
        });

        console.log(`User ${user.id} cancelled subscription`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    // Return 200 to acknowledge receipt even if processing fails
    res.json({ received: true, error: error.message });
  }
});

// Customer portal (protected route)
stripeRouter.get("/customer-portal", authenticateSupabase, async (req, res) => {
  try {
    const userId = req.user!.id;

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ error: "No subscription found" });
    }

    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : req.headers.origin || 'http://localhost:5000';

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });

    res.json({ portalUrl: session.url });
  } catch (error: any) {
    console.error("Customer portal error:", error);
    res.status(500).json({ error: error.message || "Failed to create portal session" });
  }
});
