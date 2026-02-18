import { Lock, Sparkles } from "lucide-react";

interface ProInsightPreviewProps {
  onUpgradeClick: () => void;
}

export function ProInsightPreview({ onUpgradeClick }: ProInsightPreviewProps) {
  return (
    <div className="glass-card gradient-border p-5 space-y-3 animate-slide-up relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
          Pro
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Advanced Insight Preview</h3>
      </div>

      <div className="relative">
        <p className="text-sm text-foreground leading-relaxed blur-[3px] select-none pointer-events-none">
          Your videos with numeric hooks posted between 7–9 PM generate 2.4x more saves than your average post.
          Combined with a duration under 8 seconds, this pattern accounts for 67% of your top-performing content.
          Replicating this formula 3x per week could increase your monthly reach by an estimated 40%.
        </p>

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={onUpgradeClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors glow-purple"
          >
            <Lock className="w-3.5 h-3.5" />
            Unlock Pro Insights
          </button>
        </div>
      </div>
    </div>
  );
}
