"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Info,
  X,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "PAYMENT_APPROVED":
      case "PAYMENT_REJECTED":
        return CreditCard;
      case "COMPLAINT_UPDATE":
        return MessageSquare;
      case "LEASE_REQUEST":
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "PAYMENT_APPROVED":
        return "bg-green-100 text-green-600";
      case "PAYMENT_REJECTED":
        return "bg-red-100 text-red-600";
      case "COMPLAINT_UPDATE":
        return "bg-blue-100 text-blue-600";
      case "LEASE_REQUEST":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark mb-2">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-neon-blue hover:bg-blue-50 rounded-lg transition-colors"
          >
            <CheckCheck className="w-5 h-5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b-2 border-gray-100">
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-3 font-medium transition-colors ${
            filter === "all"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-gray-600 hover:text-navy-dark"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
            filter === "unread"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-gray-600 hover:text-navy-dark"
          }`}
        >
          Unread ({unreadCount})
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-neon-blue text-white rounded-full text-xs">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-6 py-3 font-medium transition-colors ${
            filter === "read"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-gray-600 hover:text-navy-dark"
          }`}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-xl shadow-sm border-2 p-4 transition-all cursor-pointer ${
                  notification.isRead
                    ? "border-gray-100 hover:border-gray-200"
                    : "border-neon-blue/30 bg-blue-50/30 hover:border-neon-blue"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`${colorClass} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className={`font-semibold ${notification.isRead ? "text-gray-700" : "text-navy-dark"}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-neon-blue rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className={`text-sm mb-2 ${notification.isRead ? "text-gray-500" : "text-gray-700"}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

