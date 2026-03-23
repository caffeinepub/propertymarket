import { Home, Mail, Phone, Youtube } from "lucide-react";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";

const socialLinks = [
  { Icon: SiFacebook, label: "Facebook", href: "https://facebook.com" },
  { Icon: SiX, label: "X (Twitter)", href: "https://x.com" },
  { Icon: SiInstagram, label: "Instagram", href: "https://instagram.com" },
  { Icon: SiLinkedin, label: "LinkedIn", href: "https://linkedin.com" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      style={{ backgroundColor: "oklch(0.25 0.01 260)" }}
      className="text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl">PropMarket</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Your trusted platform for buying, selling, and renting properties.
              Find your perfect home today.
            </p>
            <div className="flex gap-3 mt-5">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-white/50 mb-4">
              Discover
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                "Houses for Sale",
                "Plots & Land",
                "Apartments",
                "Commercial",
                "New Developments",
              ].map((item) => (
                <li key={item}>
                  <a href="/" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-white/50 mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              {["About Us", "Our Team", "Careers", "Press", "Contact"].map(
                (item) => (
                  <li key={item}>
                    <a href="/" className="hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-white/50 mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a
                  href="tel:+917062824444"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 text-white/50" />
                  +91 7062824444
                </a>
              </li>
              <li>
                <a
                  href="mailto:prembhati04444@gmail.com"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0 text-white/50" />
                  prembhati04444@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com/channel/UCfcmjN4UqPsM7A0IzTX8OYA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Youtube className="w-4 h-4 shrink-0 text-white/50" />
                  YouTube Channel
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
          <p>
            © {currentYear}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/70"
            >
              caffeine.ai
            </a>
          </p>
          <p>All rights reserved. PropMarket Inc.</p>
        </div>
      </div>
    </footer>
  );
}
