import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Sparkles, CreditCard } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation } from "wouter";

interface SubscriptionInfo {
  tier: string;
  status: string;
  credits: {
    resume: number;
    interview: number;
    linkedin: number;
    coverLetter: number;
  };
  resetDate: string | null;
}

const tierConfig = {
  free: {
    icon: Sparkles,
    label: "Free",
    color: "bg-muted text-muted-foreground",
  },
  pro: {
    icon: Zap,
    label: "Pro",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  premium: {
    icon: Crown,
    label: "Premium",
    color: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
};

export function SubscriptionBadge() {
  const [, setLocation] = useLocation();
  
  const { data: subscriptionInfo, isLoading } = useQuery<SubscriptionInfo>({
    queryKey: ["/api/subscription-info"],
  });

  if (isLoading || !subscriptionInfo) {
    return null;
  }

  const config = tierConfig[subscriptionInfo.tier as keyof typeof tierConfig] || tierConfig.free;
  const Icon = config.icon;
  const isFreeTier = subscriptionInfo.tier === "free";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-9"
          data-testid="button-subscription-badge"
        >
          <Badge variant="outline" className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Subscription</h4>
              <p className="text-xs text-muted-foreground capitalize">{subscriptionInfo.tier} Plan</p>
            </div>
            {isFreeTier && (
              <Button
                size="sm"
                onClick={() => setLocation("/pricing")}
                data-testid="button-upgrade"
              >
                Upgrade
              </Button>
            )}
            {!isFreeTier && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.href = "/api/stripe/customer-portal"}
                data-testid="button-manage"
              >
                <CreditCard className="w-3 h-3 mr-1" />
                Manage
              </Button>
            )}
          </div>

          <div className="border-t pt-3">
            <h4 className="font-semibold text-sm mb-3">Credits Remaining</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Resume Analysis</span>
                <Badge variant="secondary" className="font-mono">
                  {subscriptionInfo.tier === 'premium' ? '∞' : subscriptionInfo.credits.resume}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Interview Prep</span>
                <Badge variant="secondary" className="font-mono">
                  {subscriptionInfo.tier === 'premium' ? '∞' : subscriptionInfo.credits.interview}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">LinkedIn Optimize</span>
                <Badge variant="secondary" className="font-mono">
                  {subscriptionInfo.tier === 'premium' ? '∞' : subscriptionInfo.credits.linkedin}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cover Letters</span>
                <Badge variant="secondary" className="font-mono">
                  {subscriptionInfo.tier === 'premium' ? '∞' : subscriptionInfo.credits.coverLetter}
                </Badge>
              </div>
            </div>
          </div>

          {subscriptionInfo.resetDate && subscriptionInfo.tier !== 'premium' && (
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Credits reset on{" "}
                {new Date(subscriptionInfo.resetDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
