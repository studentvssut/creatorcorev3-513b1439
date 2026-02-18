import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsResult } from "@/lib/demo-data";

interface PerformanceChartProps {
  period: "7d" | "30d";
  analytics: AnalyticsResult;
  locked?: boolean;
  onUpgradeClick?: () => void;
}

export function PerformanceChart({ period, analytics, locked, onUpgradeClick }: PerformanceChartProps) {
  return (
    <div className="glass-card gradient-border p-5 space-y-4 animate-slide-up relative">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Performance Trends</h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neon-cyan" />
            Likes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neon-pink" />
            Saves
          </span>
        </div>
      </div>

      <div className={locked ? "blur-sm pointer-events-none select-none" : ""}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={analytics.dailyTrend}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(265 90% 65%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(265 90% 65%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="likesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(175 85% 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(175 85% 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="savesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(330 85% 60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(330 85% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(250 12% 18%)" />
            <XAxis dataKey="day" tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(250 12% 10%)",
                border: "1px solid hsl(250 12% 18%)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "hsl(220 20% 92%)",
              }}
            />
            <Area type="monotone" dataKey="views" stroke="hsl(265 90% 65%)" fill="url(#viewsGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="likes" stroke="hsl(175 85% 55%)" fill="url(#likesGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="saves" stroke="hsl(330 85% 60%)" fill="url(#savesGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl">
          <div className="glass-card p-4 text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">30-Day Trends</p>
            <p className="text-xs text-muted-foreground">Upgrade to Pro to unlock extended analytics</p>
            <button
              onClick={onUpgradeClick}
              className="inline-block text-xs font-medium text-primary hover:underline"
            >
              Upgrade →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
