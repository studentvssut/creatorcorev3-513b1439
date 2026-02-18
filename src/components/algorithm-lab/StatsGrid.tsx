import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Bookmark, Activity } from "lucide-react";
import { AnalyticsResult, formatNumber, formatPercent } from "@/lib/demo-data";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
}

function StatCard({ title, value, change, positive, icon: Icon }: StatCardProps) {
  return (
    <div className="glass-card gradient-border p-5 space-y-3 animate-slide-up">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <div className="flex items-center gap-1.5">
          {positive ? (
            <TrendingUp className="w-3.5 h-3.5 text-neon-cyan" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          )}
          <span className={`text-xs font-medium ${positive ? "text-neon-cyan" : "text-destructive"}`}>
            {change}
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  analytics: AnalyticsResult;
}

export function StatsGrid({ analytics }: StatsGridProps) {
  const stats: StatCardProps[] = [
    {
      title: "Total Views",
      value: formatNumber(analytics.totalViews),
      change: formatPercent(analytics.viewsChange),
      positive: analytics.viewsChange >= 0,
      icon: Eye,
    },
    {
      title: "Likes",
      value: formatNumber(analytics.totalLikes),
      change: formatPercent(analytics.likesChange),
      positive: analytics.likesChange >= 0,
      icon: Heart,
    },
    {
      title: "Comments",
      value: formatNumber(analytics.totalComments),
      change: formatPercent(analytics.commentsChange),
      positive: analytics.commentsChange >= 0,
      icon: MessageCircle,
    },
    {
      title: "Saves",
      value: formatNumber(analytics.totalSaves),
      change: formatPercent(analytics.savesChange),
      positive: analytics.savesChange >= 0,
      icon: Bookmark,
    },
    {
      title: "Avg Engagement",
      value: `${(analytics.avgEngagementRate * 100).toFixed(1)}%`,
      change: formatPercent(analytics.viewsChange * 0.3),
      positive: analytics.viewsChange >= 0,
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
