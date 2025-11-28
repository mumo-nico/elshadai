"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, CheckCircle, XCircle, AlertCircle, Home } from "lucide-react";

interface PaymentHistory {
  unit: {
    id: string;
    unitNumber: string;
    property: string;
    monthlyRent: number;
  };
  totalPaid: number;
  overpayment: number;
  rentDue: number;
  monthlyBreakdown: {
    month: string;
    monthlyRent: number;
    amountPaid: number;
    status: string;
  }[];
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payment history...</p>
      </div>
    </div>
  );
}

// Main page component that wraps the content in Suspense
export default function UnitPaymentsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnitPaymentsContent />
    </Suspense>
  );
}

// Content component that uses useSearchParams
function UnitPaymentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unitId = searchParams.get("unitId");

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (unitId) {
      fetchPaymentHistory();
    }
  }, [unitId]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tenant/unit-payments?unitId=${unitId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);
      } else {
        alert("Failed to fetch payment history");
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      alert("Failed to fetch payment history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (!paymentHistory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Payment history not found</p>
          <button
            onClick={() => router.push("/dashboard/tenant-units")}
            className="mt-4 px-6 py-2 bg-neon-blue text-white rounded-lg hover:bg-sky-blue transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard/tenant-units")}
          className="flex items-center gap-2 text-gray-600 hover:text-neon-blue transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to My Units
        </button>
        <div className="bg-gradient-to-r from-neon-blue to-sky-blue p-6 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <Home className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Payment History</h1>
          </div>
          <p className="text-white/80">
            Unit {paymentHistory.unit.unitNumber} - {paymentHistory.unit.property}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100">
          <p className="text-sm text-gray-600 mb-2">Total Paid</p>
          <p className="text-3xl font-bold text-neon-blue">
            KSh {paymentHistory.totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-100">
          <p className="text-sm text-gray-600 mb-2">Overpayment</p>
          <p className="text-3xl font-bold text-green-600">
            KSh {paymentHistory.overpayment.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-100">
          <p className="text-sm text-gray-600 mb-2">Rent Due</p>
          <p className="text-3xl font-bold text-red-600">
            KSh {paymentHistory.rentDue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-100">
          <h2 className="text-xl font-bold text-navy-dark">Monthly Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                  Month
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                  Monthly Rent
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                  Amount Paid
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paymentHistory.monthlyBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No payment records found
                  </td>
                </tr>
              ) : (
                paymentHistory.monthlyBreakdown.map((month, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-navy-dark font-medium">
                      {month.month}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      KSh {month.monthlyRent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-navy-dark font-semibold">
                      KSh {month.amountPaid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {month.status === "FULLY_PAID" && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium w-fit">
                          <CheckCircle className="w-4 h-4" />
                          Fully Paid
                        </span>
                      )}
                      {month.status === "PARTIALLY_PAID" && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium w-fit">
                          <AlertCircle className="w-4 h-4" />
                          Partially Paid
                        </span>
                      )}
                      {month.status === "NOT_PAID" && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium w-fit">
                          <XCircle className="w-4 h-4" />
                          Not Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Rent Button */}
      {paymentHistory.rentDue > 0 && (
        <div className="bg-gradient-to-r from-neon-blue to-sky-blue rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Outstanding Rent</h3>
              <p className="text-white/80">
                You have KSh {paymentHistory.rentDue.toLocaleString()} in outstanding rent
              </p>
            </div>
            <a
              href="/dashboard/payments"
              className="px-6 py-3 bg-white text-neon-blue rounded-xl hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Pay Now
            </a>
          </div>
        </div>
      )}
    </div>
  );
}


