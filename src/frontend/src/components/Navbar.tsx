import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
  BookmarkCheck,
  Home,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Plus,
  Search,
  User,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetSavedListings,
} from "../hooks/useQueries";

function formatPrice(price: bigint): string {
  const num = Number(price);
  if (num >= 10_000_000) return `\u20B9${(num / 10_000_000).toFixed(1)} Cr`;
  if (num >= 100_000) return `\u20B9${(num / 100_000).toFixed(1)} L`;
  return `\u20B9${num.toLocaleString("en-IN")}`;
}

export default function Navbar() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { data: profile } = useGetCallerUserProfile();
  const { data: savedListings } = useGetSavedListings();
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
    <header className="sticky top-0 z-50 bg-[#0D1B3E] border-b border-[#1a2d5a] shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14">
          {/* PB Logo */}
          <Link to="/" className="flex items-center shrink-0 gap-2">
            <div className="relative flex items-center justify-center w-10 h-10">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400 opacity-60" />
              {/* Inner gradient circle */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                <span className="text-[#0D1B3E] font-extrabold text-sm tracking-tight leading-none">
                  PB
                </span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-white font-bold text-sm tracking-wide">
                Property
              </span>
              <span className="text-yellow-400 font-bold text-sm tracking-wide -mt-1">
                Market
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Home */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center px-2 sm:px-4 py-1 rounded-lg text-xs font-medium transition-colors gap-0.5 ${
                isActive("/")
                  ? "text-yellow-400 bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              data-ocid="nav.link"
            >
              <Home
                className={`w-5 h-5 ${isActive("/") ? "stroke-yellow-400" : ""}`}
              />
              <span>Home</span>
            </Link>

            {/* Search */}
            <button
              type="button"
              onClick={handleSearchClick}
              className="flex flex-col items-center justify-center px-2 sm:px-4 py-1 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors gap-0.5"
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
                  ? "text-yellow-400 bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              data-ocid="nav.link"
            >
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#0D1B3E]" />
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
                    ? "text-yellow-400 bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                data-ocid="nav.button"
              >
                <div className="w-6 h-6 rounded-full bg-yellow-400/20 border border-yellow-400/50 flex items-center justify-center">
                  <span className="text-yellow-400 text-xs font-bold">
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
                    ? "text-yellow-400 bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                data-ocid="nav.link"
              >
                <User
                  className={`w-5 h-5 ${isActive("/login") ? "stroke-yellow-400" : ""}`}
                />
                <span>Sign In</span>
              </Link>
            )}

            {/* 3-dot dropdown - only when authenticated */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                    data-ocid="nav.open_modal_button"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64"
                  data-ocid="nav.dropdown_menu"
                >
                  {/* Saved Properties Header */}
                  <div className="px-3 py-2 flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Saved Properties
                    </span>
                  </div>

                  {/* Saved listings list */}
                  {!savedListings || savedListings.length === 0 ? (
                    <div
                      className="px-3 py-3 text-xs text-muted-foreground italic"
                      data-ocid="nav.empty_state"
                    >
                      No saved properties yet
                    </div>
                  ) : (
                    savedListings.slice(0, 5).map((listing, i) => (
                      <DropdownMenuItem
                        key={listing.id.toString()}
                        asChild
                        data-ocid={`nav.item.${i + 1}`}
                      >
                        <Link
                          to="/property/$id"
                          params={{ id: listing.id.toString() }}
                          className="flex flex-col items-start gap-0.5 cursor-pointer px-3 py-2"
                        >
                          <span className="text-sm font-medium line-clamp-1 text-foreground">
                            {listing.title}
                          </span>
                          <span className="text-xs text-primary font-semibold">
                            {formatPrice(listing.price)}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}

                  <DropdownMenuSeparator />

                  {/* Dashboard */}
                  <DropdownMenuItem
                    onClick={() => router.navigate({ to: "/dashboard" })}
                    className="flex items-center gap-2 cursor-pointer"
                    data-ocid="nav.link"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </DropdownMenuItem>

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500"
                    data-ocid="nav.button"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
