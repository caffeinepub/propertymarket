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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Edit,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PropertyListing } from "../backend";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteListing,
  useGetCallerUserProfile,
  useGetInquiriesForListing,
  useGetMyListings,
  useUpdateListing,
} from "../hooks/useQueries";

function formatPrice(price: bigint): string {
  const num = Number(price);
  if (num >= 10_000_000) return `\u20B9${(num / 10_000_000).toFixed(2)} Crore`;
  if (num >= 100_000) return `\u20B9${(num / 100_000).toFixed(2)} Lakh`;
  if (num >= 1_000) return `\u20B9${(num / 1_000).toFixed(0)},000`;
  return `\u20B9${num.toLocaleString("en-IN")}`;
}

function formatTimestamp(ts: bigint): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface EditListingModalProps {
  listing: PropertyListing;
  open: boolean;
  onClose: () => void;
}

function EditListingModal({ listing, open, onClose }: EditListingModalProps) {
  const updateListing = useUpdateListing();
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(listing.price.toString());
  const [propertyType, setPropertyType] = useState(listing.propertyType);
  const [location, setLocation] = useState(listing.location);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !description.trim() ||
      !price ||
      !propertyType ||
      !location.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const priceNum = Number(price.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }
    try {
      await updateListing.mutateAsync({
        listingId: listing.id,
        title: title.trim(),
        description: description.trim(),
        price: BigInt(Math.round(priceNum)),
        propertyType,
        location: location.trim(),
        mediaIds: listing.mediaIds,
      });
      toast.success("Listing updated successfully.");
      onClose();
    } catch {
      toast.error("Failed to update listing.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-lg" data-ocid="edit.dialog">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Property title"
              data-ocid="edit.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Property description"
              rows={3}
              data-ocid="edit.textarea"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-price">Price (₹)</Label>
              <Input
                id="edit-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 5000000"
                data-ocid="edit.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger data-ocid="edit.select">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="plot">Plot / Land</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Area"
              data-ocid="edit.input"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-white"
              disabled={updateListing.isPending}
              data-ocid="edit.save_button"
            >
              {updateListing.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InquiryRow({ listing }: { listing: PropertyListing }) {
  const { data: inquiries, isLoading } = useGetInquiriesForListing(listing.id);
  const [expanded, setExpanded] = useState<bigint | null>(null);

  if (isLoading) {
    return <Skeleton className="h-16 rounded-lg" />;
  }

  if (!inquiries || inquiries.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-foreground truncate">
          {listing.title}
        </h3>
        <Badge variant="secondary" className="text-xs shrink-0">
          {inquiries.length} {inquiries.length === 1 ? "inquiry" : "inquiries"}
        </Badge>
        <span className="text-xs text-muted-foreground ml-auto shrink-0">
          {formatPrice(listing.price)}
        </span>
      </div>
      <div className="space-y-2">
        {inquiries.map((inq, i) => (
          <motion.div
            key={inq.id.toString()}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            data-ocid={`inquiries.item.${i + 1}`}
          >
            <button
              type="button"
              className="w-full text-left bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-green-400 transition-colors"
              onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
            >
              <div className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {inq.buyerName}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatTimestamp(inq.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{inq.buyerPhone}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {inq.message}
                  </p>
                </div>
              </div>
            </button>
            <AnimatePresence>
              {expanded === inq.id && (
                <motion.div
                  key="expanded"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100 bg-[#ECE5DD] overflow-hidden rounded-b-xl"
                >
                  <div className="p-4">
                    <div className="flex justify-end">
                      <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] shadow-sm">
                        <p className="text-sm text-gray-800">{inq.message}</p>
                        <p className="text-[10px] text-gray-500 text-right mt-1">
                          {formatTimestamp(inq.timestamp)} ✓✓
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function InquiriesTab({ listings }: { listings: PropertyListing[] }) {
  if (listings.length === 0) {
    return (
      <div
        className="text-center py-20 bg-card border border-border rounded-2xl"
        data-ocid="inquiries.empty_state"
      >
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-lg font-medium text-foreground mb-2">
          No inquiries yet
        </p>
        <p className="text-muted-foreground text-sm">
          Your messages from buyers will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {listings.map((listing) => (
        <InquiryRow key={listing.id.toString()} listing={listing} />
      ))}
    </div>
  );
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
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(
    null,
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
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
        <BottomNav />
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
    <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
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
              <p className="text-sm text-muted-foreground">My Listings</p>
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

          {/* Tabs */}
          <Tabs defaultValue="properties" data-ocid="dashboard.tab">
            <TabsList className="mb-6">
              <TabsTrigger value="properties" data-ocid="dashboard.tab">
                My Listings
              </TabsTrigger>
              <TabsTrigger value="inquiries" data-ocid="dashboard.tab">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Inquiries
              </TabsTrigger>
            </TabsList>

            {/* My Listings Tab */}
            <TabsContent value="properties">
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
                                      listing.propertyType.toLowerCase() ===
                                      "plot"
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
                              {/* Edit Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-primary border-primary/30 hover:bg-primary hover:text-white"
                                onClick={() => setEditingListing(listing)}
                                data-ocid={`dashboard.edit_button.${i + 1}`}
                              >
                                <Edit className="w-3.5 h-3.5 mr-1" />
                                Edit
                              </Button>
                              {/* Delete Button */}
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
            </TabsContent>

            {/* Inquiries Tab */}
            <TabsContent value="inquiries">
              {isLoading ? (
                <div className="space-y-3" data-ocid="inquiries.loading_state">
                  {(["a", "b", "c"] as const).map((k) => (
                    <Skeleton key={k} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : (
                <InquiriesTab listings={listings ?? []} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <BottomNav />

      {/* Edit Modal */}
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          open={!!editingListing}
          onClose={() => setEditingListing(null)}
        />
      )}
    </div>
  );
}
