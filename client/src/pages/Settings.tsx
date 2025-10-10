import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/PageTransition";
import { apiRequest } from "@/lib/queryClient";
import {
  Settings as SettingsIcon,
  CreditCard,
  Calendar,
  TrendingUp,
  FileText,
  MessageSquare,
  Linkedin,
  Mail,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface SubscriptionInfo {
  tier: string;
  status: string;
  stripeCustomerId: string | null;
  currentPeriodEnd: string | null;
  credits: {
    resume: number;
    interview: number;
    linkedin: number;
    coverLetter: number;
  };
}

interface SubscriptionHistory {
  id: number;
  userId: string;
  previousTier: string;
  newTier: string;
  changeType: string;
  changedAt: string;
}

const CREDIT_LIMITS = {
  free: { resume: 5, interview: 2, linkedin: 1, coverLetter: 3 },
  pro: { resume: 50, interview: 30, linkedin: 15, coverLetter: 30 },
  premium: { resume: 999999, interview: 999999, linkedin: 999999, coverLetter: 999999 },
};

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  // Fetch subscription info
  const { data: subscriptionInfo, isLoading: isLoadingSubscription } = useQuery<SubscriptionInfo>({
    queryKey: ["/api/subscription-info"],
  });

  // Fetch subscription history
  const { data: subscriptionHistory, isLoading: isLoadingHistory } = useQuery<SubscriptionHistory[]>({
    queryKey: ["/api/subscription-history"],
  });

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const res = await apiRequest("GET", "/api/stripe/customer-portal", {});
      const data = await res.json() as { url: string };
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const getCreditLimit = (tier: string, type: keyof typeof CREDIT_LIMITS.free) => {
    const tierKey = tier.toLowerCase() as keyof typeof CREDIT_LIMITS;
    return CREDIT_LIMITS[tierKey]?.[type] || CREDIT_LIMITS.free[type];
  };

  const getProgressPercentage = (remaining: number, limit: number) => {
    if (limit === 999999) return 0; // Unlimited - show 0% used
    const used = Math.max(0, limit - remaining);
    return Math.min((used / limit) * 100, 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "premium":
        return "bg-gradient-to-r from-violet-500 to-purple-600 text-white";
      case "pro":
        return "bg-gradient-to-r from-emerald-500 to-green-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoadingSubscription) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-subscription" />
        </div>
      </PageTransition>
    );
  }

  if (!subscriptionInfo) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load subscription information.</p>
        </div>
      </PageTransition>
    );
  }

  const tier = subscriptionInfo.tier || "free";
  const credits = subscriptionInfo.credits;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Subscription Settings</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Current Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>Your subscription details and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan Tier</span>
                  <Badge className={getTierBadgeColor(tier)} data-testid="badge-tier">
                    {tier.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={subscriptionInfo.status === "active" ? "default" : "secondary"} data-testid="badge-status">
                    {subscriptionInfo.status || "Active"}
                  </Badge>
                </div>

                {subscriptionInfo.currentPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Renews On</span>
                    <div className="flex items-center gap-2 text-sm" data-testid="text-renewal-date">
                      <Calendar className="h-4 w-4" />
                      {formatDate(subscriptionInfo.currentPeriodEnd)}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  {tier !== "free" && subscriptionInfo.stripeCustomerId && (
                    <Button
                      onClick={handleManageSubscription}
                      disabled={isLoadingPortal}
                      className="w-full"
                      data-testid="button-manage-subscription"
                    >
                      {isLoadingPortal ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Opening Portal...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Manage Subscription
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/pricing")}
                    className="w-full"
                    data-testid="button-view-plans"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {tier === "free" ? "Upgrade Plan" : "View All Plans"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Credit Usage Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Credit Usage
                </CardTitle>
                <CardDescription>Monthly credit allowances and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resume Credits */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Resume Analysis</span>
                    </div>
                    <span className="font-medium" data-testid="text-credits-resume">
                      {credits.resume} remaining
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(credits.resume, getCreditLimit(tier, "resume"))} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.max(0, getCreditLimit(tier, "resume") - credits.resume)} used</span>
                    <span>{getCreditLimit(tier, "resume") === 999999 ? "Unlimited" : `${getCreditLimit(tier, "resume")} total`}</span>
                  </div>
                </div>

                {/* Interview Credits */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span>Interview Questions</span>
                    </div>
                    <span className="font-medium" data-testid="text-credits-interview">
                      {credits.interview} remaining
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(credits.interview, getCreditLimit(tier, "interview"))} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.max(0, getCreditLimit(tier, "interview") - credits.interview)} used</span>
                    <span>{getCreditLimit(tier, "interview") === 999999 ? "Unlimited" : `${getCreditLimit(tier, "interview")} total`}</span>
                  </div>
                </div>

                {/* LinkedIn Credits */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-primary" />
                      <span>LinkedIn Optimization</span>
                    </div>
                    <span className="font-medium" data-testid="text-credits-linkedin">
                      {credits.linkedin} remaining
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(credits.linkedin, getCreditLimit(tier, "linkedin"))} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.max(0, getCreditLimit(tier, "linkedin") - credits.linkedin)} used</span>
                    <span>{getCreditLimit(tier, "linkedin") === 999999 ? "Unlimited" : `${getCreditLimit(tier, "linkedin")} total`}</span>
                  </div>
                </div>

                {/* Cover Letter Credits */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>Cover Letters</span>
                    </div>
                    <span className="font-medium" data-testid="text-credits-cover-letter">
                      {credits.coverLetter} remaining
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(credits.coverLetter, getCreditLimit(tier, "coverLetter"))} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.max(0, getCreditLimit(tier, "coverLetter") - credits.coverLetter)} used</span>
                    <span>{getCreditLimit(tier, "coverLetter") === 999999 ? "Unlimited" : `${getCreditLimit(tier, "coverLetter")} total`}</span>
                  </div>
                </div>

                <div className="pt-4 text-xs text-muted-foreground">
                  Credits reset monthly on your renewal date
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Subscription History
              </CardTitle>
              <CardDescription>Your plan changes and activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : subscriptionHistory && subscriptionHistory.length > 0 ? (
                <div className="space-y-4">
                  {subscriptionHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`history-item-${item.id}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {item.changeType}
                          </Badge>
                          <span className="text-sm">
                            <span className="text-muted-foreground">{item.previousTier}</span>
                            {" → "}
                            <span className="font-medium">{item.newTier}</span>
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.changedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8" data-testid="text-no-history">
                  No subscription history yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
