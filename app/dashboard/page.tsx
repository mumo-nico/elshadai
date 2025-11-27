"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Home,
  DollarSign,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function DashboardHome() {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (session?.user?.role) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const endpoint = session?.user?.role === "LANDLORD" 
        ? "/api/dashboard/landlord" 
        : "/api/dashboard/tenant";
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Format time
  const formatTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format date
  const formatDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Greeting and Time */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark mb-2">
            {getGreeting()}, {session?.user?.name}!
          </h1>
          <p className="text-gray-600">
            {session?.user?.role === "LANDLORD"
              ? "Here's what's happening with your properties today."
              : "Welcome to your tenant dashboard."}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-2xl font-bold text-neon-blue mb-1">
            <Clock className="w-6 h-6" />
            {formatTime()}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {formatDate()}
          </div>
        </div>
      </div>

      {/* Render dashboard based on role */}
      {session?.user?.role === "LANDLORD" ? (
        <LandlordDashboard stats={stats} />
      ) : (
        <TenantDashboard stats={stats} />
      )}
    </div>
  );
}

// Landlord Dashboard Component
function LandlordDashboard({ stats }: { stats: any }) {
  if (!stats) return null;

  const dashboardStats = [
    {
      title: "Total Properties",
      value: stats.totalProperties,
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      title: "Total Units",
      value: stats.totalUnits,
      icon: Home,
      color: "bg-purple-500",
      subtitle: `${stats.occupiedUnits} occupied, ${stats.availableUnits} available`,
    },
    {
      title: "Active Tenants",
      value: stats.totalTenants,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  const revenueStats = [
    {
      title: "Total Revenue",
      value: `KSh ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-neon-blue",
    },
    {
      title: "This Month",
      value: `KSh ${stats.monthlyRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: "bg-green-600",
    },
    {
      title: "Rent Due",
      value: `KSh ${stats.totalRentDue.toLocaleString()}`,
      icon: AlertCircle,
      color: "bg-red-500",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingPayments,
      icon: Clock,
      color: "bg-yellow-500",
    },
  ];

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-navy-dark">{stat.value}</p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-navy-dark">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
          <h3 className="text-lg font-bold text-navy-dark mb-4">Recent Tenant Assignments</h3>
          <div className="space-y-3">
            {stats.recentTenants && stats.recentTenants.length > 0 ? (
              stats.recentTenants.map((tenant: any) => (
                <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-navy-dark">{tenant.user.name}</p>
                    <p className="text-sm text-gray-600">
                      Unit {tenant.unit.unitNumber} - {tenant.unit.property.name}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent tenant assignments</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
          <h3 className="text-lg font-bold text-navy-dark mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {stats.recentPayments && stats.recentPayments.length > 0 ? (
              stats.recentPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-navy-dark">{payment.user.name}</p>
                    <p className="text-sm text-gray-600">
                      Unit {payment.unit.unitNumber} - KSh {payment.amount.toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    payment.status === "APPROVED" ? "bg-green-100 text-green-700" :
                    payment.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {payment.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent payments</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Tenant Dashboard Component
function TenantDashboard({ stats }: { stats: any }) {
  if (!stats) return null;

  const tenantStats = [
    {
      title: "Units Leased",
      value: stats.unitsLeased,
      icon: Home,
      color: "bg-blue-500",
    },
    {
      title: "Rent Due",
      value: `KSh ${stats.totalRentDue.toLocaleString()}`,
      icon: AlertCircle,
      color: "bg-red-500",
    },
    {
      title: "Total Paid",
      value: `KSh ${stats.totalPaymentsMade.toLocaleString()}`,
      icon: CreditCard,
      color: "bg-green-500",
    },
    {
      title: "This Month",
      value: `KSh ${stats.thisMonthPayments.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-neon-blue",
    },
  ];

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tenantStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-navy-dark">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* My Units */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
        <h3 className="text-lg font-bold text-navy-dark mb-4">My Units</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.tenantAssignments && stats.tenantAssignments.length > 0 ? (
            stats.tenantAssignments.map((assignment: any) => (
              <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-navy-dark">Unit {assignment.unit.unitNumber}</p>
                    <p className="text-sm text-gray-600">{assignment.unit.property.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    assignment.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {assignment.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    Monthly Rent: <span className="font-semibold text-navy-dark">KSh {assignment.monthlyRent.toLocaleString()}</span>
                  </p>
                  <p className="text-gray-600">
                    Rent Due: <span className={`font-semibold ${assignment.rentDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      KSh {assignment.rentDue.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-2">No units assigned yet</p>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
        <h3 className="text-lg font-bold text-navy-dark mb-4">Recent Payments</h3>
        <div className="space-y-3">
          {stats.recentPayments && stats.recentPayments.length > 0 ? (
            stats.recentPayments.map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-navy-dark">
                    Unit {payment.unit.unitNumber} - {payment.unit.property.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    KSh {payment.amount.toLocaleString()} - {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  payment.status === "APPROVED" ? "bg-green-100 text-green-700" :
                  payment.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {payment.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No payments yet</p>
          )}
        </div>
      </div>
    </>
  );
}

