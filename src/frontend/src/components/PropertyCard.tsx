import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HttpAgent } from "@icp-sdk/core/agent";
import { Link } from "@tanstack/react-router";
import { Hash, Heart, MapPin, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { PropertyListing } from "../backend";
import { loadConfig } from "../config";
import { parseMediaId } from "../hooks/useStorageUpload";
import { StorageClient } from "../utils/StorageClient";

const PLACEHOLDER_IMAGES: Record<string, string> = {
  house: "/assets/generated/property-house-1.dim_800x500.jpg",
  plot: "/assets/generated/property-plot-1.dim_800x500.jpg",
  apartment: "/assets/generated/property-apartment-1.dim_800x500.jpg",
  townhouse: "/assets/generated/property-townhouse-1.dim_800x500.jpg",
};

function formatPrice(price: bigint): string {
  const num = Number(price);
  if (num >= 10_000_000) return `\u20B9${(num / 10_000_000).toFixed(2)} Cr`;
  if (num >= 100_000) return `\u20B9${(num / 100_000).toFixed(2)} L`;
  if (num >= 1_000) return `\u20B9${(num / 1_000).toFixed(0)}K`;
  return `\u20B9${num.toLocaleString("en-IN")}`;
}

function getPlaceholderImage(propertyType: string): string {
  const key = propertyType.toLowerCase();
  return PLACEHOLDER_IMAGES[key] ?? PLACEHOLDER_IMAGES.house;
}

async function buildStorageClient() {
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  return new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
}

function MediaThumbnail({
  mediaId,
  propertyType,
}: { mediaId: string; propertyType: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const { type, hash } = parseMediaId(mediaId);

  useEffect(() => {
    let objectUrl: string | null = null;
    buildStorageClient()
      .then(async (client) => {
        const directUrl = await client.getDirectURL(hash);
        setUrl(directUrl);
        objectUrl = directUrl;
      })
      .catch(() => {});
    return () => {
      if (objectUrl?.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
    };
  }, [hash]);

  const fallback = getPlaceholderImage(propertyType);

  if (type === "video") {
    if (!url) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center gap-2 text-white/70">
            <Play className="w-10 h-10" />
            <span className="text-xs">Loading video...</span>
          </div>
        </div>
      );
    }
    return (
      <video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  const src = url ?? fallback;
  return (
    <img
      src={src}
      alt="Property"
      className="w-full h-full object-cover"
      onError={(e) => {
        (e.target as HTMLImageElement).src = fallback;
      }}
    />
  );
}

interface PropertyCardProps {
  isSaved?: boolean;
  onSaveToggle?: (id: bigint) => void;
  listing: PropertyListing;
  index: number;
}

export default function PropertyCard({
  listing,
  index,
  isSaved,
  onSaveToggle,
}: PropertyCardProps) {
  // Prefer video as cover if present, then image, then null
  const videoMediaId = listing.mediaIds.find((id) => id.startsWith("video:"));
  const imageMediaId = listing.mediaIds.find((id) => id.startsWith("image:"));
  const coverMediaId = videoMediaId ?? imageMediaId;
  const hasMedia = !!coverMediaId;

  return (
    <Card
      className="group overflow-hidden border border-border hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-card"
      data-ocid={`listing.item.${index}`}
    >
      {/* Image / Video */}
      <div className="relative h-52 overflow-hidden bg-muted">
        {hasMedia ? (
          <MediaThumbnail
            mediaId={coverMediaId!}
            propertyType={listing.propertyType}
          />
        ) : (
          <img
            src={getPlaceholderImage(listing.propertyType)}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <Badge
          className="absolute top-3 left-3 text-xs font-semibold uppercase"
          style={{
            backgroundColor:
              listing.propertyType.toLowerCase() === "plot"
                ? "#e53935"
                : "#1E88E5",
          }}
        >
          {listing.propertyType}
        </Badge>
        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {listing.id.toString()}
        </div>

        {/* Save/Heart button */}
        <button
          type="button"
          className={`absolute bottom-3 right-3 rounded-full p-2 shadow-lg transition-all duration-200 ${
            isSaved
              ? "bg-red-500 hover:bg-red-600 scale-110"
              : "bg-white/80 backdrop-blur hover:scale-110"
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onSaveToggle) onSaveToggle(listing.id);
          }}
          data-ocid={`listing.toggle.${index}`}
          aria-label={isSaved ? "Unsave property" : "Save property"}
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isSaved ? "fill-white text-white" : "text-gray-500"
            }`}
          />
        </button>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <p className="text-xl font-bold text-foreground">
            {formatPrice(listing.price)}
          </p>
          <h3 className="text-sm font-medium text-foreground mt-1 line-clamp-1">
            {listing.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{listing.location}</span>
        </div>

        <div className="flex gap-2 mt-2">
          <Link
            to="/property/$id"
            params={{ id: listing.id.toString() }}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full text-primary border-primary hover:bg-primary hover:text-white transition-colors"
              data-ocid={`listing.secondary_button.${index}`}
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
