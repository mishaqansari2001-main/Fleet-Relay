"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Eye,
  EyeSlash,
  CircleNotch,
  WarningCircle,
} from "@phosphor-icons/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "account_inactive") {
      setError(
        "Your account is inactive. Please contact your administrator."
      );
    } else if (urlError === "auth_callback_failed") {
      setError(
        "Authentication failed. Please try signing in again."
      );
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      if (signInError.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (signInError.message.includes("Email not confirmed")) {
        setError("Please verify your email address before signing in.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#111318] dark:text-[#ECEDEE]">
          Fleet<span className="text-[#0B8841] dark:text-[#2EAD5E]">Relay</span>
        </h1>
      </div>

      <Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-semibold text-[#111318] dark:text-[#ECEDEE]">
            Sign in
          </CardTitle>
          <CardDescription className="text-[#7C8490] dark:text-[#55585F]">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#111318] dark:text-[#ECEDEE]"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] text-[#111318] dark:text-[#ECEDEE] placeholder:text-[#7C8490] dark:placeholder:text-[#55585F]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#111318] dark:text-[#ECEDEE]"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] text-[#111318] dark:text-[#ECEDEE] placeholder:text-[#7C8490] dark:placeholder:text-[#55585F] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8490] dark:text-[#55585F] hover:text-[#454B55] dark:hover:text-[#8B8F96] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlash size={18} weight="regular" />
                  ) : (
                    <Eye size={18} weight="regular" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-[#CD2B31]/5 dark:bg-[#E5484D]/10 px-3 py-2.5 text-sm text-[#CD2B31] dark:text-[#E5484D]">
                <WarningCircle
                  size={16}
                  weight="fill"
                  className="mt-0.5 shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B8841] hover:bg-[#097435] dark:bg-[#2EAD5E] dark:hover:bg-[#38C06B] text-white dark:text-[#0A0B0D] font-medium transition-colors cursor-pointer"
            >
              {loading ? (
                <CircleNotch size={18} className="animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-[#7C8490] dark:text-[#55585F]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-[#0B8841] dark:text-[#2EAD5E] hover:text-[#097435] dark:hover:text-[#38C06B] transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
