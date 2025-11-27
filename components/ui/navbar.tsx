"use client";

import { useState, useEffect } from "react";
import { Search, Bell, User, ChevronDown, LogOut, UserCircle } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.slice(0, 5)); // Only show 5 most recent
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsNotificationDropdownOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const handleProfileView = () => {
    router.push("/dashboard/profile");
    setIsDropdownOpen(false);
  };

  return (
    <header className="w-full bg-white border-b-2 border-gray-100 sticky top-0 z-30">
      <div className="px-8 py-4 flex justify-between items-center">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties, tenants, payments..."
              className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              className="relative p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border-2 border-gray-100 py-2 z-50 max-h-[500px] overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-navy-dark">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-gray-500">{unreadCount} unread</span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <>
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                          !notification.isRead ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-neon-blue rounded-full mt-2 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium mb-1 ${!notification.isRead ? "text-navy-dark" : "text-gray-700"}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setIsNotificationDropdownOpen(false);
                        router.push("/dashboard/notifications");
                      }}
                      className="w-full px-4 py-3 text-center text-sm text-neon-blue hover:bg-blue-50 transition-colors font-medium"
                    >
                      View all notifications
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 pl-4 border-l-2 border-gray-200 hover:bg-gray-50 rounded-xl pr-3 py-2 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-neon-blue flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-navy-dark">
                  {session?.user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {session?.user?.role?.toLowerCase() || "Guest"}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border-2 border-gray-100 py-2 z-50">
                <button
                  onClick={handleProfileView}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <UserCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-navy-dark">View Profile</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-500">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isDropdownOpen || isNotificationDropdownOpen) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsNotificationDropdownOpen(false);
          }}
        />
      )}
    </header>
  );
}
