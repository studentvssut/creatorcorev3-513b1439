import { Brain, PenTool, Share2, Link2, FlaskConical, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, staggerItem } from "./AnimatedSection";

const features = [
  {
    icon: Brain,
    title: "Algorithm Lab",
    description: "Data-backed analytics dashboard with 7-day and 30-day performance insights, engagement trends, and top/bottom post analysis across all platforms.",
    gradient: "from-primary to-[hsl(var(--neon-purple))]",
  },
  {
    icon: PenTool,
    title: "Script Engine",
    description: "AI-powered script generator that creates platform-optimized hooks, scene-by-scene scripts, captions, CTAs, and hashtags tailored to Instagram, YouTube, and TikTok.",
    gradient: "from-[hsl(var(--neon-cyan))] to-primary",
  },
  {
    icon: Share2,
    title: "Nexus Bridge",
    description: "Centralized publishing hub — upload media, write captions, and publish directly to Instagram, YouTube, and TikTok from one panel with scheduling and AI caption optimization.",
    gradient: "from-[hsl(var(--neon-pink))] to-primary",
  },
  {
    icon: Link2,
    title: "Platform Connections",
    description: "One-click OAuth integration for Instagram and YouTube with real-time sync, data refresh, and upcoming support for TikTok, Twitter/X, Facebook, LinkedIn, and Telegram.",
    gradient: "from-primary to-[hsl(var(--neon-cyan))]",
  },
  {
    icon: FlaskConical,
    title: "A/B Caption Testing",
    description: "Pro-tier caption engine combining rule-based scoring, AI semantic analysis via Gemini, and historical learning to generate Hook, Story, and CTA-optimized variants with predicted engagement.",
    gradient: "from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-pink))]",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Personalized recommendations powered by your performance data — identify winning content patterns, optimal posting times, and growth opportunities across every connected platform.",
    gradient: "from-[hsl(var(--neon-pink))] to-[hsl(var(--neon-cyan))]",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Dominate</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Powerful tools designed for ambitious creators who refuse to guess.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={staggerItem}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group glass-card p-6 relative overflow-hidden transition-shadow hover:shadow-xl hover:shadow-primary/5"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} p-[1px] mb-5`}>
                <div className="w-full h-full rounded-[11px] bg-card flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
