import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Home, Plus, Search, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function Navbar() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { data: profile } = useGetCallerUserProfile();
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    router.navigate({ to: "/" });
  };

  const handleSearchClick = () => {
    if (router.state.location.pathname !== "/") {
      router.navigate({ to: "/" });
      setTimeout(() => {
        const el = document.getElementById("search-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      const el = document.getElementById("search-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/assets/uploads/1774244954811-1.png"
              alt="PropertyMarket"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Nav Items - shown on all screen sizes */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Home */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center px-2 sm:px-4 py-1 rounded-lg text-xs font-medium transition-colors gap-0.5 ${
                isActive("/")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              data-ocid="nav.link"
            >
              <Home
                className={`w-5 h-5 ${isActive("/") ? "fill-primary/20 stroke-primary" : ""}`}
              />
              <span>Home</span>
            </Link>

            {/* Search */}
            <button
              type="button"
              onClick={handleSearchClick}
              className="flex flex-col items-center justify-center px-2 sm:px-4 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors gap-0.5"
              data-ocid="nav.button"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>

            {/* Post */}
            <Link
              to={isAuthenticated ? "/create-listing" : "/login"}
              className={`flex flex-col items-center justify-center px-2 sm:px-4 py-1 rounded-lg text-xs font-medium transition-colors gap-0.5 ${
                isActive("/create-listing")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              data-ocid="nav.link"
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span>Post</span>
            </Link>

            {/* Profile / Sign In */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => router.navigate({ to: "/dashboard" })}
                className={`flex flex-col items-center justify-center px-2 sm:px-4 py-1 rounded-lg text-xs font-medium transition-colors gap-0.5 ${
                  isActive("/dashboard")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                data-ocid="nav.button"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">
                    {profile?.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                </div>
                <span>Profile</span>
              </button>
            ) : (
              <Link
                to="/login"
                className={`flex flex-col items-center justify-center px-2 sm:px-4 py-1 rounded-lg text-xs font-medium transition-colors gap-0.5 ${
                  isActive("/login")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                data-ocid="nav.link"
              >
                <User
                  className={`w-5 h-5 ${isActive("/login") ? "fill-primary/20 stroke-primary" : ""}`}
                />
                <span>Sign In</span>
              </Link>
            )}

            {/* Logout for desktop - only when authenticated */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:flex flex-col items-center justify-center px-3 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors gap-0.5"
              >
                <span className="text-xs">Logout</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
