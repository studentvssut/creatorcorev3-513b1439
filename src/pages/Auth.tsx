import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { appUrl } from "@/lib/redirect";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, User, ArrowRight, Loader2, BarChart3, Sparkles, Globe } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: appUrl("/dashboard"),
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Check your email to verify your account!");
      }
    } catch (error: any) {
      const msg = error.message?.includes("Invalid login")
        ? "Incorrect email or password. Please try again."
        : error.message?.includes("Email not confirmed")
        ? "Please verify your email before signing in."
        : error.message?.includes("already registered")
        ? "This email is already registered. Try signing in instead."
        : error.message || "Authentication failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-fade-in">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">Signing you in…</p>
          <p className="text-xs text-muted-foreground">Please wait while we authenticate your account.</p>
        </div>
      )}

      {/* Left panel — decorative (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-card/40">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[hsl(var(--neon-purple)/0.15)] blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-[hsl(var(--neon-cyan)/0.12)] blur-[80px] animate-pulse [animation-delay:1s]" />
        <div className="absolute top-2/3 left-1/3 w-48 h-48 rounded-full bg-[hsl(var(--neon-pink)/0.1)] blur-[70px] animate-pulse [animation-delay:2s]" />

        <div className="relative z-10 max-w-md px-12 space-y-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="CreatorCore" className="w-12 h-12 rounded-2xl" />
            <span className="text-3xl font-bold gradient-text tracking-tight">CreatorCore</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground leading-tight">
              Decode your <br />
              <span className="gradient-text">content performance</span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              AI-powered analytics that help creators understand what works, craft better content, and grow faster.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-4">
            {[
              { icon: BarChart3, label: "Algorithm Lab", desc: "Deep-dive analytics" },
              { icon: Sparkles, label: "Script Engine", desc: "AI-generated scripts" },
              { icon: Globe, label: "Nexus Bridge", desc: "Cross-platform publishing" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        {/* Subtle background glow on mobile */}
        <div className="lg:hidden absolute top-10 right-10 w-64 h-64 rounded-full bg-[hsl(var(--neon-purple)/0.08)] blur-[80px]" />
        <div className="lg:hidden absolute bottom-20 left-0 w-48 h-48 rounded-full bg-[hsl(var(--neon-cyan)/0.06)] blur-[60px]" />

        <div className="w-full max-w-[420px] relative z-10 space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2.5">
              <img src="/favicon.png" alt="CreatorCore" className="w-10 h-10 rounded-xl" />
              <span className="text-2xl font-bold gradient-text">CreatorCore</span>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Sign in to access your creator dashboard."
                : "Start analyzing your content performance today."}
            </p>
          </div>

          {/* Auth Card */}
          <div className="glass-card gradient-border p-6 sm:p-7 space-y-5">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 glow-purple mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>

          {/* Footer */}
          <p className="text-center text-[11px] text-muted-foreground/60">
            By continuing you agree to our{" "}
            <a href="/terms" className="underline underline-offset-2 hover:text-muted-foreground">Terms</a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-muted-foreground">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
