"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Eye,
  Download,
  Check,
  X,
  Clock,
} from "lucide-react";
import MakePaymentModal from "@/components/dashboard/make-payment-modal";
import ViewPaymentModal from "@/components/dashboard/view-payment-modal";
import PayDeficitModal from "@/components/dashboard/pay-deficit-modal";
import { generatePaymentReceipt } from "@/lib/pdf-receipt";

export default function PaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeficitModalOpen, setIsDeficitModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    if (session) {
      fetchPayments();
      fetchStats();
    }
  }, [session]);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments");
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const endpoint = session?.user?.role === "LANDLORD"
        ? "/api/dashboard/landlord"
        : "/api/dashboard/tenant";
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark mb-2">Payments</h1>
          <p className="text-gray-600">
            {session?.user?.role === "LANDLORD"
              ? "Manage tenant payments and approvals"
              : "View your payment history and make new payments"}
          </p>
        </div>
        {session?.user?.role === "TENANT" && (
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Make Payment
          </button>
        )}
      </div>

      {/* Render based on role */}
      {session?.user?.role === "LANDLORD" ? (
        <LandlordPayments payments={payments} onRefresh={fetchPayments} />
      ) : (
        <TenantPayments
          payments={payments}
          stats={stats}
          onRefresh={() => {
            fetchPayments();
            fetchStats();
          }}
          onPayDeficit={() => setIsDeficitModalOpen(true)}
        />
      )}

      {/* Make Payment Modal */}
      {isPaymentModalOpen && (
        <MakePaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            fetchPayments();
            fetchStats();
          }}
        />
      )}

      {/* View Payment Modal */}
      {isViewModalOpen && selectedPayment && (
        <ViewPaymentModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
        />
      )}

      {/* Pay Deficit Modal */}
      {isDeficitModalOpen && stats && (
        <PayDeficitModal
          isOpen={isDeficitModalOpen}
          onClose={() => setIsDeficitModalOpen(false)}
          onSuccess={() => {
            fetchPayments();
            fetchStats();
          }}
          totalDeficit={stats.totalRentDue || 0}
        />
      )}
    </div>
  );
}

// Tenant Payments Component
function TenantPayments({ payments, stats, onRefresh, onPayDeficit }: any) {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleViewPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  if (!stats) return null;

  const hasDeficit = stats.totalRentDue > 0;

  const tenantStats = [
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
      title: "Average/Month",
      value: `KSh ${stats.averageMonthlyPayment.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-blue-500",
    },
    {
      title: "Paid This Year",
      value: `KSh ${stats.thisYearPayments.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-neon-blue",
    },
  ];

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tenantStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6"
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

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden">
        <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy-dark">Payment History</h2>
          {hasDeficit && (
            <button
              onClick={onPayDeficit}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              Pay Deficit (KSh {stats.totalRentDue.toLocaleString()})
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Unit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Month/Year</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No payments found. Make your first payment to get started.
                  </td>
                </tr>
              ) : (
                payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-navy-dark">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      Unit {payment.unit.unitNumber} - {payment.unit.property.name}
                    </td>
                    <td className="px-6 py-4 text-navy-dark font-semibold">
                      KSh {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{payment.paymentMethod}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.month}/{payment.year}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        payment.status === "APPROVED" ? "bg-green-100 text-green-700" :
                        payment.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        </button>
                        {payment.isApproved && (
                          <button
                            onClick={() => generatePaymentReceipt(payment)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                            title="Download Receipt"
                          >
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Payment Modal */}
      {isViewModalOpen && selectedPayment && (
        <ViewPaymentModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
        />
      )}
    </>
  );
}

// Landlord Payments Component
function LandlordPayments({ payments, onRefresh }: any) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleViewPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const handleApprove = async (paymentId: string) => {
    if (!confirm("Are you sure you want to approve this payment?")) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}/approve`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Payment approved successfully!");
        onRefresh();
      } else {
        alert("Failed to approve payment");
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment");
    }
  };

  const handleDeny = async (paymentId: string) => {
    const reason = prompt("Enter reason for denial (optional):");
    if (reason === null) return; // User cancelled

    try {
      const response = await fetch(`/api/payments/${paymentId}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert("Payment denied successfully!");
        onRefresh();
      } else {
        alert("Failed to deny payment");
      }
    } catch (error) {
      console.error("Error denying payment:", error);
      alert("Failed to deny payment");
    }
  };

  const filteredPayments = payments.filter((p: any) => {
    if (filter === "pending") return p.status === "PENDING";
    if (filter === "approved") return p.status === "APPROVED";
    return true;
  });

  const pendingCount = payments.filter((p: any) => p.status === "PENDING").length;

  return (
    <>
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
          All Payments ({payments.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
            filter === "pending"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-gray-600 hover:text-navy-dark"
          }`}
        >
          Pending Approval ({pendingCount})
          {pendingCount > 0 && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-6 py-3 font-medium transition-colors ${
            filter === "approved"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-gray-600 hover:text-navy-dark"
          }`}
        >
          Approved
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Tenant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Unit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Month/Year</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No payments found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-navy-dark">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{payment.user.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      Unit {payment.unit.unitNumber} - {payment.unit.property.name}
                    </td>
                    <td className="px-6 py-4 text-navy-dark font-semibold">
                      KSh {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{payment.paymentMethod}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.month}/{payment.year}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        payment.status === "APPROVED" ? "bg-green-100 text-green-700" :
                        payment.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {payment.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(payment.id)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                              title="Approve Payment"
                            >
                              <Check className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                            </button>
                            <button
                              onClick={() => handleDeny(payment.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                              title="Deny Payment"
                            >
                              <X className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        </button>
                        {payment.isApproved && (
                          <button
                            onClick={() => generatePaymentReceipt(payment)}
                            className="p-2 hover:bg-purple-50 rounded-lg transition-colors group"
                            title="Download Receipt"
                          >
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Payment Modal */}
      {isViewModalOpen && selectedPayment && (
        <ViewPaymentModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
        />
      )}
    </>
  );
}



