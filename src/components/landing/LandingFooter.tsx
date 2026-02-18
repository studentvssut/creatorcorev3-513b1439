import { Link } from "react-router-dom";
import { Mail, User, MapPin } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Refund Policy", to: "/refund-policy" },
      { label: "Data Deletion", to: "/data-deletion" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/favicon.png" alt="CreatorCore" className="w-7 h-7" />
              <span className="text-lg font-bold gradient-text">CreatorCore</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Analytics & growth intelligence for content creators who want to dominate their niche.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link
                        to={link.to!}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact & Owner Details */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Customer Support</p>
                  <a
                    href="mailto:support@creatorcorev3.com"
                    className="text-sm text-foreground hover:text-primary transition-colors"
                  >
                    support@creatorcorev3.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Owner & Developer</p>
                  <p className="text-sm text-foreground">Om Prakash Kisan</p>
                  <a
                    href="mailto:omprakashkisan223@gmail.com"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    omprakashkisan223@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">India</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CreatorCore. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
           Built for creators who want to grow smarter
          </p>
        </div>
      </div>
    </footer>
  );
}
