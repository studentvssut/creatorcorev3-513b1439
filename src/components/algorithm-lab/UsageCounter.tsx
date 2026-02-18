import { BarChart3 } from "lucide-react";

interface UsageCounterProps {
  used: number;
  limit: number;
  label: string;
}

export function UsageCounter({ used, limit, label }: UsageCounterProps) {
  const pct = Math.min((used / limit) * 100, 100);
  const isNearLimit = used >= limit - 1;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50">
      <BarChart3 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className={`text-xs font-semibold ${isNearLimit ? "text-destructive" : "text-foreground"}`}>
            {used}/{limit}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all ${isNearLimit ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
