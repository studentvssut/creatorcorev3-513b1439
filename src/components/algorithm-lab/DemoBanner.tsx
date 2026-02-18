import { Info, Link2 } from "lucide-react";
import { NavLink } from "react-router-dom";

export function DemoBanner() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/8 border border-primary/20">
      <Info className="w-4 h-4 text-primary flex-shrink-0" />
      <p className="text-xs text-muted-foreground flex-1">
        <span className="font-semibold text-foreground">Demo data</span> — These insights are based on sample data.{" "}
        <NavLink to="/connect-platforms" className="text-primary hover:underline inline-flex items-center gap-1">
          Connect your platforms <Link2 className="w-3 h-3" />
        </NavLink>{" "}
        to see your real performance.
      </p>
    </div>
  );
}
