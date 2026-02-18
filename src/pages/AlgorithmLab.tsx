import { useMemo, useState } from "react";
import { Brain, Database, Lock } from "lucide-react";
import { StatsGrid } from "@/components/algorithm-lab/StatsGrid";
import { PerformanceChart } from "@/components/algorithm-lab/PerformanceChart";
import { InsightsPanel } from "@/components/algorithm-lab/InsightsPanel";
import { TopBottomPosts } from "@/components/algorithm-lab/TopBottomPosts";
import { ProInsightPreview } from "@/components/algorithm-lab/ProInsightPreview";
import { DemoBanner } from "@/components/algorithm-lab/DemoBanner";
import { UsageCounter } from "@/components/algorithm-lab/UsageCounter";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { useConnectedPlatforms } from "@/hooks/useConnectedPlatforms";
import { useRealAnalytics } from "@/hooks/useRealAnalytics";
import { generateDemoPosts, analyzePosts } from "@/lib/demo-data";

const AlgorithmLab = () => {
  const [period, setPeriod] = useState<"7d" | "30d">("7d");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { plan, isPro, canAccess, isFree } = useFeatureGate();
  const { hasConnected } = useConnectedPlatforms();
  const { analytics: realAnalytics, hasRealData, loading: realLoading } = useRealAnalytics(period);

  const is30dLocked = period === "30d" && !canAccess("30day_insights");
  const showInsights = canAccess("7day_analytics");

  const demoPosts = useMemo(() => generateDemoPosts(30), []);
  const demoAnalytics = useMemo(() => analyzePosts(demoPosts, period === "7d" ? 7 : 30), [demoPosts, period]);

  const analytics = hasRealData && realAnalytics ? realAnalytics : demoAnalytics;
  const usingRealData = hasRealData && !!realAnalytics;

  // Free users see only basic metrics with upgrade prompt
  if (isFree) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-primary" />
            Algorithm Lab
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Data-backed insights for your content strategy
          </p>
        </div>
        {!hasConnected && <DemoBanner />}
        <StatsGrid analytics={demoAnalytics} />
        <div className="glass-card gradient-border p-8 text-center space-y-4">
          <Lock className="w-10 h-10 text-primary mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Unlock Advanced Analytics</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Upgrade to Starter for 7-day insights or Pro for the full 30-day analytics dashboard with performance trends and AI-powered recommendations.
          </p>
          <button
            onClick={() => setUpgradeOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors glow-purple"
          >
            Upgrade Now
          </button>
        </div>
        <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="Upgrade to unlock analytics insights." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-primary" />
            Algorithm Lab
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Data-backed insights for your content strategy
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          {!isPro && (
            <UsageCounter used={2} limit={3} label="Daily insights" />
          )}
          <div className="flex bg-secondary/60 rounded-lg p-0.5">
            <button
              onClick={() => setPeriod("7d")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === "7d" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => {
                setPeriod("30d");
                if (!canAccess("30day_insights")) setUpgradeOpen(true);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === "30d" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {usingRealData ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
          <Database className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm text-neon-cyan font-medium">
            Showing real data from your connected platforms
          </span>
        </div>
      ) : (
        !hasConnected && <DemoBanner />
      )}

      <StatsGrid analytics={analytics} />
      <PerformanceChart
        period={period}
        analytics={analytics}
        locked={is30dLocked}
        onUpgradeClick={() => setUpgradeOpen(true)}
      />

      {!isPro && (
        <ProInsightPreview onUpgradeClick={() => setUpgradeOpen(true)} />
      )}

      {showInsights && <InsightsPanel analytics={analytics} />}
      <TopBottomPosts analytics={analytics} />

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason={isFree ? "Upgrade to unlock analytics." : undefined}
      />
    </div>
  );
};

export default AlgorithmLab;
