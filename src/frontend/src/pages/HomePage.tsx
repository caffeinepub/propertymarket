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
import {
  Building2,
  IndianRupee,
  LayoutGrid,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Users,
  Youtube,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import { useGetAllListings, useGetGlobalStats } from "../hooks/useQueries";

function AnimatedCounter({ value }: { value: number | undefined }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (value === undefined) return;
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    const duration = 1000;
    const stepMs = 50;
    const steps = duration / stepMs;
    const increment = (end - start) / steps;
    let current = start;

    intervalRef.current = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= end) ||
        (increment < 0 && current <= end)
      ) {
        setDisplay(end);
        prevRef.current = end;
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplay(Math.floor(current));
      }
    }, stepMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [value]);

  if (value === undefined) return <span>...</span>;
  return <span>{display.toString()}</span>;
}

const FEATURES = [
  {
    icon: IndianRupee,
    title: "Real Pricing",
    description:
      "We focus on listings that reflect actual market values, ensuring you get the best deal without unnecessary markups.",
  },
  {
    icon: LayoutGrid,
    title: "A Complete Marketplace",
    description:
      "From residential flats and luxury villas to commercial shops and agricultural plots—we bring the entire property market to your fingertips.",
  },
  {
    icon: ShieldCheck,
    title: "Direct & Transparent",
    description:
      "We bridge the gap between buyers and sellers, providing a platform built on trust, verified information, and ease of use.",
  },
];

const TEAM = [
  {
    name: "Prem Bhati",
    role: "Owner & Visionary",
    bio: "As the Owner of Property Market, Prem Bhati leads the strategic vision and growth of the platform. With a deep focus on market integrity, Prem ensures that every user has access to real property prices and a trustworthy marketplace experience.",
    initials: "PB",
    email: "prembhati04444@gmail.com",
    youtube: "https://youtube.com/channel/UCfcmjN4UqPsM7A0IzTX8OYA",
    phone: "+91 7062824444",
  },
  {
    name: "Ravina Bhatti",
    role: "Lead App Developer",
    bio: "Ravina Bhatti drives the technical excellence behind Property Market, building a seamless and reliable platform that connects buyers and sellers with confidence.",
    initials: "RB",
    email: null,
    youtube: null,
    phone: null,
  },
];

const PRICE_RANGES = [
  { value: "all", label: "Any Price" },
  { value: "under50l", label: "Under ₹50 Lakh" },
  { value: "50l-1cr", label: "₹50L – ₹1 Crore" },
  { value: "1cr-5cr", label: "₹1 Cr – ₹5 Crore" },
  { value: "above5cr", label: "Above ₹5 Crore" },
];

const PROPERTY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "agricultural", label: "Agricultural" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "plot", label: "Plot / Land" },
];

function matchesPriceRange(price: bigint, range: string): boolean {
  const num = Number(price);
  switch (range) {
    case "under50l":
      return num < 5_000_000;
    case "50l-1cr":
      return num >= 5_000_000 && num < 10_000_000;
    case "1cr-5cr":
      return num >= 10_000_000 && num < 50_000_000;
    case "above5cr":
      return num >= 50_000_000;
    default:
      return true;
  }
}

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const searchRef = useRef<HTMLInputElement>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const { data: listings, isLoading } = useGetAllListings();
  const { data: stats } = useGetGlobalStats();

  const filteredListings = (listings ?? []).filter((l) => {
    const matchesLocation =
      !searchLocation ||
      l.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
      l.title.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesType =
      propertyType === "all" || l.propertyType.toLowerCase() === propertyType;
    const matchesPrice = matchesPriceRange(l.price, priceRange);
    return matchesLocation && matchesType && matchesPrice;
  });

  const handleSearchScrollFocus = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => searchRef.current?.focus(), 400);
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
              Browse real properties listed by verified owners. Owners publish
              live videos and photos.
            </motion.p>

            {/* Hero Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-card rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1">
                <Input
                  placeholder="Search by location, city, or title..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="border-0 bg-transparent text-foreground focus-visible:ring-0 h-11 text-sm"
                  data-ocid="search.input"
                />
              </div>
              <Button
                className="bg-primary text-white h-11 px-6 shrink-0 hover:bg-primary/90"
                onClick={handleSearchScrollFocus}
                data-ocid="search.primary_button"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Global Stats Banner */}
        <section className="bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/20 text-center">
              <div className="px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-white/80 shrink-0" />
                  <p className="text-sm text-white leading-snug">
                    अभी तक{" "}
                    <span className="font-bold text-xl align-middle">
                      <AnimatedCounter
                        value={stats ? Number(stats.totalUsers) : undefined}
                      />
                    </span>{" "}
                    यूज़र्स ने register किया है।
                  </p>
                </div>
              </div>
              <div className="px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="w-5 h-5 text-white/80 shrink-0" />
                  <p className="text-sm text-white leading-snug">
                    अभी तक{" "}
                    <span className="font-bold text-xl align-middle">
                      <AnimatedCounter
                        value={stats ? Number(stats.totalListings) : undefined}
                      />
                    </span>{" "}
                    प्रॉपर्टी पोस्ट हुई हैं।
                  </p>
                </div>
              </div>
              <div className="px-4 py-1">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-white/80" />
                  <span className="font-bold text-xl">100%</span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">Verified Owners</p>
              </div>
              <div className="px-4 py-1">
                <div className="flex items-center justify-center gap-2">
                  <IndianRupee className="w-5 h-5 text-white/80" />
                  <span className="font-bold text-xl">Real</span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">Market Prices</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          className="bg-card border-b border-border py-16"
          data-ocid="about.section"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl font-bold text-foreground mb-4">
                Welcome to Property Market
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
                Your ultimate destination for finding the right property at the
                Real Market Price. Our platform was built with a single mission:
                to create a transparent and reliable Full Property Market where
                buyers and sellers can connect without the confusion of hidden
                costs or inflated pricing.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center p-6 rounded-2xl border border-border bg-background hover:shadow-card transition-shadow"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <f.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Search & Filter Section */}
        <section
          id="search-section"
          ref={searchSectionRef}
          className="py-10 border-b border-border bg-background"
          data-ocid="filter.section"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  placeholder="Search by location, city, or property title..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-9 h-11"
                  data-ocid="filter.search_input"
                />
              </div>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger
                  className="w-full md:w-48 h-11"
                  data-ocid="filter.select"
                >
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger
                  className="w-full md:w-48 h-11"
                  data-ocid="filter.select"
                >
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchLocation ||
                propertyType !== "all" ||
                priceRange !== "all") && (
                <Button
                  variant="outline"
                  className="h-11 shrink-0"
                  onClick={() => {
                    setSearchLocation("");
                    setPropertyType("all");
                    setPriceRange("all");
                  }}
                  data-ocid="filter.secondary_button"
                >
                  Clear
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {isLoading
                ? "Loading listings..."
                : `Showing ${filteredListings.length} of ${listings?.length ?? 0} listings`}
            </p>
          </div>
        </section>

        {/* Listings Grid */}
        <section className="py-12" data-ocid="listings.section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-foreground">
                All Properties
              </h2>
            </div>

            {isLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                data-ocid="listings.loading_state"
              >
                {[1, 2, 3, 4, 5, 6].map((k) => (
                  <Skeleton key={k} className="h-72 rounded-2xl" />
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div
                className="text-center py-20 bg-card border border-border rounded-2xl"
                data-ocid="listings.empty_state"
              >
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  No properties found
                </p>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search filters.
                </p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06 } },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                data-ocid="listings.list"
              >
                {filteredListings.map((listing, i) => (
                  <motion.div
                    key={listing.id.toString()}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <PropertyCard listing={listing} index={i + 1} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-card border-t border-border py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">
                Meet the Team
              </h2>
              <p className="text-muted-foreground">
                The people behind PropMarket
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {TEAM.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-background border border-border rounded-2xl p-6 text-center hover:shadow-card transition-shadow"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-xl text-primary">
                      {member.initials}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {member.bio}
                  </p>
                  {(member.email || member.youtube || member.phone) && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                      {member.phone && (
                        <a
                          href={`tel:${member.phone.replace(/\s/g, "")}`}
                          className="flex items-center gap-1.5 text-primary text-sm hover:underline"
                        >
                          <Phone className="w-4 h-4 shrink-0" />
                          {member.phone}
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-1.5 text-primary text-sm hover:underline"
                        >
                          <Mail className="w-4 h-4 shrink-0" />
                          {member.email}
                        </a>
                      )}
                      {member.youtube && (
                        <a
                          href={member.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary text-sm hover:underline"
                        >
                          <Youtube className="w-4 h-4 shrink-0" />
                          YouTube Channel
                        </a>
                      )}
                    </div>
                  )}
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
