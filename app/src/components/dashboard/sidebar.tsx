"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  House,
  Ticket,
  Users,
  Trophy,
  Plugs,
  Gear,
  SignOut,
  Truck,
} from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: "admin" | "operator";
  };
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: House },
  { label: "Tickets", href: "/dashboard/tickets", icon: Ticket },
  { label: "Drivers", href: "/dashboard/drivers", icon: Users },
  { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
];

const adminItems = [
  { label: "Connections", href: "/dashboard/connections", icon: Plugs },
  { label: "Settings", href: "/dashboard/settings", icon: Gear },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const allNavItems =
    user.role === "admin" ? [...navItems, ...adminItems] : navItems;

  return (
    <aside className="sticky top-0 flex h-screen w-[204px] shrink-0 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Truck size={24} weight="fill" className="text-foreground" />
          <div className="flex items-baseline gap-0">
            <span className="text-[22px] font-bold tracking-tight text-foreground">
              Fleet
            </span>
            <span className="text-[22px] font-bold tracking-tight text-[#0B8841] dark:text-[#2EAD5E]">
              Relay
            </span>
          </div>
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {allNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-md px-3 text-sm transition-colors duration-150",
                active
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User section */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar size="default">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {user.full_name}
          </span>
          <span className="text-xs capitalize text-muted-foreground">
            {user.role}
          </span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleSignOut}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
            >
              <SignOut size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Sign out</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
