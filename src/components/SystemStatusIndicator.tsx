import { useSystemHealth, type HealthStatus } from "@/hooks/useSystemHealth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const statusConfig: Record<HealthStatus, { color: string; label: string; pulse: boolean }> = {
  operational: { color: "bg-emerald-500", label: "Operational", pulse: true },
  delayed: { color: "bg-yellow-500", label: "Delayed", pulse: true },
  issue: { color: "bg-red-500", label: "Service Issue", pulse: false },
  checking: { color: "bg-muted-foreground/50", label: "Checking…", pulse: true },
};

export function SystemStatusIndicator() {
  const { status, latencyMs } = useSystemHealth();
  const config = statusConfig[status];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative flex items-center justify-center w-6 h-6 cursor-default">
          {config.pulse && (
            <span
              className={`absolute inline-flex h-2.5 w-2.5 rounded-full ${config.color} opacity-40 animate-ping`}
            />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${config.color}`} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p className="font-medium">{config.label}</p>
        {latencyMs !== null && (
          <p className="text-muted-foreground">{latencyMs}ms latency</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
