import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationBannerProps {
  emailVerified: boolean;
  email?: string;
}

export default function EmailVerificationBanner({ emailVerified, email }: EmailVerificationBannerProps) {
  const { toast } = useToast();

  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/auth/resend-verification", {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to resend verification email");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox and follow the link to verify your email address.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Don't show banner if email is already verified
  if (emailVerified) {
    return null;
  }

  return (
    <Alert className="mb-6 border-warning/50 bg-warning/10" data-testid="banner-email-verification">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning">Email Verification Required</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          Please verify your email address ({email}) to access AI features. Check your inbox for the verification link.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => resendVerificationMutation.mutate()}
          disabled={resendVerificationMutation.isPending}
          className="shrink-0"
          data-testid="button-resend-verification"
        >
          <Mail className="mr-2 h-4 w-4" />
          {resendVerificationMutation.isPending ? "Sending..." : "Resend Email"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
