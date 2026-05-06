"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  X,
  CheckCheck,
  MessageSquareWarning,
  ShieldCheck,
  Briefcase,
  MessageCircle,
  CreditCard,
  HelpCircle,
  ExternalLink,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store/useAppStore";
import { useAuth, getLogoutRedirect } from "@/hooks/useAuth";
import { useDashboardDayStore, type DashboardDay } from "@/store/useDashboardDayStore";
import type { UserRole } from "@/types";
import { useNotificationStore, type Notification, type NotificationType } from "@/store/useNotificationStore";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

// ─── Live date/time hook ──────────────────────────────────────────────────────
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const date = now.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { day, date, time };
}

// ─── Notification icon by type ─────────────────────────────────────────────────
function NotifIcon({ type }: { type: NotificationType }) {
  const map: Record<NotificationType, { icon: React.ReactNode; bg: string }> = {
    rfq_match: { icon: <Briefcase size={14} />, bg: "bg-emerald-100 text-emerald-700" },
    project_update: { icon: <ShieldCheck size={14} />, bg: "bg-blue-100 text-blue-700" },
    message: { icon: <MessageCircle size={14} />, bg: "bg-violet-100 text-violet-700" },
    proposal: { icon: <MessageSquareWarning size={14} />, bg: "bg-amber-100 text-amber-700" },
    system: { icon: <Settings size={14} />, bg: "bg-slate-100 text-slate-600" },
    payment: { icon: <CreditCard size={14} />, bg: "bg-rose-100 text-rose-700" },
  };
  const { icon, bg } = map[type] ?? map.system;
  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", bg)}>
      {icon}
    </div>
  );
}

// ─── Notification Panel ────────────────────────────────────────────────────────
function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notifications, markAsRead, markAllAsRead, dismiss } = useNotificationStore();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  if (!open) return null;

  function handleAction(n: Notification) {
    markAsRead(n.id);
    if (n.actionHref) router.push(n.actionHref);
    onClose();
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
      style={{ maxHeight: "calc(100vh - 80px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#1F6F54] text-white text-[10px] font-bold leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-[11px] font-medium text-[#1F6F54] hover:underline"
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 shrink-0">
        {(["all", "unread"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 text-xs font-semibold capitalize transition-colors",
              tab === t
                ? "text-[#1F6F54] border-b-2 border-[#1F6F54]"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            {t === "unread" ? `Unread (${unreadCount})` : "All"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Bell size={28} className="mb-2 opacity-40" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs mt-0.5">You're all caught up!</p>
          </div>
        ) : (
          visible.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group",
                n.read ? "hover:bg-slate-50" : "bg-emerald-50/40 hover:bg-emerald-50/70"
              )}
              onClick={() => handleAction(n)}
            >
              <NotifIcon type={n.type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-xs leading-snug", n.read ? "font-medium text-slate-700" : "font-semibold text-slate-900")}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#1F6F54] shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                  {n.description}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-slate-400">{formatRelativeTime(n.time)}</span>
                  {n.actionLabel && (
                    <span className="text-[10px] font-semibold text-[#1F6F54] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      {n.actionLabel} <ExternalLink size={9} />
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                className="shrink-0 w-5 h-5 flex items-center justify-center text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all rounded"
              >
                <X size={11} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100 shrink-0">
          <button
            onClick={() => { router.push("/dashboard"); onClose(); }}
            className="w-full text-center text-xs font-semibold text-[#1F6F54] hover:underline"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard State Switcher (TEMPORARY — dev/staging only) ─────────────────

const DAY_TABS: { id: DashboardDay; label: string }[] = [
  { id: "day0",  label: "Day 0"  },
  { id: "day1",  label: "Day 1"  },
  { id: "day10", label: "Day 10" },
];

function DashboardStateSwitcher() {
  const { dashboardDay, setDashboardDay } = useDashboardDayStore();
  return (
    <div className="hidden md:flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
      {DAY_TABS.map((tab) => {
        const active = dashboardDay === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setDashboardDay(tab.id)}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 select-none",
              active
                ? "bg-white text-[#1F6F54] shadow-sm ring-1 ring-[#1F6F54]/20"
                : "text-slate-400 hover:text-slate-600 hover:bg-white/60",
            )}
            style={active ? { boxShadow: "0 0 0 1px rgba(31,111,84,0.18), 0 0 8px rgba(31,111,84,0.10)" } : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Profile type label helper ────────────────────────────────────────────────

function getProfileLabel(role: UserRole, subtype?: string): string {
  // profileSubtype is the source of truth — set explicitly during login
  if (subtype === "researcher") return "Researcher";
  if (subtype === "pi")         return "Independent CRO";
  switch (role) {
    case "manufacturing": return "Manufacturer";
    case "cro":           return "CRO";
    case "scientist":     return "Scientist";
    case "researcher":    return "Researcher";
    case "pi":            return "Independent CRO";
    default:              return "User";
  }
}

// ─── TopNav ───────────────────────────────────────────────────────────────────
export function TopNav() {
  const { user, signout } = useAuth();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { notifications } = useNotificationStore();
  const router = useRouter();
  const pathname = usePathname();
  const { day, date, time } = useLiveClock();
  const [notifOpen, setNotifOpen] = useState(false);

  // Show the dev state switcher only on the main dashboard route
  const showDaySwitcher = pathname === "/dashboard";

  const unreadCount = notifications.filter((n) => !n.read).length;
  // Use full name from auth store; fall back gracefully — never static placeholder
  const displayName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  return (
    <header className="h-16 bg-white border-b border-[#E2E5E3] flex items-center justify-between px-4 md:px-6 flex-shrink-0 sticky top-0 z-40">

      {/* ── Left: hamburger (mobile/tablet) + greeting ── */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only visible below lg breakpoint */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

      <button
        onClick={() => router.push("/settings")}
        className="flex flex-col justify-center text-left hover:opacity-75 transition-opacity cursor-pointer"
      >
        <p className="text-[16px] font-medium text-[#09090b] leading-6">
          Hello, {displayName}
        </p>
        <p className="text-[14px] text-[#68747A] leading-6">
          {day}, {date} &nbsp;·&nbsp; {time}
        </p>
      </button>
      </div>{/* end left group */}

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-3">

        {/* Message icon */}
        <button
          onClick={() => router.push("/dashboard/proposals")}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors relative"
          title="Messages"
        >
          <MessageSquareWarning size={20} />
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-xl transition-colors relative",
              notifOpen ? "bg-slate-100 text-[#1F6F54]" : "text-slate-500 hover:bg-slate-100"
            )}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-[#1F6F54] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* Profile type badge */}
        {user && (
          <span
            className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full select-none"
            style={{
              background: "rgba(31,111,84,0.07)",
              border: "1px solid rgba(31,111,84,0.16)",
              color: "#1F6F54",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F54] flex-shrink-0" />
            {getProfileLabel(user.role, user.profileSubtype)}
          </span>
        )}

        {/* ── Dashboard state switcher (TEMPORARY — dev staging only) ── */}
        {showDaySwitcher && <DashboardStateSwitcher />}

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1F6F54] to-[#0172E7] flex items-center justify-center shrink-0 text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "J"}
              </div>
              {/* Name + role */}
              <div className="hidden md:flex flex-col items-start leading-snug">
                <span className="text-[14px] font-medium text-[#404040]">
                  {user?.name ?? "Joe, Denial"}
                </span>
                <span className="text-[12px] text-[#68747A] capitalize">
                  {user?.role ?? "Admin"}
                </span>
              </div>
              <ChevronDown
                size={16}
                className="text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            {/* User info header */}
            <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
              <p className="text-sm font-semibold text-slate-900">{user?.name ?? "Joe Denial"}</p>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email ?? "joe@scimplify.com"}</p>
            </div>

            <DropdownMenuLabel>Account</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User size={15} className="text-slate-400" />
              <span>View Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings size={15} className="text-slate-400" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/settings/change-password")}>
              <ShieldCheck size={15} className="text-slate-400" />
              <span>Change Password</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Support</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              <HelpCircle size={15} className="text-slate-400" />
              <span>Help & Support</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              <ExternalLink size={15} className="text-slate-400" />
              <span>What&apos;s New</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                // Capture role + profileSubtype BEFORE signout clears auth state.
                // profileSubtype is checked first — it's always set by
                // CROScientistLoginPage and survives even if role is stale.
                const redirectTo = getLogoutRedirect(user?.role, user?.profileSubtype);
                signout();
                router.push(redirectTo);
              }}
              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
            >
              <LogOut size={15} className="text-rose-500" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
