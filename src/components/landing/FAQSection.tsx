import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "./AnimatedSection";

const faqs = [
  {
    q: "Which platforms does CreatorCore support?",
    a: "CreatorCore currently supports Instagram and YouTube with full OAuth integration. TikTok, Twitter/X, Facebook, LinkedIn, and Telegram are coming soon.",
  },
  {
    q: "How does the AI generate insights?",
    a: "Our AI analyzes your content performance patterns, audience behavior, posting times, and engagement trends using a combination of rule-based scoring and Gemini AI semantic analysis to generate personalized, actionable recommendations.",
  },
  {
    q: "Is my data secure and private?",
    a: "Absolutely. We use bank-level encryption, OAuth 2.0 for platform connections, and never store your login credentials. We're fully GDPR compliant with a dedicated data deletion option.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes! You can cancel at any time before your next billing cycle. Your access continues until the end of your current billing period. No partial refunds are issued once billing has occurred.",
  },
  {
    q: "What are the pricing plans?",
    a: "We offer three tiers: Free (basic metrics), Starter at ₹1,500/month (7-day analytics, limited scripts), and Pro at ₹3,000/month (full 30-day analytics, unlimited scripts, Nexus Bridge publishing, A/B caption testing, and scheduling). All payments are processed securely via Razorpay.",
  },
  {
    q: "How long does it take to set up?",
    a: "Most creators are up and running in under 60 seconds. Simply create an account, connect your social accounts via OAuth, and your dashboard populates instantly with real data.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major payment methods through Razorpay including UPI, credit/debit cards, net banking, and wallets. All transactions are secured with industry-standard encryption.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-card px-6 border-none"
              >
                <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
}
