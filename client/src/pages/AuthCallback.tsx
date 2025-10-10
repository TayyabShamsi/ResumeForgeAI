import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a code in the URL (OAuth callback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const code = hashParams.get('code');

        if (code) {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }

          if (!data.session) {
            throw new Error("No session returned after code exchange");
          }
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          // Session established, inform backend to create/update user
          // The access token is automatically sent in cookies by Supabase
          toast({
            title: "Welcome!",
            description: "You've successfully signed in with Google.",
          });

          // Invalidate queries to refresh user data
          queryClient.invalidateQueries({ queryKey: ["/api/subscription-info"] });
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

          // Redirect to home
          setLocation("/");
        } else {
          throw new Error("No session found");
        }
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        toast({
          title: "Authentication failed",
          description: error.message || "Failed to complete sign-in",
          variant: "destructive",
        });
        setLocation("/login");
      }
    };

    handleCallback();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Completing sign-in...</h2>
          <p className="text-sm text-muted-foreground text-center">
            Please wait while we finish setting up your account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
