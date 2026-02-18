import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { AnalyticsResult, DemoPost, formatNumber } from "@/lib/demo-data";

interface TopBottomPostsProps {
  analytics: AnalyticsResult;
}

function PostRow({ post, avgEng }: { post: DemoPost; avgEng: number }) {
  const eng = post.views > 0 ? (post.likes + post.comments + post.saves) / post.views : 0;
  const deviation = avgEng > 0 ? ((eng - avgEng) / avgEng) * 100 : 0;
  const positive = deviation >= 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
          <p className="text-xs text-muted-foreground">
            {post.platform} · {post.video_duration_seconds}s · {new Date(post.posted_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className="text-sm font-medium text-foreground">{formatNumber(post.views)}</span>
        <div className="flex items-center gap-1">
          {positive ? (
            <TrendingUp className="w-3.5 h-3.5 text-neon-cyan" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          )}
          <span className={`text-xs font-medium ${positive ? "text-neon-cyan" : "text-destructive"}`}>
            {positive ? "+" : ""}{deviation.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function TopBottomPosts({ analytics }: TopBottomPostsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="glass-card gradient-border p-5 space-y-3 animate-slide-up">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-neon-cyan" />
          Top 20% Performing Posts
        </h3>
        <div className="space-y-2">
          {analytics.deviations.above.slice(0, 3).map((post) => (
            <PostRow key={post.id} post={post} avgEng={analytics.avgEngagementRate} />
          ))}
        </div>
      </div>

      <div className="glass-card gradient-border p-5 space-y-3 animate-slide-up">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-destructive" />
          Bottom 20% Performing Posts
        </h3>
        <div className="space-y-2">
          {analytics.deviations.below.slice(0, 3).map((post) => (
            <PostRow key={post.id} post={post} avgEng={analytics.avgEngagementRate} />
          ))}
        </div>
      </div>
    </div>
  );
}
