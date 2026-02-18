import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import {
  Brain,
  PenTool,
  Share2,
  CreditCard,
  Link2,
  Zap,
  X,
  LogOut,
  Crown,
  Shield,
} from "lucide-react";

const navItems = [
  { title: "Algorithm Lab", path: "/dashboard", icon: Brain },
  { title: "Script Engine", path: "/dashboard/script-engine", icon: PenTool },
  { title: "Nexus Bridge", path: "/dashboard/nexus-bridge", icon: Share2 },
  { title: "Connect Platforms", path: "/dashboard/connect-platforms", icon: Link2 },
  { title: "Billing & Plans", path: "/dashboard/billing", icon: CreditCard },
];

const planBadge: Record<string, { label: string; className: string; icon: typeof Crown }> = {
  free: { label: "Free", className: "bg-muted text-muted-foreground", icon: Shield },
  starter: { label: "Starter", className: "bg-primary/15 text-primary", icon: Zap },
  pro: { label: "Pro", className: "bg-neon-cyan/15 text-neon-cyan", icon: Crown },
};

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { plan, isPro } = useFeatureGate();

  const badge = planBadge[plan] || planBadge.free;
  const BadgeIcon = badge.icon;

  return (
    <aside
      className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-auto
        h-screen w-[260px] flex-shrink-0
        bg-[hsl(var(--sidebar-background))] border-r border-border/40
        flex flex-col
        transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.png" alt="CreatorCore" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-bold gradient-text">CreatorCore</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Plan Badge */}
      <div className="px-4 pb-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${badge.className}`}>
          <BadgeIcon className="w-3.5 h-3.5" />
          {badge.label} Plan
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "bg-primary/15 text-primary glow-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }
              `}
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-primary" : ""}`} />
              <span>{item.title}</span>
              {isActive && <div className="ml-auto neon-dot" />}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Upgrade */}
      <div className="p-4 space-y-3">
        {/* Upgrade CTA - only show for non-pro users */}
        {!isPro && (
          <div className="glass-card gradient-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm font-semibold text-foreground">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlock 30-day insights, unlimited scripts & advanced publishing.
            </p>
            <NavLink
              to="/dashboard/billing"
              onClick={onClose}
              className="block w-full text-center py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View Plans
            </NavLink>
          </div>
        )}

        {/* Legal links */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
          <NavLink to="/privacy" onClick={onClose} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Privacy</NavLink>
          <NavLink to="/terms" onClick={onClose} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Terms</NavLink>
          <NavLink to="/data-deletion" onClick={onClose} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Data Deletion</NavLink>
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {(user.email?.[0] || "C").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
