"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Gear,
  Users,
  UsersThree,
  Trophy,
  Plus,
  Trash,
  PencilSimple,
  Check,
  X,
  CircleNotch,
  WarningCircle,
  FloppyDisk,
  CaretDown,
  CaretRight,
  UserPlus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  type Setting,
  type Team,
  type ScoreCategory,
  type User,
  type UserStatus,
  userStatusConfig,
  getInitials,
  timeAgo,
} from "@/lib/types";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

// ── Types ──
type UserWithTeam = User & {
  team: Pick<Team, "id" | "name"> | null;
};

interface SettingsClientProps {
  settings: Setting[];
  users: UserWithTeam[];
  teams: Team[];
  scoreCategories: ScoreCategory[];
  scoreCategoryUsage: Record<string, number>;
  teamMemberCounts: Record<string, number>;
}

// ── Main Component ──
export function SettingsClient({
  settings,
  users,
  teams,
  scoreCategories,
  scoreCategoryUsage,
  teamMemberCounts,
}: SettingsClientProps) {
  useRealtimeRefresh("settings");
  useRealtimeRefresh("users");
  useRealtimeRefresh("teams");
  useRealtimeRefresh("score_categories");

  const pendingCount = users.filter((u) => u.status === "pending_approval").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your FleetRelay instance.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="general" className="gap-1.5">
            <Gear size={16} />
            General
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users size={16} />
            Users
            {pendingCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 px-1.5 text-[10px] bg-[#C07D10]/10 text-[#C07D10]"
              >
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="teams" className="gap-1.5">
            <UsersThree size={16} />
            Teams
          </TabsTrigger>
          <TabsTrigger value="scoring" className="gap-1.5">
            <Trophy size={16} />
            Scoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSection settings={settings} />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersSection users={users} teams={teams} />
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          <TeamsSection
            teams={teams}
            users={users}
            teamMemberCounts={teamMemberCounts}
          />
        </TabsContent>

        <TabsContent value="scoring" className="mt-6">
          <ScoringSection
            scoreCategories={scoreCategories}
            scoreCategoryUsage={scoreCategoryUsage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// GENERAL SECTION
// ══════════════════════════════════════════════════════════

function GeneralSection({ settings }: { settings: Setting[] }) {
  const router = useRouter();
  const settingsMap = useMemo(() => {
    const map: Record<string, Setting> = {};
    settings.forEach((s) => {
      map[s.key] = s;
    });
    return map;
  }, [settings]);

  const [companyName, setCompanyName] = useState(
    settingsMap["company_name"]
      ? String(settingsMap["company_name"].value)
      : ""
  );
  const [slaThreshold, setSlaThreshold] = useState(
    settingsMap["sla_urgency_threshold_minutes"]
      ? String(settingsMap["sla_urgency_threshold_minutes"].value)
      : "30"
  );
  const [complianceTarget, setComplianceTarget] = useState(
    settingsMap["sla_compliance_target"]
      ? String(settingsMap["sla_compliance_target"].value)
      : "85"
  );
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const hasChanges =
    companyName !== String(settingsMap["company_name"]?.value ?? "") ||
    slaThreshold !==
      String(settingsMap["sla_urgency_threshold_minutes"]?.value ?? "30") ||
    complianceTarget !==
      String(settingsMap["sla_compliance_target"]?.value ?? "85");

  async function handleSave() {
    setSaving(true);
    setSaveSuccess(false);
    const supabase = createClient();

    const updates = [
      supabase
        .from("settings")
        .upsert({ key: "company_name", value: companyName as unknown as Setting["value"] }),
      supabase
        .from("settings")
        .upsert({
          key: "sla_urgency_threshold_minutes",
          value: Number(slaThreshold) as unknown as Setting["value"],
        }),
      supabase
        .from("settings")
        .upsert({
          key: "sla_compliance_target",
          value: Number(complianceTarget) as unknown as Setting["value"],
        }),
    ];

    await Promise.all(updates);
    setSaving(false);
    setSaveSuccess(true);
    router.refresh();
    setTimeout(() => setSaveSuccess(false), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">General</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure basic settings for your FleetRelay instance.
        </p>
      </div>

      {/* Properties */}
      <div className="space-y-0 divide-y divide-border">
        {/* Company Name */}
        <div className="flex items-start gap-8 py-5">
          <div className="w-[200px] shrink-0">
            <label className="text-sm font-medium text-foreground">
              Company Name
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Displayed across the dashboard.
            </p>
          </div>
          <div className="flex-1 max-w-md">
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
            />
          </div>
        </div>

        {/* SLA Threshold */}
        <div className="flex items-start gap-8 py-5">
          <div className="w-[200px] shrink-0">
            <label className="text-sm font-medium text-foreground">
              SLA Threshold
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Minutes before flagged as urgent.
            </p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={slaThreshold}
                onChange={(e) => setSlaThreshold(e.target.value)}
                placeholder="30"
                className="w-[120px]"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>
        </div>

        {/* SLA Compliance Target */}
        <div className="flex items-start gap-8 py-5">
          <div className="w-[200px] shrink-0">
            <label className="text-sm font-medium text-foreground">
              SLA Compliance Target
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Target % of tickets resolved within SLA.
            </p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={complianceTarget}
                onChange={(e) => setComplianceTarget(e.target.value)}
                placeholder="85"
                className="w-[120px]"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="bg-foreground hover:bg-foreground/90 text-background"
        >
          {saving ? (
            <CircleNotch size={16} className="animate-spin" />
          ) : (
            <FloppyDisk size={16} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {saveSuccess && (
          <span className="text-sm text-[#0B8841] dark:text-[#2EAD5E] flex items-center gap-1">
            <Check size={14} weight="bold" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// USERS SECTION
// ══════════════════════════════════════════════════════════

function UsersSection({
  users,
  teams,
}: {
  users: UserWithTeam[];
  teams: Team[];
}) {
  const [userTab, setUserTab] = useState<"pending" | "active" | "deactivated">("pending");

  const pendingUsers = users.filter((u) => u.status === "pending_approval");
  const activeUsers = users.filter((u) => u.status === "active");
  const deactivatedUsers = users.filter(
    (u) => u.status === "rejected" || u.status === "deactivated"
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(
          [
            { key: "pending", label: "Pending Approvals", count: pendingUsers.length },
            { key: "active", label: "Active Users", count: activeUsers.length },
            { key: "deactivated", label: "Deactivated", count: deactivatedUsers.length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setUserTab(tab.key)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
              userTab === tab.key
                ? "bg-foreground/[0.06] text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {userTab === "pending" && (
        <PendingUsersTable users={pendingUsers} />
      )}
      {userTab === "active" && (
        <ActiveUsersTable users={activeUsers} teams={teams} />
      )}
      {userTab === "deactivated" && (
        <DeactivatedUsersTable users={deactivatedUsers} />
      )}
    </div>
  );
}

// ── Pending Users ──
function PendingUsersTable({ users }: { users: UserWithTeam[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectDialogUser, setRejectDialogUser] = useState<UserWithTeam | null>(null);

  async function handleApprove(userId: string) {
    setLoading(userId);
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ status: "active" })
      .eq("id", userId);
    router.refresh();
    setLoading(null);
  }

  async function handleReject(userId: string) {
    setLoading(userId);
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ status: "rejected" })
      .eq("id", userId);
    setRejectDialogUser(null);
    router.refresh();
    setLoading(null);
  }

  if (users.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
        <CardContent className="py-12 text-center">
          <Users size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No pending approval requests.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Requested Role</TableHead>
                <TableHead>Signed Up</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        <AvatarFallback>
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {timeAgo(user.created_at)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(user.id)}
                        disabled={loading === user.id}
                        className="bg-foreground hover:bg-foreground/90 text-background"
                      >
                        {loading === user.id ? (
                          <CircleNotch size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} weight="bold" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectDialogUser(user)}
                        disabled={loading === user.id}
                        className="text-[#CD2B31] border-[#CD2B31]/20 hover:bg-[#CD2B31]/5"
                      >
                        <X size={14} weight="bold" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!rejectDialogUser}
        onOpenChange={(open) => !open && setRejectDialogUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject{" "}
              <span className="font-medium text-foreground">
                {rejectDialogUser?.full_name}
              </span>
              ? They will not be able to access the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                rejectDialogUser && handleReject(rejectDialogUser.id)
              }
            >
              Reject User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Active Users ──
function ActiveUsersTable({
  users,
  teams,
}: {
  users: UserWithTeam[];
  teams: Team[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<UserWithTeam | null>(null);

  async function handleDeactivate(userId: string) {
    setLoading(userId);
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ status: "deactivated" })
      .eq("id", userId);
    setDeactivateUser(null);
    router.refresh();
    setLoading(null);
  }

  async function handleTeamChange(userId: string, teamId: string) {
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ team_id: teamId === "none" ? null : teamId })
      .eq("id", userId);
    router.refresh();
  }

  if (users.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
        <CardContent className="py-12 text-center">
          <Users size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No active users found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        <AvatarFallback>
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.team_id ?? "none"}
                      onValueChange={(value) =>
                        handleTeamChange(user.id, value)
                      }
                    >
                      <SelectTrigger size="sm" className="w-[160px]">
                        <SelectValue placeholder="No team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No team</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeactivateUser(user)}
                      disabled={loading === user.id}
                      className="text-[#CD2B31] border-[#CD2B31]/20 hover:bg-[#CD2B31]/5"
                    >
                      <X size={14} weight="bold" />
                      Deactivate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deactivateUser}
        onOpenChange={(open) => !open && setDeactivateUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate{" "}
              <span className="font-medium text-foreground">
                {deactivateUser?.full_name}
              </span>
              ? They will lose access to the platform immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                deactivateUser && handleDeactivate(deactivateUser.id)
              }
            >
              Deactivate User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Deactivated Users ──
function DeactivatedUsersTable({ users }: { users: UserWithTeam[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleReactivate(userId: string) {
    setLoading(userId);
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ status: "active" })
      .eq("id", userId);
    router.refresh();
    setLoading(null);
  }

  if (users.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
        <CardContent className="py-12 text-center">
          <Users size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No deactivated users.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const statusCfg = userStatusConfig[user.status as UserStatus];
              return (
                <TableRow key={user.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        <AvatarFallback>
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("border-transparent", statusCfg?.className)}
                    >
                      {statusCfg?.label ?? user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReactivate(user.id)}
                      disabled={loading === user.id}
                    >
                      {loading === user.id ? (
                        <CircleNotch size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} weight="bold" />
                      )}
                      Reactivate
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════
// TEAMS SECTION
// ══════════════════════════════════════════════════════════

function TeamsSection({
  teams,
  users,
  teamMemberCounts,
}: {
  teams: Team[];
  users: UserWithTeam[];
  teamMemberCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState("");
  const [savingTeamName, setSavingTeamName] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [assigningToTeam, setAssigningToTeam] = useState<string | null>(null);
  const [assignKey, setAssignKey] = useState(0);

  const activeOperators = users.filter(
    (u) => u.status === "active" && u.role === "operator"
  );
  const unassignedOperators = activeOperators.filter((u) => !u.team_id);

  function toggleTeam(teamId: string) {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  }

  function getTeamMembers(teamId: string) {
    return activeOperators.filter((u) => u.team_id === teamId);
  }

  async function handleCreateTeam() {
    if (!newTeamName.trim()) return;
    setCreating(true);
    const supabase = createClient();
    await supabase.from("teams").insert({ name: newTeamName.trim() });
    setNewTeamName("");
    setCreating(false);
    router.refresh();
  }

  async function handleDeleteTeam(teamId: string) {
    setDeleting(true);
    const supabase = createClient();
    // Unassign all members first
    await supabase
      .from("users")
      .update({ team_id: null })
      .eq("team_id", teamId);
    await supabase.from("teams").delete().eq("id", teamId);
    setDeleteTeam(null);
    setDeleting(false);
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      next.delete(teamId);
      return next;
    });
    router.refresh();
  }

  async function handleRemoveMember(userId: string) {
    setRemovingUserId(userId);
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ team_id: null })
      .eq("id", userId);
    setRemovingUserId(null);
    router.refresh();
  }

  async function handleAssignToTeam(userId: string, teamId: string) {
    setAssigningToTeam(userId);
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ team_id: teamId })
      .eq("id", userId);
    setAssigningToTeam(null);
    setAssignKey((k) => k + 1);
    router.refresh();
  }

  function startEditingTeam(team: Team) {
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
  }

  async function handleSaveTeamName(teamId: string) {
    if (!editingTeamName.trim()) return;
    setSavingTeamName(true);
    const supabase = createClient();
    await supabase
      .from("teams")
      .update({ name: editingTeamName.trim() })
      .eq("id", teamId);
    setEditingTeamId(null);
    setSavingTeamName(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Create team inline */}
      <div className="flex gap-3 max-w-md">
        <Input
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="New team name..."
          onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
        />
        <Button
          onClick={handleCreateTeam}
          disabled={creating || !newTeamName.trim()}
          className="bg-foreground hover:bg-foreground/90 text-background shrink-0"
        >
          {creating ? (
            <CircleNotch size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Create
        </Button>
      </div>

      {/* Teams list */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <UsersThree size={32} weight="light" />
          <p className="mt-2 text-sm">No teams created yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          {teams.map((team, idx) => {
            const members = getTeamMembers(team.id);
            const isExpanded = expandedTeams.has(team.id);
            const isEditing = editingTeamId === team.id;
            const isLast = idx === teams.length - 1;

            return (
              <div key={team.id}>
                {/* Team header row */}
                <div
                  className={cn(
                    "group flex items-center gap-2 px-4 py-2.5 transition-colors duration-100",
                    "hover:bg-foreground/[0.02]",
                    !isLast && !isExpanded && "border-b border-border"
                  )}
                >
                  {/* Toggle caret */}
                  <button
                    onClick={() => toggleTeam(team.id)}
                    className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {isExpanded ? (
                      <CaretDown size={14} weight="bold" />
                    ) : (
                      <CaretRight size={14} weight="bold" />
                    )}
                  </button>

                  {/* Team name / edit */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Input
                        value={editingTeamName}
                        onChange={(e) => setEditingTeamName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveTeamName(team.id);
                          if (e.key === "Escape") setEditingTeamId(null);
                        }}
                        className="h-7 text-sm max-w-[200px]"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveTeamName(team.id)}
                        disabled={savingTeamName || !editingTeamName.trim()}
                        className="flex size-6 items-center justify-center rounded text-[#0B8841] dark:text-[#2EAD5E] hover:bg-[#0B8841]/5 dark:hover:bg-[#2EAD5E]/5 transition-colors"
                      >
                        {savingTeamName ? (
                          <CircleNotch size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} weight="bold" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingTeamId(null)}
                        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleTeam(team.id)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      <span className="text-sm font-medium text-foreground truncate">
                        {team.name}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {members.length} {members.length === 1 ? "member" : "members"}
                      </span>
                    </button>
                  )}

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTeam(team);
                        }}
                        className="flex size-7 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <PencilSimple size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTeam(team);
                        }}
                        className="flex size-7 items-center justify-center rounded text-muted-foreground hover:text-[#CD2B31] hover:bg-[#CD2B31]/5 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded members */}
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-150 ease-out",
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div
                    className={cn(
                      "overflow-hidden min-h-0 bg-foreground/[0.015] dark:bg-foreground/[0.02]",
                      !isLast && isExpanded && "border-b border-border"
                    )}
                  >
                    {members.length === 0 ? (
                      <div className="px-11 py-4 text-sm text-muted-foreground">
                        No members assigned to this team.
                      </div>
                    ) : (
                      members.map((member) => (
                        <div
                          key={member.id}
                          className="group/member flex items-center gap-3 px-4 py-2 pl-11 hover:bg-foreground/[0.02] transition-colors duration-100"
                        >
                          <Avatar size="sm">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-foreground truncate block">
                              {member.full_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {member.email}
                            </span>
                          </div>
                          <Badge variant="outline" className="capitalize text-[10px] shrink-0">
                            {member.role}
                          </Badge>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removingUserId === member.id}
                            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:text-[#CD2B31] hover:bg-[#CD2B31]/5 opacity-0 group-hover/member:opacity-100 transition-all duration-100 shrink-0"
                          >
                            {removingUserId === member.id ? (
                              <CircleNotch size={14} className="animate-spin" />
                            ) : (
                              <Trash size={14} />
                            )}
                          </button>
                        </div>
                      ))
                    )}

                    {/* Assign operator dropdown inside expanded team */}
                    {unassignedOperators.length > 0 && (
                      <div className="px-4 py-2.5 pl-11">
                        <Select
                          key={`assign-${team.id}-${assignKey}`}
                          onValueChange={(userId) =>
                            handleAssignToTeam(userId, team.id)
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            className="w-[200px] text-muted-foreground"
                            disabled={assigningToTeam !== null}
                          >
                            <UserPlus size={14} className="shrink-0" />
                            <SelectValue placeholder="Add member..." />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={4}>
                            {unassignedOperators.map((op) => (
                              <SelectItem key={op.id} value={op.id}>
                                {op.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unassigned operators */}
      {unassignedOperators.length > 0 && teams.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
            Unassigned Operators ({unassignedOperators.length})
          </h3>
          <div className="rounded-lg border border-dashed border-border">
            {unassignedOperators.map((op, idx) => (
              <div
                key={op.id}
                className={cn(
                  "group/unassigned flex items-center gap-3 px-4 py-2.5",
                  idx < unassignedOperators.length - 1 && "border-b border-border"
                )}
              >
                <Avatar size="sm">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(op.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground truncate block">
                    {op.full_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {op.email}
                  </span>
                </div>
                <Select
                  key={`unassigned-${op.id}-${assignKey}`}
                  onValueChange={(teamId) =>
                    handleAssignToTeam(op.id, teamId)
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="w-[160px] text-muted-foreground"
                    disabled={assigningToTeam === op.id}
                  >
                    <UserPlus size={14} className="shrink-0" />
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTeam}
        onOpenChange={(open) => !open && setDeleteTeam(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              {(teamMemberCounts[deleteTeam?.id ?? ""] ?? 0) > 0 ? (
                <>
                  <span className="font-medium text-foreground">
                    {deleteTeam?.name}
                  </span>{" "}
                  has {teamMemberCounts[deleteTeam?.id ?? ""] ?? 0} members who
                  will become unassigned. Are you sure?
                </>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">
                    {deleteTeam?.name}
                  </span>
                  ? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={() => deleteTeam && handleDeleteTeam(deleteTeam.id)}
            >
              {deleting && <CircleNotch size={14} className="animate-spin" />}
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SCORING SECTION
// ══════════════════════════════════════════════════════════

function ScoringSection({
  scoreCategories,
  scoreCategoryUsage,
}: {
  scoreCategories: ScoreCategory[];
  scoreCategoryUsage: Record<string, number>;
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<ScoreCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<ScoreCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add form state
  const [newName, setNewName] = useState("");
  const [newPoints, setNewPoints] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  async function handleAdd() {
    if (!newName.trim() || !newPoints) return;
    setAddSaving(true);
    const supabase = createClient();
    await supabase.from("score_categories").insert({
      name: newName.trim(),
      points: Number(newPoints),
    });
    setNewName("");
    setNewPoints("");
    setAddOpen(false);
    setAddSaving(false);
    router.refresh();
  }

  function openEdit(category: ScoreCategory) {
    setEditCategory(category);
    setEditName(category.name);
    setEditPoints(String(category.points));
  }

  async function handleEdit() {
    if (!editCategory || !editName.trim() || !editPoints) return;
    setEditSaving(true);
    const supabase = createClient();
    await supabase
      .from("score_categories")
      .update({ name: editName.trim(), points: Number(editPoints) })
      .eq("id", editCategory.id);
    setEditCategory(null);
    setEditSaving(false);
    router.refresh();
  }

  async function handleToggleActive(category: ScoreCategory) {
    const supabase = createClient();
    await supabase
      .from("score_categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);
    router.refresh();
  }

  async function handleDelete(categoryId: string) {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("score_categories").delete().eq("id", categoryId);
    setDeleteCategory(null);
    setDeleting(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Score Categories</CardTitle>
              <CardDescription>
                Manage scoring categories used when resolving tickets.
              </CardDescription>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-foreground hover:bg-foreground/90 text-background"
            >
              <Plus size={16} />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {scoreCategories.length === 0 ? (
            <div className="py-12 text-center px-6">
              <Trophy size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No score categories created yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Category</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scoreCategories.map((category) => {
                  const usageCount = scoreCategoryUsage[category.id] ?? 0;
                  const canDelete = usageCount === 0;
                  return (
                    <TableRow key={category.id} className="group">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              category.is_active
                                ? "text-foreground"
                                : "text-muted-foreground line-through"
                            )}
                          >
                            {category.name}
                          </span>
                          <button
                            onClick={() => openEdit(category)}
                            className="flex size-6 items-center justify-center rounded text-foreground/30 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all duration-150"
                          >
                            <PencilSimple size={13} />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => setDeleteCategory(category)}
                              className="flex size-6 items-center justify-center rounded text-foreground/30 hover:text-[#CD2B31] hover:bg-[#CD2B31]/5 opacity-0 group-hover:opacity-100 transition-all duration-150"
                            >
                              <Trash size={13} />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {category.points} {category.points === 1 ? "pt" : "pts"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={category.is_active ?? false}
                            onCheckedChange={() => handleToggleActive(category)}
                            size="sm"
                          />
                          <span className="text-xs text-muted-foreground">
                            {category.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {usageCount} {usageCount === 1 ? "ticket" : "tickets"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Score Category</DialogTitle>
            <DialogDescription>
              Create a new category for scoring resolved tickets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Breakdown Assistance"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Points
              </label>
              <Input
                type="number"
                min={1}
                value={newPoints}
                onChange={(e) => setNewPoints(e.target.value)}
                placeholder="e.g., 5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={addSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={addSaving || !newName.trim() || !newPoints}
              className="bg-foreground hover:bg-foreground/90 text-background"
            >
              {addSaving ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={!!editCategory}
        onOpenChange={(open) => !open && setEditCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Score Category</DialogTitle>
            <DialogDescription>
              Update the name and points for this category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Points
              </label>
              <Input
                type="number"
                min={1}
                value={editPoints}
                onChange={(e) => setEditPoints(e.target.value)}
                placeholder="Points"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditCategory(null)}
              disabled={editSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={editSaving || !editName.trim() || !editPoints}
              className="bg-foreground hover:bg-foreground/90 text-background"
            >
              {editSaving ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <FloppyDisk size={16} />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Score Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteCategory?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={() =>
                deleteCategory && handleDelete(deleteCategory.id)
              }
            >
              {deleting && <CircleNotch size={14} className="animate-spin" />}
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
