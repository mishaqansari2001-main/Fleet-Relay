"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  CircleNotch,
  CheckCircle,
} from "@phosphor-icons/react";

export function NewDriverClient() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = firstName.trim() && phoneNumber.trim() && !saving && !saved;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("drivers")
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        phone_number: phoneNumber.trim(),
        username: username.trim() || null,
      })
      .select("id, first_name, last_name, username")
      .single();

    if (insertError || !data) {
      setError(insertError?.message || "Failed to create driver");
      setSaving(false);
      return;
    }

    // Write to localStorage for cross-tab communication
    localStorage.setItem(
      "fleetrelay_new_driver",
      JSON.stringify({
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
      })
    );

    setSaved(true);
    setSaving(false);

    // Close tab after brief delay
    setTimeout(() => {
      window.close();
    }, 800);
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div className="space-y-1 mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Add Driver
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a new driver record. This tab will close automatically after saving.
        </p>
      </div>

      {saved ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#0B8841]/10 dark:bg-[#2EAD5E]/10">
            <CheckCircle
              size={24}
              weight="fill"
              className="text-[#0B8841] dark:text-[#2EAD5E]"
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            Driver added successfully
          </p>
          <p className="text-xs text-muted-foreground">
            Closing this tab...
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name <span className="text-[#CD2B31]">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-9 bg-background border-border text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-9 bg-background border-border text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-[#CD2B31]">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-9 bg-background border-border text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Telegram Username
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                @
              </span>
              <Input
                id="username"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9 pl-7 bg-background border-border text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#CD2B31] dark:text-[#E5484D]">
              {error}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="bg-[#0B8841] hover:bg-[#097435] dark:bg-[#2EAD5E] dark:hover:bg-[#38C06B] text-white dark:text-[#0A0B0D]"
            >
              {saving ? (
                <CircleNotch size={16} className="animate-spin mr-1.5" />
              ) : (
                <UserPlus size={16} weight="bold" className="mr-1.5" />
              )}
              Add Driver
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
