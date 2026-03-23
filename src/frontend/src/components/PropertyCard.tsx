import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HttpAgent } from "@icp-sdk/core/agent";
import { Link } from "@tanstack/react-router";
import { Hash, MapPin, MessageCircle } from "lucide-react";
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

function MediaThumbnail({
  mediaId,
  propertyType,
}: { mediaId: string; propertyType: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const { type, hash } = parseMediaId(mediaId);

  useEffect(() => {
    if (type === "image") {
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
    }
  }, [hash, type]);

  const fallback = getPlaceholderImage(propertyType);
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
  listing: PropertyListing;
  index: number;
}

export default function PropertyCard({ listing, index }: PropertyCardProps) {
  const imageMediaId = listing.mediaIds.find((id) => id.startsWith("image:"));
  const hasMedia = !!imageMediaId;

  const whatsappText = encodeURIComponent(
    `I'm interested in your property: ${listing.title} - Listed at \u20B9${Number(listing.price).toLocaleString("en-IN")}. Please share more details.`,
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <Card
      className="group overflow-hidden border border-border hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-card"
      data-ocid={`listing.item.${index}`}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-muted">
        {hasMedia ? (
          <MediaThumbnail
            mediaId={imageMediaId!}
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
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid={`listing.button.${index}`}
          >
            <Button
              size="sm"
              className="shrink-0 text-white"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              WhatsApp
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
