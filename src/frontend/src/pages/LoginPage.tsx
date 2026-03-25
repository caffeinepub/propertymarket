import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@tanstack/react-router";
import { KeyRound, Loader2, LogIn, User, UserPlus } from "lucide-react";
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

  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [activeTab, setActiveTab] = useState("register");

  useEffect(() => {
    if (isAuthenticated && isFetched && !profileLoading) {
      if (profile === null) {
        setShowSetup(true);
      } else {
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
      toast.success("Profile created! Welcome to PropertyMarket.");
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
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Brand badge */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #B8860B 0%, #FFD700 50%, #B8860B 100%)",
                boxShadow: "0 4px 20px rgba(184,134,11,0.4)",
              }}
            >
              <span className="text-2xl font-extrabold text-[#0D1B3E] tracking-tight">
                PB
              </span>
            </div>
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: "#0D1B3E" }}
            >
              PropertyMarket
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your trusted property marketplace in India
            </p>
          </div>

          {/* Loading state after II auth */}
          {isAuthenticated && profileLoading && (
            <Card className="border border-border shadow-lg">
              <CardContent
                className="py-10 flex flex-col items-center gap-3"
                data-ocid="login.loading_state"
              >
                <Loader2
                  className="w-7 h-7 animate-spin"
                  style={{ color: "#B8860B" }}
                />
                <p className="text-sm text-muted-foreground">
                  Loading your profile...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Profile setup form */}
          {isAuthenticated && showSetup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="border border-border shadow-lg overflow-hidden"
                data-ocid="profile.card"
              >
                <CardHeader
                  className="pb-5 pt-6 px-6"
                  style={{ background: "#0D1B3E" }}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-white text-lg font-semibold">
                      Complete Your Profile
                    </h2>
                  </div>
                  <p className="text-blue-200 text-sm mt-1">
                    You're almost there! Tell us a bit about yourself.
                  </p>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="space-y-2">
                    <Label htmlFor="setup-name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="setup-name"
                      placeholder="Prem Bhati"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                      data-ocid="profile.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="setup-email"
                      className="text-sm font-medium"
                    >
                      Gmail Address
                    </Label>
                    <Input
                      id="setup-email"
                      type="email"
                      placeholder="you@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                      data-ocid="profile.input"
                    />
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saveProfile.isPending}
                    className="w-full h-11 font-semibold text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, #B8860B 0%, #FFD700 60%, #B8860B 100%)",
                      color: "#0D1B3E",
                    }}
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
            </motion.div>
          )}

          {/* Pre-auth: Register / Login tabs */}
          {!isAuthenticated && !showSetup && (
            <Card className="border border-border shadow-lg overflow-hidden">
              {/* Dark navy header */}
              <CardHeader
                className="pb-0 pt-0 px-0"
                style={{ background: "#0D1B3E" }}
              >
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <KeyRound className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-white text-xl font-bold">
                      {activeTab === "register"
                        ? "Create Account"
                        : "Welcome Back"}
                    </h2>
                  </div>
                  <p className="text-blue-200 text-sm">
                    {activeTab === "register"
                      ? "Join PropertyMarket — India's trusted property platform"
                      : "Sign in to manage your property listings"}
                  </p>
                </div>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList
                    className="w-full rounded-none bg-transparent border-t border-white/10 h-12"
                    data-ocid="auth.tab"
                  >
                    <TabsTrigger
                      value="register"
                      className="flex-1 h-full rounded-none text-sm font-medium text-blue-300 data-[state=active]:text-yellow-400 data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent"
                      data-ocid="auth.register.tab"
                    >
                      <UserPlus className="w-4 h-4 mr-1.5" />
                      Register
                    </TabsTrigger>
                    <TabsTrigger
                      value="login"
                      className="flex-1 h-full rounded-none text-sm font-medium text-blue-300 data-[state=active]:text-yellow-400 data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent"
                      data-ocid="auth.login.tab"
                    >
                      <LogIn className="w-4 h-4 mr-1.5" />
                      Login
                    </TabsTrigger>
                  </TabsList>

                  {/* Register tab */}
                  <TabsContent value="register" className="mt-0">
                    <div className="bg-background p-6 space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="reg-name"
                          className="text-sm font-medium"
                        >
                          Full Name
                        </Label>
                        <Input
                          id="reg-name"
                          placeholder="Prem Bhati"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-11"
                          data-ocid="register.input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="reg-email"
                          className="text-sm font-medium"
                        >
                          Gmail Address
                        </Label>
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11"
                          data-ocid="register.input"
                        />
                      </div>

                      <Button
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="w-full h-11 font-semibold text-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #B8860B 0%, #FFD700 60%, #B8860B 100%)",
                          color: "#0D1B3E",
                        }}
                        data-ocid="register.submit_button"
                      >
                        {isLoggingIn ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Register with Internet Identity"
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        🔒 You'll be redirected to Internet Identity to verify
                        your identity
                      </p>
                    </div>
                  </TabsContent>

                  {/* Login tab */}
                  <TabsContent value="login" className="mt-0">
                    <div className="bg-background p-6 space-y-5">
                      <div
                        className="rounded-xl p-4 text-sm"
                        style={{
                          background: "rgba(13,27,62,0.06)",
                          border: "1px solid rgba(13,27,62,0.12)",
                        }}
                      >
                        <p
                          className="font-semibold mb-1"
                          style={{ color: "#0D1B3E" }}
                        >
                          Welcome back! Sign in securely.
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Use your Internet Identity to access your dashboard
                          and listings. No password needed.
                        </p>
                      </div>

                      <Button
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="w-full h-11 font-semibold text-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #B8860B 0%, #FFD700 60%, #B8860B 100%)",
                          color: "#0D1B3E",
                        }}
                        data-ocid="login.primary_button"
                      >
                        {isLoggingIn ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In with Internet Identity"
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        🔒 Secure, passwordless authentication via Internet
                        Identity
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
