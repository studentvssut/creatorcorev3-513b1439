import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";

export function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <AnimatedSection>
        <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(265,80%,45%)] to-[hsl(var(--neon-cyan))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

          {/* Floating shapes */}
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-8 right-12 w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm hidden md:block"
          />
          <motion.div
            animate={{ y: [8, -8, 8], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute bottom-8 left-12 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hidden md:block"
          />

          <div className="relative z-10 text-center px-8 py-16 sm:py-20">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <Sparkles className="w-8 h-8 text-white/80" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Level Up Your Content Game?
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
              Join 10,000+ creators growing faster with data-driven insights.
            </p>

            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-10 text-base shadow-xl font-semibold"
              asChild
            >
              <Link to="/auth">
                Get Started Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>

            <p className="text-white/60 text-xs mt-4">
              Free plan available • Cancel anytime • Secure payments via Razorpay
            </p>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
