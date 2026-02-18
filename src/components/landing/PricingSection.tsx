import { useState } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, staggerItem } from "./AnimatedSection";

const plans = [
  {
    name: "Free",
    price: "₹0",
    badge: null,
    features: [
      "Basic metrics overview",
      "Connect up to 2 platforms",
      "Demo data preview",
      "Community support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Starter",
    price: "₹1,500",
    badge: null,
    features: [
      "7-day analytics dashboard",
      "All platform connections",
      "Limited script generation",
      "Performance trends & charts",
      "Email support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹3,000",
    badge: "Recommended",
    features: [
      "Full 30-day analytics",
      "Unlimited script generation",
      "Nexus Bridge publishing",
      "AI-optimized captions",
      "A/B caption testing engine",
      "Content scheduling",
      "Priority support",
    ],
    cta: "Get Started",
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Choose Your <span className="gradient-text">Growth Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-2">Simple pricing, powerful features. Cancel anytime.</p>
          <p className="text-sm text-muted-foreground">All paid plans billed monthly via Razorpay</p>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              className={`glass-card p-6 relative overflow-hidden transition-shadow ${
                plan.highlight
                  ? "glow-purple shadow-xl shadow-primary/10 ring-1 ring-primary/30"
                  : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-[hsl(var(--neon-cyan))] text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-xl font-bold mb-4">{plan.name}</h3>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "₹0" && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-[hsl(var(--neon-cyan))] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlight
                    ? "bg-gradient-to-r from-primary to-[hsl(var(--neon-cyan))] hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20"
                    : ""
                }`}
                variant={plan.highlight ? "default" : "outline"}
                asChild
              >
                <Link to="/auth">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
