import { Link, useRouter } from "@tanstack/react-router";
import { Home, Plus, Search, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface BottomNavProps {
  onSearchClick?: () => void;
}

export default function BottomNav({ onSearchClick }: BottomNavProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border shadow-lg"
      data-ocid="bottom_nav.panel"
    >
      <div className="flex items-stretch h-16">
        {/* Home */}
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
            isActive("/")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="bottom_nav.link"
        >
          <Home
            className={`w-5 h-5 ${
              isActive("/") ? "fill-primary/20 stroke-primary" : ""
            }`}
          />
          <span>Home</span>
        </Link>

        {/* Search */}
        <button
          type="button"
          onClick={() => {
            if (onSearchClick) {
              onSearchClick();
            } else {
              router.navigate({ to: "/" });
              setTimeout(() => {
                const el = document.getElementById("search-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }
          }}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="bottom_nav.button"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>

        {/* Post — only if logged in */}
        {isAuthenticated && (
          <Link
            to="/create-listing"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
              isActive("/create-listing")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="bottom_nav.link"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center -mt-3 shadow-md">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="mt-0.5">Post</span>
          </Link>
        )}

        {/* Profile */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
            isActive("/dashboard") || isActive("/login")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="bottom_nav.link"
        >
          <User
            className={`w-5 h-5 ${
              isActive("/dashboard") || isActive("/login")
                ? "fill-primary/20 stroke-primary"
                : ""
            }`}
          />
          <span>{isAuthenticated ? "Profile" : "Sign In"}</span>
        </Link>
      </div>
    </nav>
  );
}
