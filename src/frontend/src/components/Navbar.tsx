import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

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

          {/* CTA Buttons */}
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
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
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
