import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  plan: "free" | "starter" | "pro";
  trialEndsAt: Date | null;
  displayName: string | null;
  isTrialActive: boolean;
  trialDaysLeft: number;
  isPro: boolean;
  isStarter: boolean;
  isFree: boolean;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plan, trial_ends_at, display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
        const now = new Date();
        const isTrialActive = trialEnd ? trialEnd > now : false;
        const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
        const isPro = data.plan === "pro";
        const isStarter = data.plan === "starter";
        const isFree = data.plan === "free" || (!data.plan);

        setProfile({
          plan: (data.plan as "free" | "starter" | "pro") || "free",
          trialEndsAt: trialEnd,
          displayName: data.display_name,
          isTrialActive,
          trialDaysLeft,
          isPro,
          isStarter,
          isFree,
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  return { profile, loading };
}
