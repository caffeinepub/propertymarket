import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Eye,
  LayoutDashboard,
  LogOut,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteListing,
  useGetCallerUserProfile,
  useGetMyListings,
} from "../hooks/useQueries";

function formatPrice(price: bigint): string {
  const num = Number(price);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: profile } = useGetCallerUserProfile();
  const { data: listings, isLoading } = useGetMyListings();
  const deleteListing = useDeleteListing();

  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center" data-ocid="dashboard.error_state">
            <p className="text-2xl font-bold text-foreground mb-2">
              Please Sign In
            </p>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your dashboard.
            </p>
            <Link to="/login">
              <Button className="bg-primary text-white">Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteListing.mutateAsync(id);
      toast.success("Listing deleted successfully.");
    } catch {
      toast.error("Failed to delete listing.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <h1 className="text-2xl font-bold text-foreground font-display">
                  My Dashboard
                </h1>
              </div>
              {profile && (
                <p className="text-muted-foreground text-sm">
                  Welcome back,{" "}
                  <span className="font-medium text-foreground">
                    {profile.name}
                  </span>{" "}
                  · {profile.email}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Link to="/create-listing">
                <Button
                  className="bg-primary text-white hover:bg-primary/90"
                  data-ocid="dashboard.primary_button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Property
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-ocid="dashboard.secondary_button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-2xl font-bold text-foreground">
                {listings?.length ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Inquiries</p>
            </div>
          </div>

          {/* Listings */}
          <h2 className="text-lg font-semibold text-foreground mb-4">
            My Properties
          </h2>

          {isLoading ? (
            <div className="space-y-4" data-ocid="dashboard.loading_state">
              {(["a", "b", "c"] as const).map((k) => (
                <Skeleton key={k} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : !listings || listings.length === 0 ? (
            <div
              className="text-center py-20 bg-card border border-border rounded-2xl"
              data-ocid="dashboard.empty_state"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                No listings yet
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                Create your first property listing to get started.
              </p>
              <Link to="/create-listing">
                <Button className="bg-primary text-white">
                  Post Your First Property
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4" data-ocid="dashboard.list">
              {listings.map((listing, i) => (
                <motion.div
                  key={listing.id.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`dashboard.item.${i + 1}`}
                >
                  <Card className="border border-border bg-card hover:shadow-card transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className="text-xs text-white"
                              style={{
                                backgroundColor:
                                  listing.propertyType.toLowerCase() === "plot"
                                    ? "#e53935"
                                    : "#1E88E5",
                              }}
                            >
                              {listing.propertyType}
                            </Badge>
                            <h3 className="font-semibold text-foreground text-sm truncate">
                              {listing.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <MapPin className="w-3 h-3" />
                            <span>{listing.location}</span>
                          </div>
                          <p className="text-base font-bold text-foreground">
                            {formatPrice(listing.price)}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Link
                            to="/property/$id"
                            params={{ id: listing.id.toString() }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid={`dashboard.edit_button.${i + 1}`}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white"
                                data-ocid={`dashboard.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent data-ocid="dashboard.dialog">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Listing?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove{" "}
                                  <strong>{listing.title}</strong> from
                                  PropMarket. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="dashboard.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(listing.id)}
                                  className="bg-destructive text-white"
                                  data-ocid="dashboard.confirm_button"
                                >
                                  {deletingId === listing.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
