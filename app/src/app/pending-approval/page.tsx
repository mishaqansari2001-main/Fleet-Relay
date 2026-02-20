"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, SignOut } from "@phosphor-icons/react";
import { useState } from "react";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#F6F7F8] dark:bg-[#0A0B0D] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#111318] dark:text-[#ECEDEE]">
            Fleet<span className="text-[#0B8841] dark:text-[#2EAD5E]">Relay</span>
          </h1>
        </div>

        <Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C07D10]/10 dark:bg-[#F5D90A]/10">
                <Clock
                  size={28}
                  weight="fill"
                  className="text-[#C07D10] dark:text-[#F5D90A]"
                />
              </div>
              <h2 className="text-lg font-semibold text-[#111318] dark:text-[#ECEDEE]">
                Pending approval
              </h2>
              <p className="text-sm text-[#454B55] dark:text-[#8B8F96] leading-relaxed">
                Your account is pending admin approval. You will be able to access the dashboard once an administrator approves your account.
              </p>
              <Button
                onClick={handleSignOut}
                disabled={loading}
                variant="outline"
                className="mt-2 border-[#DFE2E6] dark:border-[#222429] text-[#454B55] dark:text-[#8B8F96] hover:text-[#111318] dark:hover:text-[#ECEDEE] cursor-pointer"
              >
                <SignOut size={16} weight="regular" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
