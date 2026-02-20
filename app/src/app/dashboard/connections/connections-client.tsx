"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChatCircleDots,
  UsersThree,
  Plus,
  Trash,
  PencilSimple,
  Check,
  X,
  CircleNotch,
  Plugs,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { type TelegramConnection, timeAgo } from "@/lib/types";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

interface ConnectionsClientProps {
  connections: TelegramConnection[];
  ticketCounts: Record<string, number>;
  lastActivity: Record<string, string>;
}

export function ConnectionsClient({
  connections,
  ticketCounts,
  lastActivity,
}: ConnectionsClientProps) {
  useRealtimeRefresh("telegram_connections");

  const dmConnections = connections.filter(
    (c) => c.connection_type === "business_account"
  );
  const groupConnections = connections.filter(
    (c) => c.connection_type === "group"
  );

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addType, setAddType] = useState<"business_account" | "group">(
    "business_account"
  );


  function openAddDialog(type: "business_account" | "group") {
    setAddType(type);
    setAddDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Connections
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your Telegram integrations.
        </p>
      </div>

      {/* Business DMs Section */}
      {dmConnections.length > 0 && (
        <ConnectionSection
          title="Business Direct Messages"
          count={dmConnections.length}
          icon={ChatCircleDots}
          connections={dmConnections}
          ticketCounts={ticketCounts}
          lastActivity={lastActivity}
          onAdd={() => openAddDialog("business_account")}
          addLabel="Add Business DM"
        />
      )}

      {/* Group Chats Section */}
      {groupConnections.length > 0 && (
        <ConnectionSection
          title="Group Chats"
          count={groupConnections.length}
          icon={UsersThree}
          connections={groupConnections}
          ticketCounts={ticketCounts}
          lastActivity={lastActivity}
          onAdd={() => openAddDialog("group")}
          addLabel="Add Group Chat"
        />
      )}

      {/* Empty state */}
      {connections.length === 0 && (
        <Card className="bg-card border-border shadow-sm dark:shadow-none">
          <CardContent className="py-20 text-center">
            <Plugs size={36} className="mx-auto text-muted-foreground/60 mb-4" />
            <p className="text-sm font-medium text-foreground">
              No connections configured
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[300px] mx-auto">
              Add a Business DM or Group Chat connection to start receiving
              Telegram messages.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAddDialog("business_account")}
              >
                <ChatCircleDots size={14} />
                Add Business DM
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAddDialog("group")}
              >
                <UsersThree size={14} />
                Add Group Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AddConnectionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        connectionType={addType}
      />
    </div>
  );
}

// ── Connection Section ──

function ConnectionSection({
  title,
  count,
  icon: Icon,
  connections,
  ticketCounts,
  lastActivity,
  onAdd,
  addLabel,
}: {
  title: string;
  count: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  connections: TelegramConnection[];
  ticketCounts: Record<string, number>;
  lastActivity: Record<string, string>;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center gap-2 px-1">
        <Icon size={14} className="text-foreground" />
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          {title}
        </h2>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums">
          {count}
        </span>
      </div>

      {/* Connection list */}
      <Card className="bg-card border-border shadow-sm dark:shadow-none overflow-hidden">
        <CardContent className="p-0">
          {connections.map((conn, idx) => (
            <ConnectionRow
              key={conn.id}
              connection={conn}
              ticketCount={ticketCounts[conn.id] ?? 0}
              lastActivityAt={lastActivity[conn.id]}
              isLast={idx === connections.length - 1}
            />
          ))}

          {/* Add connection row */}
          <button
            onClick={onAdd}
            className={cn(
              "flex w-full items-center gap-2 px-4 py-3 text-sm text-muted-foreground",
              "border-t border-dashed border-border",
              "transition-colors duration-150 hover:bg-foreground/[0.02] hover:text-foreground"
            )}
          >
            <Plus size={14} />
            {addLabel}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Connection Row ──

function ConnectionRow({
  connection,
  ticketCount,
  lastActivityAt,
  isLast,
}: {
  connection: TelegramConnection;
  ticketCount: number;
  lastActivityAt?: string;
  isLast: boolean;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(connection.display_name);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isDM = connection.connection_type === "business_account";

  async function handleToggleActive() {
    setToggling(true);
    const supabase = createClient();
    await supabase
      .from("telegram_connections")
      .update({ is_active: !connection.is_active })
      .eq("id", connection.id);
    router.refresh();
    setToggling(false);
  }

  async function handleSaveName() {
    if (!editName.trim() || editName.trim() === connection.display_name) {
      setIsEditing(false);
      setEditName(connection.display_name);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("telegram_connections")
      .update({ display_name: editName.trim() })
      .eq("id", connection.id);
    setIsEditing(false);
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase
      .from("telegram_connections")
      .delete()
      .eq("id", connection.id);
    setDeleteDialogOpen(false);
    setDeleting(false);
    router.refresh();
  }

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-3 px-4 py-3.5 transition-colors duration-100",
          "hover:bg-foreground/[0.015]",
          !isLast && "border-b border-border"
        )}
      >
        {/* Type icon */}
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
            connection.is_active
              ? "bg-foreground/[0.06] dark:bg-white/[0.08]"
              : "bg-foreground/[0.03]"
          )}
        >
          {isDM ? (
            <ChatCircleDots
              size={17}
              className={cn(
                "transition-colors duration-150",
                connection.is_active
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
            />
          ) : (
            <UsersThree
              size={17}
              className={cn(
                "transition-colors duration-150",
                connection.is_active
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
            />
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditName(connection.display_name);
                  }
                }}
                className="h-7 text-sm max-w-[240px]"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="flex size-6 items-center justify-center rounded text-[#0B8841] dark:text-[#2EAD5E] hover:bg-[#0B8841]/5 dark:hover:bg-[#2EAD5E]/5 transition-colors"
              >
                {saving ? (
                  <CircleNotch size={14} className="animate-spin" />
                ) : (
                  <Check size={14} weight="bold" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(connection.display_name);
                }}
                className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "text-sm font-medium truncate transition-colors duration-150",
                    connection.is_active
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {connection.display_name}
                </span>
                {connection.is_active && (
                  <span className="inline-flex items-center rounded-full bg-[#0B8841] dark:bg-[#2EAD5E] px-2.5 py-0.5 text-[10px] font-semibold text-white dark:text-[#0A0B0D] leading-none shrink-0">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground">
                  {isDM ? "Business DM" : "Group Chat"}
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {ticketCount} {ticketCount === 1 ? "ticket" : "tickets"}
                </span>
                {lastActivityAt && (
                  <>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[11px] text-muted-foreground">
                      Last {timeAgo(lastActivityAt)}
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Switch
              checked={connection.is_active}
              onCheckedChange={handleToggleActive}
              disabled={toggling}
              size="sm"
            />
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
              <button
                onClick={() => {
                  setEditName(connection.display_name);
                  setIsEditing(true);
                }}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-100"
              >
                <PencilSimple size={14} />
              </button>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-[#CD2B31] hover:bg-[#CD2B31]/5 transition-colors duration-100"
              >
                <Trash size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {connection.display_name}
              </span>
              ? Messages from this connection will no longer be processed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting && (
                <CircleNotch size={14} className="animate-spin" />
              )}
              Delete Connection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Add Connection Dialog ──

function AddConnectionDialog({
  open,
  onOpenChange,
  connectionType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionType: "business_account" | "group";
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [saving, setSaving] = useState(false);

  const isDM = connectionType === "business_account";

  function handleClose() {
    setDisplayName("");
    setIdentifier("");
    onOpenChange(false);
  }

  async function handleAdd() {
    if (!displayName.trim() || !identifier.trim()) return;
    setSaving(true);
    const supabase = createClient();

    await supabase.from("telegram_connections").insert({
      connection_type: connectionType,
      display_name: displayName.trim(),
      business_connection_id: isDM ? identifier.trim() : null,
      chat_id: isDM ? null : Number(identifier.trim()),
      is_active: true,
    });

    setSaving(false);
    handleClose();
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add {isDM ? "Business DM" : "Group Chat"} Connection
          </DialogTitle>
          <DialogDescription>
            {isDM
              ? "Register a Telegram Business Account DM connection."
              : "Register a Telegram Group Chat connection."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={
                isDM ? "e.g., Main Support DM" : "e.g., Dispatch Group"
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {isDM ? "Business Connection ID" : "Chat ID"}
            </label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                isDM ? "e.g., biz_abc123" : "e.g., -1001234567890"
              }
            />
            <p className="text-xs text-muted-foreground">
              {isDM
                ? "The business_connection_id from Telegram Business API."
                : "The negative chat ID for your Telegram group."}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={saving || !displayName.trim() || !identifier.trim()}
            className="bg-foreground hover:bg-foreground/90 text-background"
          >
            {saving ? (
              <CircleNotch size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Add Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
