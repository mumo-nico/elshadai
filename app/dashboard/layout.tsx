import Sidebar from "@/components/ui/sidebar";
import Navbar from "@/components/ui/navbar";
import { SidebarProvider } from "@/contexts/sidebar-context";
import DashboardContent from "./dashboard-content";

export const metadata = {
  title: "Dashboard - Elshadai Apartments",
  description: "Manage your properties, tenants, and payments",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <DashboardContent>
          <Navbar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </DashboardContent>
      </div>
    </SidebarProvider>
  );
}
