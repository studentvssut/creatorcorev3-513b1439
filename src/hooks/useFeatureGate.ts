import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";

export type Plan = "free" | "starter" | "pro";

const ADMIN_EMAILS = ["support@creatorcorev3.com", "meta.review@creatorcorev3.com", "omprakashkisan223@gmail.com"];

export type Feature =
  | "full_analytics"
  | "30day_insights"
  | "unlimited_scripts"
  | "limited_scripts"
  | "nexus_publishing"
  | "growth_score"
  | "basic_metrics"
  | "7day_analytics";

const FEATURE_ACCESS: Record<Feature, Plan[]> = {
  basic_metrics: ["free", "starter", "pro"],
  "7day_analytics": ["starter", "pro"],
  limited_scripts: ["starter", "pro"],
  full_analytics: ["pro"],
  "30day_insights": ["pro"],
  unlimited_scripts: ["pro"],
  nexus_publishing: ["pro"],
  growth_score: ["pro"],
};

export function useFeatureGate() {
  const { profile, loading } = useUserProfile();
  const { user } = useAuth();

  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? "");
  const plan: Plan = isAdmin ? "pro" : (profile?.plan as Plan) ?? "free";
  const isPro = plan === "pro";
  const isStarter = plan === "starter";
  const isFree = plan === "free";

  const canAccess = (feature: Feature): boolean => {
    if (isAdmin) return true;
    return FEATURE_ACCESS[feature]?.includes(plan) ?? false;
  };

  return {
    plan,
    isPro,
    isStarter,
    isFree,
    isAdmin,
    canAccess,
    loading,
    profile,
  };
}
