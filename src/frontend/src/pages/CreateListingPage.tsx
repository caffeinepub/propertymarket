import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Link, useRouter } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronLeft,
  Home,
  Loader2,
  Star,
  Upload,
  Video,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateListing, useGetCallerUserProfile } from "../hooks/useQueries";
import { useStorageUpload } from "../hooks/useStorageUpload";

interface MediaFile {
  file: File;
  previewUrl: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: profile } = useGetCallerUserProfile();
  const createListing = useCreateListing();
  const { uploadFiles, uploading, progress } = useStorageUpload();

  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaFilesRef = useRef(mediaFiles);
  mediaFilesRef.current = mediaFiles;

  useEffect(() => {
    return () => {
      for (const m of mediaFilesRef.current) {
        URL.revokeObjectURL(m.previewUrl);
      }
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center" data-ocid="create.error_state">
            <p className="text-2xl font-bold mb-2">Please Sign In</p>
            <p className="text-muted-foreground mb-6">
              You must be logged in to post a property.
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newItems: MediaFile[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setMediaFiles((prev) => {
      const updated = [...prev, ...newItems];
      return updated;
    });
    if (mediaFiles.length === 0 && newItems.length > 0) {
      setCoverIndex(0);
    }
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].previewUrl);
      return updated;
    });
    if (coverIndex >= index && coverIndex > 0) {
      setCoverIndex((c) => c - 1);
    } else if (coverIndex === index) {
      setCoverIndex(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !location.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      let mediaIds: string[] = [];
      if (mediaFiles.length > 0) {
        const orderedFiles = [
          mediaFiles[coverIndex],
          ...mediaFiles.filter((_, i) => i !== coverIndex),
        ].map((m) => m.file);
        const uploaded = await uploadFiles(orderedFiles);
        mediaIds = uploaded.map((m) => m.mediaId);
      }

      const priceNum = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
      if (Number.isNaN(priceNum) || priceNum <= 0) {
        toast.error("Please enter a valid price.");
        return;
      }

      await createListing.mutateAsync({
        id: 0n,
        title: location.trim(),
        description: "",
        price: BigInt(Math.round(priceNum)),
        propertyType: "",
        location: location.trim(),
        mediaIds,
        ownerEmail: profile?.email ?? "",
        ownerId: identity!.getPrincipal(),
        createdAt: BigInt(Date.now() * 1_000_000),
      });

      toast.success("Property listed successfully!");
      router.navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(
        err?.message ?? "Failed to create listing. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-display">
                  Post a Property
                </h1>
                <p className="text-sm text-muted-foreground">
                  Fill in the details to list your property on PropMarket
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <Card className="border border-border" data-ocid="create.card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price (INR ₹) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      placeholder="e.g. 5000000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      data-ocid="create.input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location / Address{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g. Bandra West, Mumbai, Maharashtra"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      data-ocid="create.input"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Media Upload */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Photos &amp; Videos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <button
                    type="button"
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
                    data-ocid="create.dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">
                      Click to upload photos or videos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, MP4, MOV supported — floor plan, exterior,
                      interior
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 text-sm border border-border rounded-md bg-background hover:bg-accent transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Choose Files
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </button>

                  {mediaFiles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <p className="text-sm font-medium text-foreground">
                          Cover Image Select karo
                        </p>
                        <span className="text-xs text-muted-foreground">
                          (Jo image/video cover hogi woh listing mein sabse
                          pehle dikhegi)
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {mediaFiles.map((media, i) => {
                          const isVideo = media.file.type.startsWith("video/");
                          const isCover = i === coverIndex;
                          return (
                            <button
                              key={`${media.file.name}-${i}`}
                              type="button"
                              className="relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 text-left"
                              style={{
                                borderColor: isCover
                                  ? "hsl(var(--primary))"
                                  : "transparent",
                                boxShadow: isCover
                                  ? "0 0 0 2px hsl(var(--primary)/0.3)"
                                  : "none",
                              }}
                              onClick={() => setCoverIndex(i)}
                              data-ocid={`create.toggle.${i + 1}`}
                            >
                              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                                {isVideo ? (
                                  <video
                                    src={media.previewUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                  />
                                ) : (
                                  <img
                                    src={media.previewUrl}
                                    alt={media.file.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>

                              {isCover && (
                                <div className="absolute top-1 left-1">
                                  <span className="inline-flex items-center gap-0.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    Cover
                                  </span>
                                </div>
                              )}

                              {isVideo && (
                                <div className="absolute bottom-1 right-1">
                                  <span className="inline-flex items-center gap-0.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    <Video className="w-2.5 h-2.5" />
                                    Video
                                  </span>
                                </div>
                              )}

                              {!isCover && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white text-[10px] font-semibold bg-black/50 px-2 py-1 rounded-full">
                                    Cover banao
                                  </span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(i);
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {mediaFiles.length} file
                        {mediaFiles.length > 1 ? "s" : ""} selected &bull;
                        Cover:{" "}
                        <span className="font-medium text-foreground">
                          {mediaFiles[coverIndex]?.file.name ?? "None"}
                        </span>
                      </p>
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-2" data-ocid="create.loading_state">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Uploading media...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Link to="/dashboard" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    data-ocid="create.cancel_button"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="flex-1 bg-primary text-white hover:bg-primary/90"
                  data-ocid="create.submit_button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Listing"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
