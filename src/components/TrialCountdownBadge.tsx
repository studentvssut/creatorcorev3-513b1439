import { Clock, Zap } from "lucide-react";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { NavLink } from "react-router-dom";

export function TrialCountdownBadge() {
  const { profile, isPro, isFree } = useFeatureGate();

  if (!profile || isPro) return null;

  if (isFree) {
    return (
      <NavLink
        to="/dashboard/billing"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
      >
        <Zap className="w-3.5 h-3.5" />
        Upgrade Plan
      </NavLink>
    );
  }

  if (!profile.isTrialActive) {
    return (
      <NavLink
        to="/dashboard/billing"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
      >
        <Zap className="w-3.5 h-3.5" />
        Trial expired — Upgrade
      </NavLink>
    );
  }

  return (
    <NavLink
      to="/dashboard/billing"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
    >
      <Clock className="w-3.5 h-3.5" />
      {profile.trialDaysLeft} day{profile.trialDaysLeft !== 1 ? "s" : ""} left
    </NavLink>
  );
}
