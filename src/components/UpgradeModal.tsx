import { Zap, Check, X } from "lucide-react";
import { NavLink } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason?: string;
}

const benefits = [
  "30-day performance trends & deep analytics",
  "Unlimited AI-generated scripts",
  "Advanced hook pattern analysis",
  "Multi-platform repurposing",
  "Priority scheduling & best-time posting",
];

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card gradient-border p-6 max-w-md w-full space-y-5 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-purple">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Unlock Full Power</h3>
            <p className="text-xs text-muted-foreground">
              {reason || "Your trial has ended. Upgrade to keep growing."}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          CreatorCore Pro gives you the complete intelligence layer to make every post count. Stop guessing — let your data drive your decisions.
        </p>

        <div className="space-y-2.5">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{b}</span>
            </div>
          ))}
        </div>

        <NavLink
          to="/dashboard/billing"
          onClick={onClose}
          className="block w-full text-center py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors glow-purple"
        >
          Upgrade Now
        </NavLink>
        <NavLink
          to="/dashboard/billing"
          onClick={onClose}
          className="block w-full text-center py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Compare Plans
        </NavLink>
      </div>
    </div>
  );
}
