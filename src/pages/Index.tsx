import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import YoutubeSubscribersChart from "@/components/YoutubeSubscribersChart";
import YoutubeViewsChart from "@/components/YoutubeViewsChart";
import { StatCard } from "@/components/StatCard";

export default function Index() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      const { data, error } = await supabase
        .from("performance_metrics")
        .select("metric_date, followers_count, total_views, posts_count")
        .eq("platform", "youtube")
        .order("metric_date", { ascending: true })
        .limit(30);

      if (!error && data) setMetrics(data);
      setLoading(false);
    }

    loadMetrics();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading dashboard…</p>;
  }

  if (!metrics.length) {
    return (
      <div className="text-muted-foreground">
        No analytics yet. Connect your YouTube account to start tracking.
      </div>
    );
  }

  const latest = metrics[metrics.length - 1];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Subscribers"
          value={latest.followers_count.toLocaleString()}
        />
        <StatCard
          title="Total Views"
          value={latest.total_views.toLocaleString()}
        />
        <StatCard
          title="Videos"
          value={latest.posts_count?.toLocaleString() ?? "—"}
        />
      </div>

      {/* Charts */}
      <YoutubeSubscribersChart data={metrics} />
      <YoutubeViewsChart data={metrics} />
    </div>
  );
}
