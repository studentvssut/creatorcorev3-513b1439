import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, staggerItem } from "./AnimatedSection";

const testimonials = [
  {
    quote: "CreatorCore helped me identify my best-performing content types. My engagement is up 300% in just 2 months!",
    name: "Sarah Martinez",
    handle: "@sarahcreates",
    platform: "Instagram",
    followers: "250K",
    avatar: "SM",
  },
  {
    quote: "The AI insights are game-changing. I finally understand what my audience actually wants to see.",
    name: "James Chen",
    handle: "@jameschenofficial",
    platform: "YouTube",
    followers: "1.2M",
    avatar: "JC",
  },
  {
    quote: "Managing multiple platforms used to be chaos. CreatorCore made it effortless and my growth has been insane.",
    name: "Priya Patel",
    handle: "@priyavibes",
    platform: "TikTok",
    followers: "500K",
    avatar: "PP",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Loved by Creators <span className="gradient-text">Worldwide</span>
          </h2>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              className="glass-card p-6 flex flex-col transition-shadow hover:shadow-lg"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <blockquote className="text-sm leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </blockquote>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--neon-cyan))] flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.handle}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-primary">{t.platform}</div>
                  <div className="text-xs text-muted-foreground">{t.followers}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
