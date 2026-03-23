import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@tanstack/react-router";
import { Home, KeyRound, Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

export default function LoginPage() {
  const router = useRouter();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  // Profile setup for new users
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isFetched && !profileLoading) {
      if (profile === null) {
        setShowSetup(true);
      } else {
        // Already has profile, redirect to dashboard
        router.navigate({ to: "/dashboard" });
      }
    }
  }, [isAuthenticated, isFetched, profile, profileLoading, router]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      if (err?.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: name.trim(), email: email.trim() });
      toast.success("Profile created! Welcome to PropMarket.");
      router.navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Home className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              PropMarket
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Your trusted property marketplace
            </p>
          </div>

          {!isAuthenticated && !showSetup && (
            <Card className="border border-border shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Sign In / Register
                </CardTitle>
                <CardDescription>
                  Sign in securely to publish properties, manage listings, and
                  track your portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">
                    🔒 Secure Authentication
                  </p>
                  <p>
                    PropMarket uses Internet Identity for secure, passwordless
                    sign-in. No username or password required — just click the
                    button below.
                  </p>
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-primary text-white hover:bg-primary/90 h-11"
                  data-ocid="login.primary_button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In / Register"
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By signing in, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </CardContent>
            </Card>
          )}

          {isAuthenticated && showSetup && (
            <Card
              className="border border-border shadow-card"
              data-ocid="profile.card"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Complete Your Profile
                </CardTitle>
                <CardDescription>
                  You're almost there! Tell us a bit about yourself to get
                  started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-ocid="profile.input"
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saveProfile.isPending}
                  className="w-full bg-primary text-white hover:bg-primary/90 h-11"
                  data-ocid="profile.submit_button"
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Create Profile & Continue"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {isAuthenticated && profileLoading && (
            <Card className="border border-border shadow-card">
              <CardContent
                className="py-8 flex flex-col items-center gap-3"
                data-ocid="login.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading your profile...
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
