"use client";

import { useState } from "react";
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
  CheckCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type Role = "admin" | "operator";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("operator");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("An account with this email already exists.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#111318] dark:text-[#ECEDEE]">
            Fleet<span className="text-[#0B8841] dark:text-[#2EAD5E]">Relay</span>
          </h1>
        </div>

        <Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B8841]/10 dark:bg-[#2EAD5E]/10">
                <CheckCircle
                  size={28}
                  weight="fill"
                  className="text-[#0B8841] dark:text-[#2EAD5E]"
                />
              </div>
              <h2 className="text-lg font-semibold text-[#111318] dark:text-[#ECEDEE]">
                Check your email
              </h2>
              <p className="text-sm text-[#454B55] dark:text-[#8B8F96] leading-relaxed">
                We sent a verification link to{" "}
                <span className="font-medium text-[#111318] dark:text-[#ECEDEE]">
                  {email}
                </span>
                . Click the link to verify your account.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-[#7C8490] dark:text-[#55585F]">
          Already verified?{" "}
          <Link
            href="/login"
            className="font-medium text-[#0B8841] dark:text-[#2EAD5E] hover:text-[#097435] dark:hover:text-[#38C06B] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
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
            Create an account
          </CardTitle>
          <CardDescription className="text-[#7C8490] dark:text-[#55585F]">
            Get started with FleetRelay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-[#111318] dark:text-[#ECEDEE]"
              >
                Full name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] text-[#111318] dark:text-[#ECEDEE] placeholder:text-[#7C8490] dark:placeholder:text-[#55585F]"
              />
            </div>

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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111318] dark:text-[#ECEDEE]">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("operator")}
                  className={cn(
                    "flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    role === "operator"
                      ? "border-[#0B8841] dark:border-[#2EAD5E] bg-[#0B8841]/5 dark:bg-[#2EAD5E]/10 text-[#0B8841] dark:text-[#2EAD5E]"
                      : "border-[#DFE2E6] dark:border-[#222429] text-[#454B55] dark:text-[#8B8F96] hover:border-[#C0C6CE] dark:hover:border-[#32353C]"
                  )}
                >
                  Operator
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={cn(
                    "flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    role === "admin"
                      ? "border-[#0B8841] dark:border-[#2EAD5E] bg-[#0B8841]/5 dark:bg-[#2EAD5E]/10 text-[#0B8841] dark:text-[#2EAD5E]"
                      : "border-[#DFE2E6] dark:border-[#222429] text-[#454B55] dark:text-[#8B8F96] hover:border-[#C0C6CE] dark:hover:border-[#32353C]"
                  )}
                >
                  Admin
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
                "Create account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-[#7C8490] dark:text-[#55585F]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#0B8841] dark:text-[#2EAD5E] hover:text-[#097435] dark:hover:text-[#38C06B] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
