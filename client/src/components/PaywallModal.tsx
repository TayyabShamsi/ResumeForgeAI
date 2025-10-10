import { useLocation } from "wouter";
import { AlertCircle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  currentTier: string;
  creditsRemaining: number;
}

export function PaywallModal({
  isOpen,
  onClose,
  featureName,
  currentTier,
  creditsRemaining,
}: PaywallModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    setLocation("/pricing");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-paywall">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl" data-testid="text-paywall-title">
                Credit Limit Reached
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base" data-testid="text-paywall-description">
            You've used all your {featureName} credits for this month.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-muted p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Plan</span>
              <span className="font-semibold" data-testid="text-current-tier">
                {currentTier}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{featureName} Credits</span>
              <span className="font-semibold text-destructive" data-testid="text-credits-remaining">
                {creditsRemaining} remaining
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upgrade to continue using this feature and unlock:
            </p>
            <ul className="text-sm space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>More monthly credits</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Priority AI processing</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Advanced features</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
            data-testid="button-cancel-paywall"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            className="w-full sm:w-auto"
            data-testid="button-upgrade-paywall"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            View Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
