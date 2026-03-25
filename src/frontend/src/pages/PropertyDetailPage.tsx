import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  Share2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { loadConfig } from "../config";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetListing,
  useGetSavedListings,
  useGetUserProfile,
  useSaveListing,
  useSubmitInquiry,
  useUnsaveListing,
} from "../hooks/useQueries";
import { parseMediaId } from "../hooks/useStorageUpload";
import { StorageClient } from "../utils/StorageClient";

function formatPrice(price: bigint): string {
  const num = Number(price);
  if (num >= 10_000_000) return `\u20B9${(num / 10_000_000).toFixed(2)} Crore`;
  if (num >= 100_000) return `\u20B9${(num / 100_000).toFixed(2)} Lakh`;
  if (num >= 1_000) return `\u20B9${(num / 1_000).toFixed(0)},000`;
  return `\u20B9${num.toLocaleString("en-IN")}`;
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

interface ChatMessage {
  type: "buyer";
  name: string;
  phone: string;
  text: string;
  time: string;
}

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  listingTitle: string;
  ownerEmail: string;
  listingId: bigint;
}

function ChatDrawer({ open, onClose, listingId }: ChatDrawerProps) {
  const submitInquiry = useSubmitInquiry();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("");
  const [infoSaved, setInfoSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open]);

  const handleSend = async () => {
    if (!infoSaved) {
      if (!name.trim() || !phone.trim()) {
        toast.error("Please enter your name and phone number.");
        return;
      }
      setInfoSaved(true);
    }
    if (!text.trim()) return;

    try {
      await submitInquiry.mutateAsync({
        listingId,
        buyerName: name,
        buyerPhone: phone,
        message: text,
      });
      setMessages((prev) => [
        ...prev,
        {
          type: "buyer",
          name,
          phone,
          text,
          time: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setText("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#ECE5DD] flex flex-col z-50 shadow-2xl"
            data-ocid="chat.sheet"
          >
            {/* Header */}
            <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="hover:bg-white/10 p-1 rounded-full"
                data-ocid="chat.close_button"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  Prem Bhati - PropertyMarket Owner
                </p>
                <p className="text-xs text-white/70 truncate">
                  prembhati04444@gmail.com
                </p>
              </div>
            </div>

            {/* Contact info form if not saved */}
            {!infoSaved && (
              <div className="bg-white/80 mx-3 mt-3 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Your contact info
                </p>
                <div>
                  <Label htmlFor="chat-name" className="text-xs">
                    Name
                  </Label>
                  <Input
                    id="chat-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1 h-9 text-sm"
                    data-ocid="chat.input"
                  />
                </div>
                <div>
                  <Label htmlFor="chat-phone" className="text-xs">
                    Phone
                  </Label>
                  <Input
                    id="chat-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1 h-9 text-sm"
                    data-ocid="chat.input"
                  />
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 px-3 py-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-500">
                    Send a message to Prem Bhati about this property
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: transient chat messages
                <div key={`msg-${i}`} className="flex justify-end mb-2">
                  <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%] shadow-sm">
                    <p className="text-sm text-gray-800">{msg.text}</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">
                      {msg.time} ✓✓
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="bg-[#F0F0F0] px-3 py-2 flex gap-2 items-end">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white rounded-xl resize-none text-sm min-h-[40px] max-h-24 border-0 focus-visible:ring-0"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                data-ocid="chat.textarea"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={submitInquiry.isPending}
                className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center hover:bg-[#128C7E] transition-colors shrink-0 disabled:opacity-50"
                data-ocid="chat.submit_button"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams({ from: "/property/$id" });
  const listingId = BigInt(id);
  const { data: listing, isLoading } = useGetListing(listingId);
  const { data: savedListings } = useGetSavedListings();
  const ownerPrincipalId = listing?.ownerId?.toString();
  const { data: ownerProfile } = useGetUserProfile(ownerPrincipalId);
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();
  const { identity } = useInternetIdentity();
  const savedIds = new Set((savedListings ?? []).map((l) => l.id.toString()));
  const isThisSaved = listing ? savedIds.has(listing.id.toString()) : false;

  const handleSaveToggle = async () => {
    if (!identity) {
      toast.error("Save karne ke liye Sign In karo");
      return;
    }
    if (!listing) return;
    if (isThisSaved) {
      await unsaveListing.mutateAsync(listing.id);
      toast.success("Saved se hataya");
    } else {
      await saveListing.mutateAsync(listing.id);
      toast.success("Property save ho gayi!");
    }
  };
  const [chatOpen, setChatOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-72 rounded-xl mb-6" />
          <Skeleton className="h-48 rounded-xl" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center" data-ocid="property.error_state">
            <p className="text-2xl font-bold mb-2">Property Not Found</p>
            <Link to="/">
              <Button variant="outline">Back to Listings</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Listings
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Media + Details */}
            <div className="lg:col-span-2">
              {/* Media */}
              {listing.mediaIds.length > 0 ? (
                <Tabs defaultValue="0" className="mb-6">
                  <TabsList className="mb-3">
                    {listing.mediaIds.map((mediaId, i) => (
                      <TabsTrigger
                        key={mediaId}
                        value={i.toString()}
                        data-ocid="property.tab"
                      >
                        Media {i + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {listing.mediaIds.map((mediaId, i) => (
                    <TabsContent key={mediaId} value={i.toString()}>
                      <MediaItem mediaId={mediaId} alt={listing.title} />
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="h-72 rounded-xl bg-muted flex items-center justify-center mb-6">
                  <p className="text-muted-foreground text-sm">
                    No media uploaded
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <Badge
                      className="mb-2 text-white"
                      style={{
                        backgroundColor:
                          listing.propertyType.toLowerCase() === "plot"
                            ? "#e53935"
                            : "#1E88E5",
                      }}
                    >
                      {listing.propertyType}
                    </Badge>
                    <h1 className="text-2xl font-bold text-foreground font-display">
                      {listing.title}
                    </h1>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
                      <MapPin className="w-4 h-4" />
                      {listing.location}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(listing.price)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Listing #{listing.id.toString()}
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Owner Contact */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Listed by
                </p>
                <p className="text-muted-foreground text-sm">
                  {ownerProfile?.name ?? listing.ownerEmail}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 space-y-3">
                <p className="text-xl font-bold text-foreground">
                  {formatPrice(listing.price)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {listing.location}
                </p>

                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => setChatOpen(true)}
                  data-ocid="property.open_modal_button"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Owner
                </Button>

                <Button
                  variant="outline"
                  className={`w-full ${isThisSaved ? "border-red-400 text-red-500 hover:bg-red-50" : "hover:border-red-300 hover:text-red-500"}`}
                  onClick={handleSaveToggle}
                  data-ocid="property.toggle"
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${isThisSaved ? "fill-red-500" : ""}`}
                  />
                  {isThisSaved ? "Saved ✓" : "Save Property"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(window.location.href)
                      .then(() => toast.success("Link copied!"))
                      .catch(() => {});
                  }}
                  data-ocid="property.secondary_button"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Listing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        listingTitle={listing.title}
        ownerEmail={ownerProfile?.name ?? listing.ownerEmail}
        listingId={listing.id}
      />
    </div>
  );
}
