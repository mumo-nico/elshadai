"use client";

import * as React from "react";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

export default function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isCollapsed ? "ml-20" : "ml-64"
      )}
    >
      {children}
    </div>
  );
}

