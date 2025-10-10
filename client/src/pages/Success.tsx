import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function Success() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Invalidate subscription queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ["/api/subscription-info"] });
    queryClient.invalidateQueries({ queryKey: ["/api/subscription-history"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
              <CheckCircle className="w-16 h-16 text-primary" data-testid="icon-success" />
            </div>
            <CardTitle className="text-3xl md:text-4xl">
              Welcome to Your New Plan!
            </CardTitle>
            <CardDescription className="text-base">
              Your subscription has been successfully activated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">What's Next?</h3>
                  <p className="text-sm text-muted-foreground">
                    You now have access to all the premium features. Your credits have been refreshed and you're ready to supercharge your career journey.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Increased monthly credits for all features</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Priority AI processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Advanced resume rewriting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Unlimited interview coaching</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setLocation("/")}
                className="w-full"
                size="lg"
                data-testid="button-start"
              >
                Start Using Your Credits
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                onClick={() => setLocation("/settings")}
                variant="outline"
                className="w-full"
                size="lg"
                data-testid="button-settings"
              >
                View Subscription Details
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground" data-testid="text-redirect">
              Redirecting to home in {countdown} seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
