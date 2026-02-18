import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles two types of OAuth callbacks:
 * 1. Supabase Google auth → redirects to /dashboard with hard reload
 * 2. Platform OAuth (Instagram/YouTube) → forwards to edge function
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    // Handle OAuth errors
    if (oauthError) {
      setError(`OAuth error: ${oauthError}`);
      setTimeout(() => navigate("/auth"), 2000);
      return;
    }

    const handleCallback = async () => {
      // First check if session already exists
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        // Session exists — hard redirect to dashboard
        window.location.replace("/dashboard");
        return;
      }

      if (!code) {
        navigate("/auth", { replace: true });
        return;
      }

      // Try to exchange the code for a Supabase session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (!exchangeError && data.session) {
        // Success — hard redirect forces AuthContext to reload with new session
        window.location.replace("/dashboard");
        return;
      }

      // exchangeCodeForSession failed — this is a platform OAuth (Instagram/YouTube)
      if (state) {
        const callbackUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
        window.location.href = callbackUrl;
        return;
      }

      // Nothing worked
      setError("Authentication failed. Please try again.");
      setTimeout(() => navigate("/auth"), 2000);
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-muted-foreground text-sm">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Completing authentication…</p>
    </div>
  );
}
