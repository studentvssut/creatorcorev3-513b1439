import { Zap, Clock, Film, Type, Hash, Target, TrendingUp } from "lucide-react";
import { AnalyticsResult } from "@/lib/demo-data";

interface InsightsPanelProps {
  analytics: AnalyticsResult;
}

export function InsightsPanel({ analytics }: InsightsPanelProps) {
  const insights = [
    {
      icon: Clock,
      title: "Optimal Posting Window",
      text: analytics.bestTimeInsight,
      color: "text-neon-cyan",
    },
    {
      icon: Film,
      title: "Ideal Video Duration",
      text: analytics.bestDurationInsight,
      color: "text-primary",
    },
    {
      icon: Type,
      title: "Hook Effectiveness",
      text: analytics.bestHookInsight,
      color: "text-neon-pink",
    },
    {
      icon: Hash,
      title: "Engagement Rate",
      text: `Your average engagement rate is ${(analytics.avgEngagementRate * 100).toFixed(1)}% across all platforms.`,
      color: "text-neon-cyan",
    },
  ];

  // Generate precise daily commands from analytics
  const bestDuration = analytics.durationClusters[0];
  const bestTime = analytics.postingTimeWindows[0];
  const bestHook = analytics.hookPatterns[0];
  const topPost = analytics.deviations.above[0];

  const dailyCommands = [
    bestTime
      ? `Post between ${bestTime.window} today — your data shows ${(bestTime.avgEngagement * 100).toFixed(0)}% higher engagement in this window`
      : "Post between 7–9 PM today for maximum reach",
    bestHook
      ? `Use a ${bestHook.style} hook — this style drives ${bestHook.avgSaves.toFixed(0)} avg saves per post`
      : "Repeat the hook style from your top-performing reel",
    bestDuration
      ? `Keep video duration ${bestDuration.range.toLowerCase()} — ${bestDuration.count} posts in this range averaged ${(bestDuration.avgEngagement * 100).toFixed(1)}% engagement`
      : "Shorten today's video to under 8 seconds for better retention",
    topPost
      ? `Replicate the format of "${topPost.title}" (${topPost.views.toLocaleString()} views) with a new angle`
      : "Test 3 carousel slides instead of 5 today",
    `Target ${Math.round(analytics.avgEngagementRate * 100 * 1.1 * 10) / 10}% engagement today — ${((analytics.avgEngagementRate * 100 * 0.1)).toFixed(1)}% above your current average`,
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Insights */}
      <div className="glass-card gradient-border p-5 space-y-4 animate-slide-up">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Algorithm Intelligence
        </h3>
        <div className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.title} className="flex gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
              <insight.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${insight.color}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Commands */}
      <div className="glass-card gradient-border p-5 space-y-4 animate-slide-up">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-neon-cyan" />
          Daily Growth Commands
        </h3>
        <div className="space-y-2">
          {dailyCommands.map((cmd, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-foreground leading-relaxed">{cmd}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
