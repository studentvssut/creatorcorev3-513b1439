import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemHealth } from "@/hooks/useSystemHealth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Activity, Webhook, CreditCard, Server } from "lucide-react";

const ADMIN_EMAILS = ["support@creatorcorev3.com", "meta.review@creatorcorev3.com", "omprakashkisan223@gmail.com"];

interface DiagnosticData {
  webhookLastReceived: string | null;
  activeSubscriptions: number;
  recentPosts: number;
}

export default function AdminSystemStatus() {
  const { user, loading: authLoading } = useAuth();
  const { status, latencyMs, lastChecked, refresh } = useSystemHealth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticData | null>(null);
  const [loadingDiag, setLoadingDiag] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? "");

  useEffect(() => {
    if (!isAdmin) return;
    fetchDiagnostics();
  }, [isAdmin]);

  async function fetchDiagnostics() {
    setLoadingDiag(true);
    try {
      // Get most recent subscription update (proxy for webhook activity)
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1);

      const { count: activeSubs } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");

      const { count: recentPosts } = await supabase
        .from("content_posts")
        .select("id", { count: "exact", head: true });

      setDiagnostics({
        webhookLastReceived: subData?.[0]?.updated_at ?? null,
        activeSubscriptions: activeSubs ?? 0,
        recentPosts: recentPosts ?? 0,
      });
    } catch {
      // Silently handle
    } finally {
      setLoadingDiag(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([refresh(), fetchDiagnostics()]);
    setRefreshing(false);
  }

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const statusColors: Record<string, string> = {
    operational: "text-emerald-500",
    delayed: "text-yellow-500",
    issue: "text-red-500",
    checking: "text-muted-foreground",
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">System Diagnostics</h1>
            <p className="text-sm text-muted-foreground">Admin-only system health overview</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Health Overview */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            icon={<Activity className="w-5 h-5 text-primary" />}
            title="API Status"
            value={status.charAt(0).toUpperCase() + status.slice(1)}
            valueClass={statusColors[status]}
            sub={lastChecked ? `Checked ${lastChecked.toLocaleTimeString()}` : "—"}
          />
          <Card
            icon={<Server className="w-5 h-5 text-primary" />}
            title="Response Time"
            value={latencyMs !== null ? `${latencyMs}ms` : "—"}
            valueClass={
              latencyMs === null ? "" : latencyMs < 1000 ? "text-emerald-500" : latencyMs < 2000 ? "text-yellow-500" : "text-red-500"
            }
            sub="Edge function latency"
          />
        </div>

        {/* Diagnostics */}
        {loadingDiag ? (
          <div className="text-center text-sm text-muted-foreground py-8">Loading diagnostics…</div>
        ) : diagnostics ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card
              icon={<Webhook className="w-5 h-5 text-primary" />}
              title="Last Webhook Activity"
              value={
                diagnostics.webhookLastReceived
                  ? new Date(diagnostics.webhookLastReceived).toLocaleString()
                  : "None recorded"
              }
              sub="Subscription table last update"
            />
            <Card
              icon={<CreditCard className="w-5 h-5 text-primary" />}
              title="Active Subscriptions"
              value={String(diagnostics.activeSubscriptions)}
              sub="Currently active plans"
            />
            <Card
              icon={<Activity className="w-5 h-5 text-primary" />}
              title="Total Posts Tracked"
              value={String(diagnostics.recentPosts)}
              sub="Content posts in system"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  value,
  valueClass = "",
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  valueClass?: string;
  sub?: string;
}) {
  return (
    <div className="glass-card p-5 space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {title}
      </div>
      <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
