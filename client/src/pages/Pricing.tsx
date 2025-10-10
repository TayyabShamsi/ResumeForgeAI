import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useLocation } from "wouter";

type BillingInterval = "monthly" | "yearly";

interface PricingTier {
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  icon: typeof Zap;
  badge?: string;
  features: {
    text: string;
    included: boolean;
  }[];
  priceIds: {
    monthly: string;
    yearly: string;
  };
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    description: "Get started with basic career tools",
    price: {
      monthly: 0,
      yearly: 0,
    },
    icon: Sparkles,
    features: [
      { text: "5 Resume analyses per month", included: true },
      { text: "2 Interview prep sessions per month", included: true },
      { text: "1 LinkedIn optimization per month", included: true },
      { text: "1 Cover letter per month", included: true },
      { text: "Basic ATS scoring", included: true },
      { text: "AI-powered feedback", included: true },
      { text: "PDF download reports", included: false },
      { text: "Priority support", included: false },
      { text: "Advanced analytics", included: false },
    ],
    priceIds: {
      monthly: "",
      yearly: "",
    },
  },
  {
    name: "Pro",
    description: "Perfect for active job seekers",
    price: {
      monthly: 4.99,
      yearly: 49,
    },
    icon: Zap,
    badge: "Most Popular",
    features: [
      { text: "50 Resume analyses per month", included: true },
      { text: "30 Interview prep sessions per month", included: true },
      { text: "20 LinkedIn optimizations per month", included: true },
      { text: "25 Cover letters per month", included: true },
      { text: "Advanced ATS scoring", included: true },
      { text: "AI-powered feedback", included: true },
      { text: "PDF download reports", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: false },
    ],
    priceIds: {
      monthly: "price_pro_monthly",
      yearly: "price_pro_yearly",
    },
  },
  {
    name: "Premium",
    description: "For career coaches and recruiters",
    price: {
      monthly: 9.99,
      yearly: 99,
    },
    icon: Crown,
    badge: "Best Value",
    features: [
      { text: "Unlimited Resume analyses", included: true },
      { text: "Unlimited Interview prep sessions", included: true },
      { text: "Unlimited LinkedIn optimizations", included: true },
      { text: "Unlimited Cover letters", included: true },
      { text: "Advanced ATS scoring", included: true },
      { text: "AI-powered feedback", included: true },
      { text: "PDF download reports", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: true },
    ],
    priceIds: {
      monthly: "price_premium_monthly",
      yearly: "price_premium_yearly",
    },
  },
];

export default function Pricing() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubscribe = async (tier: PricingTier) => {
    if (tier.name === "Free") {
      setLocation("/");
      return;
    }

    setLoadingTier(tier.name);
    try {
      const priceId = billingInterval === "monthly" ? tier.priceIds.monthly : tier.priceIds.yearly;
      
      const response = await apiRequest("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ priceId }),
      }) as { url: string };

      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const getPrice = (tier: PricingTier) => {
    if (tier.name === "Free") return "Free";
    
    const price = billingInterval === "monthly" ? tier.price.monthly : tier.price.yearly;
    const period = billingInterval === "monthly" ? "mo" : "yr";
    
    return (
      <>
        <span className="text-5xl font-bold">${price}</span>
        <span className="text-muted-foreground">/{period}</span>
      </>
    );
  };

  const getSavings = (tier: PricingTier) => {
    if (tier.name === "Free" || billingInterval === "monthly") return null;
    
    const monthlyCost = tier.price.monthly * 12;
    const yearlyCost = tier.price.yearly;
    const savings = monthlyCost - yearlyCost;
    
    return savings > 0 ? `Save $${savings}/year` : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Unlock your career potential with AI-powered tools
          </p>

          <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-lg">
            <Button
              variant={billingInterval === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingInterval("monthly")}
              data-testid="button-monthly-billing"
            >
              Monthly
            </Button>
            <Button
              variant={billingInterval === "yearly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingInterval("yearly")}
              data-testid="button-yearly-billing"
            >
              Yearly
            </Button>
          </div>
          {billingInterval === "yearly" && (
            <p className="text-sm text-emerald-500 mt-2">Save up to 17% with annual billing</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isPopular = tier.badge === "Most Popular";
            
            return (
              <Card
                key={tier.name}
                className={`relative flex flex-col ${
                  isPopular ? "border-primary shadow-lg shadow-primary/20 scale-105" : ""
                }`}
                data-testid={`card-pricing-${tier.name.toLowerCase()}`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      {tier.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      {getPrice(tier)}
                    </div>
                    {getSavings(tier) && (
                      <p className="text-sm text-emerald-500 mt-1">{getSavings(tier)}</p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3"
                        data-testid={`feature-${tier.name.toLowerCase()}-${index}`}
                      >
                        <Check
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            feature.included
                              ? "text-emerald-500"
                              : "text-muted-foreground opacity-40"
                          }`}
                        />
                        <span
                          className={
                            feature.included ? "text-foreground" : "text-muted-foreground line-through"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => handleSubscribe(tier)}
                    disabled={loadingTier === tier.name}
                    data-testid={`button-subscribe-${tier.name.toLowerCase()}`}
                  >
                    {loadingTier === tier.name
                      ? "Loading..."
                      : tier.name === "Free"
                      ? "Get Started Free"
                      : `Subscribe to ${tier.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            All plans include access to our AI-powered career tools
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
