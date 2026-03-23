import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Bath,
  Bed,
  ChevronLeft,
  Heart,
  Mail,
  MapPin,
  Phone,
  Share2,
  Square,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { loadConfig } from "../config";
import { useGetListing } from "../hooks/useQueries";
import { parseMediaId } from "../hooks/useStorageUpload";
import { StorageClient } from "../utils/StorageClient";

function formatPrice(price: bigint): string {
  const num = Number(price);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)},000`;
  return `$${num.toLocaleString()}`;
}

function MediaItem({ mediaId, alt }: { mediaId: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const { type, hash } = parseMediaId(mediaId);

  useEffect(() => {
    loadConfig()
      .then(async (config) => {
        const agent = new HttpAgent({ host: config.backend_host });
        const client = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );
        const directUrl = await client.getDirectURL(hash);
        setUrl(directUrl);
      })
      .catch(() => {});
  }, [hash]);

  if (!url) return <Skeleton className="w-full h-72 rounded-xl" />;

  if (type === "video") {
    return (
      <video
        src={url}
        controls
        className="w-full h-72 rounded-xl object-cover bg-black"
        data-ocid="property.editor"
      >
        <track kind="captions" />
      </video>
    );
  }
  return (
    <img src={url} alt={alt} className="w-full h-72 rounded-xl object-cover" />
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const [liked, setLiked] = useState(false);
  const {
    data: listing,
    isLoading,
    isError,
  } = useGetListing(BigInt(id ?? "0"));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
          <Skeleton className="h-96 rounded-2xl mb-6" />
          <Skeleton className="h-8 w-1/2 mb-3" />
          <Skeleton className="h-5 w-1/3" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center" data-ocid="property.error_state">
            <p className="text-2xl font-bold text-foreground mb-2">
              Listing Not Found
            </p>
            <p className="text-muted-foreground mb-6">
              This property may have been removed.
            </p>
            <Link to="/">
              <Button>Back to Listings</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageMedia = listing.mediaIds.filter((id) => id.startsWith("image:"));
  const videoMedia = listing.mediaIds.filter((id) => id.startsWith("video:"));
  const hasMedia = listing.mediaIds.length > 0;

  const heroImage = imageMedia[0]
    ? undefined
    : listing.propertyType.toLowerCase() === "plot"
      ? "/assets/generated/property-plot-1.dim_800x500.jpg"
      : listing.propertyType.toLowerCase() === "apartment"
        ? "/assets/generated/property-apartment-1.dim_800x500.jpg"
        : "/assets/generated/property-house-1.dim_800x500.jpg";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Listings
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Hero image / media */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative rounded-2xl overflow-hidden mb-6"
              >
                {imageMedia.length > 0 ? (
                  <MediaItem mediaId={imageMedia[0]} alt={listing.title} />
                ) : (
                  <img
                    src={heroImage}
                    alt={listing.title}
                    className="w-full h-80 object-cover rounded-2xl"
                  />
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLiked(!liked)}
                    className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                    />
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>

              {/* Tabs for media */}
              {hasMedia && (
                <Tabs defaultValue="photos" className="mb-6">
                  <TabsList>
                    <TabsTrigger value="photos" data-ocid="property.tab">
                      Photos ({imageMedia.length})
                    </TabsTrigger>
                    <TabsTrigger value="videos" data-ocid="property.tab">
                      Videos ({videoMedia.length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="photos" className="mt-4">
                    {imageMedia.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No photos uploaded.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {imageMedia.map((mid, i) => (
                          <MediaItem
                            key={mid}
                            mediaId={mid}
                            alt={`Photo ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="videos" className="mt-4">
                    {videoMedia.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No videos uploaded.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {videoMedia.map((mid, i) => (
                          <MediaItem
                            key={mid}
                            mediaId={mid}
                            alt={`Video ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}

              {/* Title & Details */}
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-bold text-foreground font-display">
                    {listing.title}
                  </h1>
                  <Badge
                    style={{ backgroundColor: "#1E88E5" }}
                    className="text-white shrink-0"
                  >
                    {listing.propertyType}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}</span>
                </div>
                <p className="text-3xl font-bold text-foreground mt-3">
                  {formatPrice(listing.price)}
                </p>
              </div>

              {/* Property stats */}
              <div className="grid grid-cols-3 gap-4 bg-muted/50 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <Bed className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-sm font-semibold">3</p>
                  <p className="text-xs text-muted-foreground">Bedrooms</p>
                </div>
                <div className="text-center">
                  <Bath className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-sm font-semibold">2</p>
                  <p className="text-xs text-muted-foreground">Bathrooms</p>
                </div>
                <div className="text-center">
                  <Square className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-sm font-semibold">1,240</p>
                  <p className="text-xs text-muted-foreground">Sq Ft</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Sidebar: Contact */}
            <div className="lg:col-span-1">
              <div
                className="bg-card border border-border rounded-2xl p-6 sticky top-24"
                data-ocid="property.card"
              >
                <h3 className="font-semibold text-foreground mb-4">
                  Contact Owner
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {listing.ownerEmail?.[0]?.toUpperCase() ?? "O"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Property Owner
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.ownerEmail}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    data-ocid="property.primary_button"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Request Callback
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    data-ocid="property.secondary_button"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
                <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground">
                  Listed on:{" "}
                  {new Date(
                    Number(listing.createdAt) / 1_000_000,
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
