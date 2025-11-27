"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Package,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const landlordMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Properties",
    icon: Building2,
    href: "/dashboard/properties",
  },
  {
    title: "Units",
    icon: Home,
    href: "/dashboard/units",
  },
  {
    title: "Tenants",
    icon: Users,
    href: "/dashboard/tenants",
  },
  {
    title: "Payments",
    icon: CreditCard,
    href: "/dashboard/payments",
  },
  {
    title: "Monthly Billings",
    icon: DollarSign,
    href: "/dashboard/billings",
  },
  {
    title: "Reports",
    icon: FileText,
    href: "/dashboard/reports",
  },
  {
    title: "Complaints",
    icon: MessageSquare,
    href: "/dashboard/complaints",
  },
  {
    title: "Store Inventory",
    icon: Package,
    href: "/dashboard/inventory",
  },

  {
    title: "Notifications",
    icon: Bell,
    href: "/dashboard/notifications",
  },

];

const tenantMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "My Units",
    icon: Home,
    href: "/dashboard/tenant-units",
  },
  {
    title: "Properties",
    icon: Building2,
    href: "/dashboard/tenant-properties",
  },
  {
    title: "Payments",
    icon: CreditCard,
    href: "/dashboard/payments",
  },
  {
    title: "Complaints",
    icon: MessageSquare,
    href: "/dashboard/complaints",
  },
  {
    title: "My Reports",
    icon: FileText,
    href: "/dashboard/reports",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/dashboard/notifications",
  },

];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { data: session } = useSession();

  const menuItems = session?.user?.role === "LANDLORD" ? landlordMenuItems : tenantMenuItems;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-navy-dark text-white transition-all duration-300 flex flex-col z-40",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-neon-blue rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold">Elshadai</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer relative",
                  isActive
                    ? "bg-neon-blue text-navy-dark shadow-lg"
                    : "text-gray-300 hover:bg-sky-blue/20 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-neon-blue rounded-xl -z-10"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl w-full text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
