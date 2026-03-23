import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@dfinity/principal";
import { useRouter } from "@tanstack/react-router";
import { Search, Shield, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { PropertyListing } from "../backend";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import { useGetAllListings } from "../hooks/useQueries";

// Static sample listings for first-load experience
const SAMPLE_LISTINGS: PropertyListing[] = [
  {
    id: 1001n,
    title: "Grand Villa with Panoramic City Views",
    description:
      "Stunning modern villa featuring floor-to-ceiling windows, open-plan living spaces, and a rooftop terrace with breathtaking city views.",
    price: 1250000n,
    propertyType: "house",
    location: "Beverly Hills, CA 90210",
    mediaIds: [],
    ownerEmail: "owner@example.com",
    ownerId: Principal.fromText("aaaaa-aa"),
    createdAt: BigInt(Date.now()),
  },
  {
    id: 1002n,
    title: "Prime Corner Plot — Downtown District",
    description:
      "A rare opportunity to own a prime corner plot in the heart of the downtown district. Ready for immediate development.",
    price: 580000n,
    propertyType: "plot",
    location: "Manhattan, NY 10001",
    mediaIds: [],
    ownerEmail: "owner2@example.com",
    ownerId: Principal.fromText("aaaaa-aa"),
    createdAt: BigInt(Date.now()),
  },
  {
    id: 1003n,
    title: "Contemporary Family Townhouse",
    description:
      "Elegant townhouse spread over three floors, with four bedrooms, a landscaped garden, and a double garage.",
    price: 895000n,
    propertyType: "townhouse",
    location: "Notting Hill, London W11",
    mediaIds: [],
    ownerEmail: "owner3@example.com",
    ownerId: Principal.fromText("aaaaa-aa"),
    createdAt: BigInt(Date.now()),
  },
  {
    id: 1004n,
    title: "Luxury Sky Apartment — 35th Floor",
    description:
      "High-rise luxury apartment with designer interiors, gym access, concierge, and 360-degree skyline views.",
    price: 2100000n,
    propertyType: "apartment",
    location: "Dubai Marina, UAE",
    mediaIds: [],
    ownerEmail: "owner4@example.com",
    ownerId: Principal.fromText("aaaaa-aa"),
    createdAt: BigInt(Date.now()),
  },
  {
    id: 1005n,
    title: "Hillside Development Plot",
    description:
      "Serene hillside plot with planning permission granted for a 5-bedroom eco-home. Unobstructed mountain views.",
    price: 340000n,
    propertyType: "plot",
    location: "Malibu Hills, CA 90265",
    mediaIds: [],
    ownerEmail: "owner5@example.com",
    ownerId: Principal.fromText("aaaaa-aa"),
    createdAt: BigInt(Date.now()),
  },
  {
    id: 1006n,
    title: "Charming Heritage Cottage",
    description:
      "Beautifully restored heritage cottage with original features, stone fireplace, and a private walled garden.",
    price: 720000n,
    propertyType: "house",
    location: "Cotswolds, Gloucestershire",
    mediaIds: [],
    ownerEmail: "owner6@example.com",
    ownerId: Principal.fromText("aaaaa-aa"),
    createdAt: BigInt(Date.now()),
  },
];

const NEIGHBORHOODS = [
  {
    name: "Beverly Hills",
    tag: "Luxury Homes",
    image: "/assets/generated/property-house-1.dim_800x500.jpg",
  },
  {
    name: "Manhattan",
    tag: "City Living",
    image: "/assets/generated/property-apartment-1.dim_800x500.jpg",
  },
  {
    name: "Malibu Coast",
    tag: "Beach & Plots",
    image: "/assets/generated/property-plot-2.dim_800x500.jpg",
  },
];

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const router = useRouter();
  const { data: listings, isLoading } = useGetAllListings();

  const displayListings: PropertyListing[] =
    listings && listings.length > 0 ? listings : SAMPLE_LISTINGS;

  const handleSearch = () => {
    // Navigate to home with filters (simplified)
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative h-[600px] flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage:
              "url(/assets/generated/hero-property.dim_1400x800.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          data-ocid="hero.section"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="font-display text-5xl sm:text-6xl font-bold mb-4 leading-tight"
            >
              Find Your Perfect
              <br />
              <span className="text-primary">Dream Property</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="text-lg text-white/80 mb-8"
            >
              Browse thousands of houses, plots, and apartments. Owners publish
              live videos and photos.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-card rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1">
                <Input
                  placeholder="Search by location, city, or zip code..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="border-0 bg-transparent text-foreground focus-visible:ring-0 h-11 text-sm"
                  data-ocid="search.input"
                />
              </div>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger
                  className="w-full sm:w-44 border-0 bg-muted h-11 text-sm"
                  data-ocid="search.select"
                >
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                className="bg-primary text-white h-11 px-6 shrink-0 hover:bg-primary/90"
                data-ocid="search.primary_button"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-3 divide-x divide-border text-center">
              {[
                {
                  icon: TrendingUp,
                  value: "12,000+",
                  label: "Active Listings",
                },
                { icon: Users, value: "8,500+", label: "Happy Buyers" },
                { icon: Shield, value: "100%", label: "Verified Owners" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="px-4 py-1">
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-bold text-lg text-foreground">
                      {value}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
          data-ocid="listings.section"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground font-display">
                Featured Listings
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Handpicked properties for every lifestyle
              </p>
            </div>
          </div>

          {isLoading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="listings.loading_state"
            >
              {(["a", "b", "c", "d", "e", "f"] as const).map((k) => (
                <div key={k} className="space-y-3">
                  <Skeleton className="h-52 rounded-xl" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="listings.list"
            >
              {displayListings.map((listing, i) => (
                <PropertyCard
                  key={listing.id.toString()}
                  listing={listing}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </section>

        {/* Explore Neighborhoods */}
        <section className="bg-card py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground font-display">
                Explore Neighborhoods
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Discover properties in top locations
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {NEIGHBORHOODS.map((n, i) => (
                <motion.div
                  key={n.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative h-56 rounded-2xl overflow-hidden cursor-pointer group"
                  data-ocid={`neighborhood.card.${i + 1}`}
                >
                  <img
                    src={n.image}
                    alt={n.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-xs font-medium text-white/70 uppercase tracking-wider">
                      {n.tag}
                    </p>
                    <p className="text-xl font-bold font-display">{n.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
