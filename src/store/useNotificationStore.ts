"use client";

import { create } from "zustand";

export type NotificationType =
  | "rfq_match"
  | "project_update"
  | "message"
  | "proposal"
  | "system"
  | "payment";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: Date;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}

interface NotificationStore {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  addNotification: (n: Omit<Notification, "id" | "time" | "read">) => void;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "rfq_match",
    title: "New RFQ Match",
    description: "A buyer is looking for Pesticide Intermediate (5 MT). Your profile matches 92%.",
    time: new Date(Date.now() - 1000 * 60 * 4),
    read: false,
    actionLabel: "View RFQ",
    actionHref: "/dashboard/projects",
  },
  {
    id: "2",
    type: "message",
    title: "New Message from Buyer",
    description: "Aditya Chemicals sent you a message about your Agrochemical capabilities.",
    time: new Date(Date.now() - 1000 * 60 * 22),
    read: false,
    actionLabel: "Reply",
    actionHref: "/dashboard/proposals",
  },
  {
    id: "3",
    type: "proposal",
    title: "Proposal Shortlisted",
    description: "Your proposal for 'High-pressure hydrogenation (90 bar)' has been shortlisted.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    actionLabel: "View Proposal",
    actionHref: "/dashboard/proposals",
  },
  {
    id: "4",
    type: "project_update",
    title: "Project Status Updated",
    description: "Order #SCN-2041 has moved to 'In Production'. Estimated delivery: Apr 18.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
    actionLabel: "Track Order",
    actionHref: "/dashboard/orders",
  },
  {
    id: "5",
    type: "system",
    title: "Profile Verification Pending",
    description: "Submit your GST certificate and plant photos to get verified faster.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    actionLabel: "Complete Profile",
    actionHref: "/settings",
  },
  {
    id: "6",
    type: "rfq_match",
    title: "3 New RFQs in Your Category",
    description: "New opportunities in Pharma intermediates matching your capabilities.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
    actionLabel: "Browse RFQs",
    actionHref: "/dashboard/projects",
  },
];

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: MOCK_NOTIFICATIONS,

  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  dismiss: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [
        {
          ...n,
          id: String(Date.now()),
          time: new Date(),
          read: false,
        },
        ...s.notifications,
      ],
    })),
}));
