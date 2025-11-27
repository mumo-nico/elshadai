"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Calendar,
  Building2,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface BillingData {
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  propertyName: string;
  unitNumber: string;
  monthlyRent: number;
  amountPaid: number;
  status: string;
  rentDue: number;
}

interface TenantOption {
  userId: string;
  name: string;
  email?: string;
}

export default function BillingsPage() {
  const { data: session } = useSession();
  const [billings, setBillings] = useState<BillingData[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  useEffect(() => {
    if (session?.user.role === "LANDLORD") {
      fetchProperties();
      fetchTenants();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user.role === "LANDLORD") {
      fetchBillings();
    }
  }, [session, propertyFilter, tenantFilter, monthFilter, yearFilter]);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties");
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/tenants");
      const data = await response.json();
      
      // Transform the data to ensure we have the structure we expect
      const transformedTenants = data.map((tenant: any) => ({
        userId: tenant.userId,
        name: tenant.user?.name || tenant.name || "Unknown",
        email: tenant.user?.email || tenant.email || "",
      }));
      
      setTenants(transformedTenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      setTenants([]);
    }
  };

  const fetchBillings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (propertyFilter !== "all") params.append("propertyId", propertyFilter);
      if (tenantFilter !== "all") params.append("tenantId", tenantFilter);
      params.append("month", monthFilter.toString());
      params.append("year", yearFilter.toString());

      const response = await fetch(`/api/billings?${params.toString()}`);
      const data = await response.json();
      setBillings(data);
    } catch (error) {
      console.error("Error fetching billings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FULLY_PAID":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Fully Paid
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Partially Paid
          </span>
        );
      case "NOT_PAID":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Not Paid
          </span>
        );
      default:
        return null;
    }
  };

  const months = [
    { value: "all", label: "All Months" },
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = [
    { value: "all", label: "All Years" },
    ...Array.from({ length: 5 }, (_, i) => ({
      value: currentYear - i,
      label: (currentYear - i).toString(),
    })),
  ];

  if (session?.user.role !== "LANDLORD") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Access denied. Landlords only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-navy-dark mb-2">
            Monthly Billings
          </h1>
          <p className="text-gray-600">
            Track monthly rent payments for all tenants
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Property Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Property
              </label>
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
              >
                <option value="all">All Properties</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tenant Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Tenant
              </label>
              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
              >
                <option value="all">All Tenants</option>
                {tenants.map((tenant) => (
                  <option key={tenant.userId} value={tenant.userId}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Month
              </label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Year
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
              >
                {years.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Billings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b-2 border-gray-100">
            <h2 className="text-xl font-bold text-navy-dark">Billing Records</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                    Tenant ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                    Unit Number
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading billing data...
                    </td>
                  </tr>
                ) : billings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No billing records found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  billings.map((billing, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-navy-dark font-medium">
                        {billing.tenantId}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{billing.tenantName}</td>
                      <td className="px-6 py-4 text-gray-600">{billing.propertyName}</td>
                      <td className="px-6 py-4 text-gray-600">{billing.unitNumber}</td>
                      <td className="px-6 py-4 text-gray-600">
                        KSh {billing.monthlyRent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-navy-dark font-semibold">
                        KSh {billing.amountPaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(billing.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}