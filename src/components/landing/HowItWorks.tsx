import { Link2, Sparkles, Brain, PenTool, Share2, Rocket, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";

const steps = [
  {
    step: 1,
    icon: Link2,
    title: "Connect Your Platforms",
    description: "Link Instagram, YouTube, and more with secure one-click OAuth. Your data starts syncing instantly.",
    detail: "Supports Instagram, YouTube, TikTok (coming soon), and 4 more platforms",
    color: "text-primary",
    bg: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  {
    step: 2,
    icon: Brain,
    title: "Algorithm Lab Analyzes",
    description: "AI processes your content across 7-day and 30-day windows — identifying top posts, engagement trends, and growth patterns.",
    detail: "Real-time analytics with performance metrics and AI-powered insights",
    color: "text-[hsl(var(--neon-cyan))]",
    bg: "bg-[hsl(var(--neon-cyan)/0.1)]",
    borderColor: "border-[hsl(var(--neon-cyan)/0.3)]",
  },
  {
    step: 3,
    icon: PenTool,
    title: "Script Engine Creates",
    description: "Generate platform-optimized scripts with AI — hooks, scene-by-scene breakdowns, captions, CTAs, and trending hashtags.",
    detail: "Tailored for Instagram Reels, YouTube Shorts, and TikTok",
    color: "text-[hsl(var(--neon-purple))]",
    bg: "bg-[hsl(var(--neon-purple)/0.1)]",
    borderColor: "border-[hsl(var(--neon-purple)/0.3)]",
  },
  {
    step: 4,
    icon: Sparkles,
    title: "A/B Test Captions",
    description: "Our 3-layer caption engine scores your copy using rule-based analysis, Gemini AI semantics, and your own historical performance data.",
    detail: "Generates Hook, Story, and CTA-optimized variants with predicted engagement",
    color: "text-[hsl(var(--neon-pink))]",
    bg: "bg-[hsl(var(--neon-pink)/0.1)]",
    borderColor: "border-[hsl(var(--neon-pink)/0.3)]",
  },
  {
    step: 5,
    icon: Share2,
    title: "Publish via Nexus Bridge",
    description: "Upload media, attach your winning caption, select platforms, and publish everywhere from one panel — with optional scheduling.",
    detail: "Direct publishing to Instagram & YouTube with AI caption optimization",
    color: "text-[hsl(var(--neon-cyan))]",
    bg: "bg-[hsl(var(--neon-cyan)/0.1)]",
    borderColor: "border-[hsl(var(--neon-cyan)/0.3)]",
  },
  {
    step: 6,
    icon: Rocket,
    title: "Grow & Repeat",
    description: "Track what works, double down on winning patterns, and watch your engagement and audience grow consistently across every platform.",
    detail: "Data-driven growth loop powered by continuous AI learning",
    color: "text-primary",
    bg: "bg-primary/10",
    borderColor: "border-primary/30",
  },
];

const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } },
};

export function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-muted/30 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How <span className="gradient-text">CreatorCore</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From connecting your first platform to publishing optimized content — here's the complete creator workflow.
          </p>
        </AnimatedSection>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connecting line (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-full h-full bg-gradient-to-b from-primary via-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-pink))] origin-top"
            />
          </div>

          <div className="space-y-8 lg:space-y-12">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                  className={`relative flex flex-col lg:flex-row items-center gap-6 ${
                    isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content card */}
                  <div className={`flex-1 ${isLeft ? "lg:text-right" : "lg:text-left"}`}>
                    <motion.div
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className={`glass-card p-6 border ${step.borderColor} relative overflow-hidden group`}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
                      
                      <div className={`flex items-center gap-3 mb-3 ${isLeft ? "lg:justify-end" : ""}`}>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Step {step.step}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 text-muted-foreground hidden lg:block ${isLeft ? "rotate-180" : ""}`} />
                      </div>

                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{step.description}</p>
                      <p className={`text-xs ${step.color} font-medium`}>{step.detail}</p>
                    </motion.div>
                  </div>

                  {/* Center icon (timeline node) */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                    className="relative z-10 flex-shrink-0"
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center shadow-lg border ${step.borderColor}`}
                    >
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </motion.div>
                  </motion.div>

                  {/* Spacer for opposite side */}
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
