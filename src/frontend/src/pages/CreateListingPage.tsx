import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ChevronLeft,
  Home,
  Image,
  Loader2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateListing, useGetCallerUserProfile } from "../hooks/useQueries";
import { useStorageUpload } from "../hooks/useStorageUpload";

export default function CreateListingPage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: profile } = useGetCallerUserProfile();
  const createListing = useCreateListing();
  const { uploadFiles, uploading, progress } = useStorageUpload();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
    setIsSubmitting(true);
    try {
      // Upload media files
      let mediaIds: string[] = [];
      if (mediaFiles.length > 0) {
        const uploaded = await uploadFiles(mediaFiles);
        mediaIds = uploaded.map((m) => m.mediaId);
      }

      const priceNum = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
      if (Number.isNaN(priceNum) || priceNum <= 0) {
        toast.error("Please enter a valid price.");
        return;
      }

      await createListing.mutateAsync({
        id: 0n,
        title: title.trim(),
        description: description.trim(),
        price: BigInt(Math.round(priceNum)),
        propertyType,
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
                    <Label htmlFor="title">
                      Listing Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g. Luxury Villa with Pool in Beverly Hills"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      data-ocid="create.input"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">
                        Property Type{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={propertyType}
                        onValueChange={setPropertyType}
                        required
                      >
                        <SelectTrigger id="type" data-ocid="create.select">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="plot">Plot</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">
                        Price (USD) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="price"
                        placeholder="e.g. 450000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        data-ocid="create.input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location / Address{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g. 123 Sunset Blvd, Los Angeles, CA 90028"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      data-ocid="create.input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your property — features, surroundings, nearby amenities..."
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      data-ocid="create.textarea"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Media Upload */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Photos & Videos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drop zone */}
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors"
                    data-ocid="create.dropzone"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">
                      Click to upload photos or videos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, MP4, MOV supported — floor plan, exterior,
                      interior
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      data-ocid="create.upload_button"
                    >
                      <Upload className="w-3.5 h-3.5 mr-2" />
                      Choose Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* File list */}
                  {mediaFiles.length > 0 && (
                    <div className="space-y-2">
                      {mediaFiles.map((file, i) => (
                        <div
                          key={`${file.name}-${i}`}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg text-sm"
                        >
                          {file.type.startsWith("video/") ? (
                            <Video className="w-4 h-4 text-primary shrink-0" />
                          ) : (
                            <Image className="w-4 h-4 text-primary shrink-0" />
                          )}
                          <span className="flex-1 truncate text-foreground">
                            {file.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </Badge>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload progress */}
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

              {/* Submit */}
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
