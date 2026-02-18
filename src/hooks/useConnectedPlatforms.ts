import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PlatformInfo {
  platform: string;
  platform_username: string | null;
  is_connected: boolean;
  last_synced_at: string | null;
}

export function useConnectedPlatforms() {
  const { user } = useAuth();
  const [hasConnected, setHasConnected] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlatforms = useCallback(async () => {
    if (!user) {
      setHasConnected(false);
      setPlatforms([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("connected_platforms_safe" as any)
      .select("platform, platform_username, is_connected, last_synced_at")
      .eq("user_id", user.id)
      .eq("is_connected", true);

    const list = (data as unknown as PlatformInfo[]) || [];
    setPlatforms(list);
    setHasConnected(list.length > 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  return { hasConnected, platforms, loading, refetch: fetchPlatforms };
}
