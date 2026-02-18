import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HealthStatus = "operational" | "delayed" | "issue" | "checking";

interface HealthState {
  status: HealthStatus;
  latencyMs: number | null;
  lastChecked: Date | null;
}

const HEALTH_CHECK_INTERVAL = 60_000; // 60 seconds
const LATENCY_WARN_MS = 2000;

export function useSystemHealth() {
  const [health, setHealth] = useState<HealthState>({
    status: "checking",
    latencyMs: null,
    lastChecked: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const checkHealth = useCallback(async () => {
    const start = performance.now();
    try {
      const { data, error } = await supabase.functions.invoke("health", {
        method: "GET",
      });
      const latencyMs = Math.round(performance.now() - start);

      if (error) {
        setHealth({ status: "issue", latencyMs, lastChecked: new Date() });
        return;
      }

      const status: HealthStatus =
        latencyMs > LATENCY_WARN_MS ? "delayed" : "operational";

      setHealth({ status, latencyMs, lastChecked: new Date() });
    } catch {
      const latencyMs = Math.round(performance.now() - start);
      setHealth({ status: "issue", latencyMs, lastChecked: new Date() });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    intervalRef.current = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkHealth]);

  return { ...health, refresh: checkHealth };
}
