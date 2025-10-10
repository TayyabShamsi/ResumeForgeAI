import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";

export default function Cancel() {
  const [, setLocation] = useLocation();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto p-4 bg-muted rounded-full w-fit">
              <XCircle className="w-16 h-16 text-muted-foreground" data-testid="icon-cancel" />
            </div>
            <CardTitle className="text-3xl md:text-4xl">
              Subscription Cancelled
            </CardTitle>
            <CardDescription className="text-base">
              No charges were made to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-medium">What Happened?</h3>
              <p className="text-sm text-muted-foreground">
                You've cancelled the checkout process. Don't worry - no charges were made and your account remains unchanged.
              </p>
              <p className="text-sm text-muted-foreground">
                You can still continue using ResumeForge AI with your current plan or upgrade whenever you're ready.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setLocation("/")}
                className="w-full"
                size="lg"
                data-testid="button-home"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Return to Home
              </Button>
              
              <Button
                onClick={() => setLocation("/pricing")}
                variant="outline"
                className="w-full"
                size="lg"
                data-testid="button-pricing"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                View Pricing Plans
              </Button>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground text-center">
                Need help? Have questions about our plans?{" "}
                <button
                  onClick={() => setLocation("/pricing")}
                  className="text-primary hover:underline"
                  data-testid="link-learn-more"
                >
                  Learn more about features
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
