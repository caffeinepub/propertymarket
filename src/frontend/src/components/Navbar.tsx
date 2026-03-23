import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, MoreVertical, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

function OmniDotMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChatClick = () => {
    setOpen(false);
    const win = window as unknown as Record<string, unknown>;
    if (typeof win.OmniDim === "object" && win.OmniDim !== null) {
      const omni = win.OmniDim as Record<string, unknown>;
      if (typeof omni.open === "function") {
        (omni.open as () => void)();
        return;
      }
    }
    const iframe = document.querySelector(
      "iframe[src*='omnidim.io']",
    ) as HTMLIFrameElement | null;
    if (iframe) {
      iframe.style.setProperty(
        "display",
        iframe.style.display === "none" ? "block" : "none",
        "important",
      );
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        aria-label="More options"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "6px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          color: "#555",
        }}
      >
        <MoreVertical size={22} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: "180px",
            zIndex: 9999,
            padding: "8px",
          }}
        >
          <button
            type="button"
            onClick={handleChatClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "10px 12px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#222",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <img
              src="/assets/generated/omnidim-robot-icon-transparent.dim_100x100.png"
              alt="AI Agent"
              style={{ width: "28px", height: "28px", borderRadius: "50%" }}
            />
            AI Agent Chat
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { data: profile } = useGetCallerUserProfile();
  const router = useRouter();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    router.navigate({ to: "/" });
  };

  const navLinks = [
    { label: "Buy", href: "/?type=house" },
    { label: "Rent", href: "/?type=rent" },
    { label: "Sell", href: "/dashboard" },
    { label: "Agents", href: "/" },
    { label: "Guides", href: "/" },
    { label: "About Us", href: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0"
            data-ocid="nav.link"
          >
            <img
              src="/assets/uploads/1774244954811-1.png"
              alt="PropertyMarket"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                data-ocid="nav.link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons + 3-dot menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/create-listing">
                  <Button
                    size="sm"
                    className="bg-primary text-white hover:bg-primary/90"
                    data-ocid="nav.primary_button"
                  >
                    Post Property
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid="nav.secondary_button"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Avatar
                  className="w-8 h-8 cursor-pointer"
                  onClick={handleLogout}
                >
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {profile?.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <Link to="/create-listing">
                  <Button
                    size="sm"
                    className="bg-primary text-white hover:bg-primary/90"
                    data-ocid="nav.primary_button"
                  >
                    Post Property
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid="nav.secondary_button"
                  >
                    Sign In / Register
                  </Button>
                </Link>
              </>
            )}
            {/* 3-dot menu with AI Agent */}
            <OmniDotMenu />
          </div>

          {/* Mobile: 3-dot menu + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <OmniDotMenu />
            <button
              type="button"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link to="/create-listing">
                    <Button className="w-full bg-primary text-white" size="sm">
                      Post Property
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/create-listing">
                    <Button className="w-full bg-primary text-white" size="sm">
                      Post Property
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In / Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
