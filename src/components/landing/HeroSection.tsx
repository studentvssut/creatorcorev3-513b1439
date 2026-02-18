import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const platformLogos = [
  { name: "Instagram", color: "from-[#f09433] via-[#e6683c] to-[#dc2743]" },
  { name: "YouTube", color: "from-[#FF0000] to-[#CC0000]" },
  { name: "TikTok", color: "from-[#00f2ea] to-[#ff0050]" },
  { name: "Facebook", color: "from-[#1877F2] to-[#0C5DC7]" },
];

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-[hsl(var(--neon-purple)/0.08)] blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-[10%] w-[400px] h-[400px] rounded-full bg-[hsl(var(--neon-cyan)/0.06)] blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-[30%] w-[300px] h-[300px] rounded-full bg-[hsl(var(--neon-pink)/0.05)] blur-[100px]"
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center relative z-10">
        {/* Left content */}
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--neon-purple)/0.6)]"
            />
            <span className="text-sm font-medium text-foreground/80">Trusted by 10,000+ Creators</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-6"
          >
            Master Your Content Empire{" "}
            <span className="gradient-text">Across Every Platform</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed"
          >
            Unified analytics, AI-powered insights, and seamless management for Instagram, YouTube, TikTok, and Facebook creators.
          </motion.p>

          {/* Platform logos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 mb-8"
          >
            {platformLogos.map((p, i) => (
              <motion.div
                key={p.name}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs font-bold shadow-lg`}
              >
                {p.name[0]}
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-wrap items-center gap-4 mb-6"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-[hsl(var(--neon-cyan))] hover:opacity-90 text-primary-foreground px-8 text-base shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
              asChild
            >
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 text-base group hover:border-primary/50 transition-all hover:-translate-y-0.5"
              asChild
            >
              <a href="#features">
                <Play className="mr-2 w-4 h-4 group-hover:text-primary transition-colors" />
                Watch Demo
              </a>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap"
          >
            <span>✓ Free plan available</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>✓ Cancel anytime</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>✓ GDPR Compliant</span>
          </motion.p>
        </div>

        {/* Right side - Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40, rotateY: -5 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Browser chrome */}
            <div className="glass-card p-1 glow-purple shadow-2xl shadow-primary/10">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(40,80%,50%)]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(120,50%,50%)]/60" />
                <div className="ml-3 flex-1 h-5 rounded bg-muted/50" />
              </div>
              {/* Dashboard content mock */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {["Views", "Engagement", "Followers"].map((label, i) => (
                    <div key={label} className="rounded-lg bg-muted/30 border border-border/30 p-3">
                      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
                      <div className="text-lg font-bold gradient-text">
                        {["2.4M", "8.7%", "125K"][i]}
                      </div>
                      <div className="text-[10px] text-[hsl(var(--neon-cyan))]">
                        {["+12%", "+3.2%", "+8%"][i]} ↑
                      </div>
                    </div>
                  ))}
                </div>
                {/* Chart mock */}
                <div className="rounded-lg bg-muted/20 border border-border/30 p-3 h-32 flex items-end gap-1">
                  {[40, 55, 35, 70, 60, 80, 65, 90, 75, 95, 85, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                      className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary/80"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/20 border border-border/30 p-3 h-16" />
                  <div className="rounded-lg bg-muted/20 border border-border/30 p-3 h-16" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating stat cards */}
          <motion.div
            animate={{ y: [0, -8, 0], x: [0, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -top-4 -right-4 glass-card px-4 py-2.5 glow-purple shadow-lg"
          >
            <div className="text-[10px] text-muted-foreground">Posts Analyzed</div>
            <div className="text-lg font-bold gradient-text">50M+</div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 6, 0], x: [0, -4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-4 -left-4 glass-card px-4 py-2.5 glow-cyan shadow-lg"
          >
            <div className="text-[10px] text-muted-foreground">Avg Growth</div>
            <div className="text-lg font-bold text-[hsl(var(--neon-cyan))]">+500%</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
