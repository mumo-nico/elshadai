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
  FileText,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import { generatePDFReport } from "@/lib/pdf-report-generator";
import { generateExcelReport } from "@/lib/excel-generator";

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

interface MonthlyBreakdown {
  month: string;
  monthlyRent: number;
  amountPaid: number;
  status: string;
}

interface UnitBreakdown {
  unitId: string;
  unitNumber: string;
  propertyName: string;
  monthlyRent: number;
  totalPaid: number;
  overpayment: number;
  rentDue: number;
  monthlyBreakdown: MonthlyBreakdown[];
}

interface BreakdownData {
  tenantName: string;
  tenantEmail: string;
  units: UnitBreakdown[];
}

export default function BillingsPage() {
  const { data: session } = useSession();
  const [billings, setBillings] = useState<BillingData[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [breakdownData, setBreakdownData] = useState<BreakdownData | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Filters
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState<number | string>(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState<number | string>(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (session?.user.role === "LANDLORD") {
      fetchProperties();
      fetchTenants();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user.role === "LANDLORD") {
      // Check if we should show breakdown (All Months selected and specific tenant)
      if (monthFilter === "all" && tenantFilter !== "all") {
        fetchBreakdown();
      } else {
        setShowBreakdown(false);
        fetchBillings();
      }
    }
  }, [session, propertyFilter, tenantFilter, monthFilter, yearFilter, statusFilter]);

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

      // The /api/tenants endpoint returns User objects with id, name, email
      // Transform to the structure we need
      const transformedTenants = data.map((user: any) => ({
        userId: user.id, // User.id is the userId
        name: user.name || "Unknown",
        email: user.email || "",
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
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/billings?${params.toString()}`);
      const data = await response.json();
      setBillings(data);
    } catch (error) {
      console.error("Error fetching billings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreakdown = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/billings/breakdown?tenantId=${tenantFilter}`);
      if (response.ok) {
        const data = await response.json();
        setBreakdownData(data);
        setShowBreakdown(true);
      } else {
        console.error("Failed to fetch breakdown");
        setShowBreakdown(false);
      }
    } catch (error) {
      console.error("Error fetching breakdown:", error);
      setShowBreakdown(false);
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

  const years = [
    { value: "all", label: "All Years" },
    ...Array.from({ length: 6 }, (_, i) => ({
      value: 2025 + i,
      label: (2025 + i).toString(),
    })),
  ];

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "FULLY_PAID", label: "Fully Paid" },
    { value: "PARTIALLY_PAID", label: "Partially Paid" },
    { value: "NOT_PAID", label: "Not Paid" },
  ];

  // Get filter labels for display
  const getFilterSummary = () => {
    const filters: string[] = [];

    const propertyName = propertyFilter === "all"
      ? "All Properties"
      : properties.find(p => p.id === propertyFilter)?.name || propertyFilter;
    filters.push(`Property: ${propertyName}`);

    const tenantName = tenantFilter === "all"
      ? "All Tenants"
      : tenants.find(t => t.userId === tenantFilter)?.name || tenantFilter;
    filters.push(`Tenant: ${tenantName}`);

    const monthLabel = months.find(m => m.value.toString() === monthFilter.toString())?.label || monthFilter;
    filters.push(`Month: ${monthLabel}`);

    const yearLabel = years.find(y => y.value.toString() === yearFilter.toString())?.label || yearFilter;
    filters.push(`Year: ${yearLabel}`);

    const statusLabel = statuses.find(s => s.value === statusFilter)?.label || statusFilter;
    filters.push(`Status: ${statusLabel}`);

    return filters;
  };

  // Download PDF function
  const handleDownloadPDF = () => {
    if (billings.length === 0 && !showBreakdown) {
      alert("No billing data to download.");
      return;
    }

    const filterSummary = getFilterSummary().join(" | ");
    const headers = ["Tenant ID", "Full Name", "Property", "Unit", "Monthly Rent", "Amount Paid", "Status"];

    let data: any[][] = [];

    if (showBreakdown && breakdownData) {
      // For breakdown view, flatten the data
      breakdownData.units.forEach(unit => {
        unit.monthlyBreakdown.forEach(month => {
          data.push([
            breakdownData.tenantName,
            breakdownData.tenantEmail,
            unit.propertyName,
            unit.unitNumber,
            `KSh ${month.monthlyRent.toLocaleString()}`,
            `KSh ${month.amountPaid.toLocaleString()}`,
            month.status.replace("_", " "),
          ]);
        });
      });
    } else {
      data = billings.map(billing => [
        billing.tenantId,
        billing.tenantName,
        billing.propertyName,
        billing.unitNumber,
        `KSh ${billing.monthlyRent.toLocaleString()}`,
        `KSh ${billing.amountPaid.toLocaleString()}`,
        billing.status.replace("_", " "),
      ]);
    }

    generatePDFReport({
      title: "Monthly Billings Report",
      dateRange: filterSummary,
      headers,
      data,
      filename: `billings-report-${new Date().toISOString().split('T')[0]}.pdf`,
    });
  };

  // Download Excel function
  const handleDownloadExcel = () => {
    if (billings.length === 0 && !showBreakdown) {
      alert("No billing data to download.");
      return;
    }

    const filterSummary = getFilterSummary().join(" | ");
    const headers = ["Tenant ID", "Full Name", "Property", "Unit", "Monthly Rent", "Amount Paid", "Status"];

    let data: any[][] = [];

    if (showBreakdown && breakdownData) {
      breakdownData.units.forEach(unit => {
        unit.monthlyBreakdown.forEach(month => {
          data.push([
            breakdownData.tenantName,
            breakdownData.tenantEmail,
            unit.propertyName,
            unit.unitNumber,
            `KSh ${month.monthlyRent.toLocaleString()}`,
            `KSh ${month.amountPaid.toLocaleString()}`,
            month.status.replace("_", " "),
          ]);
        });
      });
    } else {
      data = billings.map(billing => [
        billing.tenantId,
        billing.tenantName,
        billing.propertyName,
        billing.unitNumber,
        `KSh ${billing.monthlyRent.toLocaleString()}`,
        `KSh ${billing.amountPaid.toLocaleString()}`,
        billing.status.replace("_", " "),
      ]);
    }

    generateExcelReport({
      title: "Monthly Billings Report",
      dateRange: filterSummary,
      headers,
      data,
      filename: `billings-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    });
  };

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
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-4xl font-bold text-navy-dark mb-2">
              Monthly Billings
            </h1>
            <p className="text-gray-600">
              Track monthly rent payments for all tenants
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
              title="Download PDF"
            >
              <FileText className="w-5 h-5" />
              PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
              title="Download Excel"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Excel
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Payment Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Active Filters Message Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getFilterSummary().map((filter, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {filter}
              </span>
            ))}
          </div>
          <p className="text-blue-600 text-sm mt-2">
            {loading ? "Loading..." : showBreakdown ? `Showing breakdown for ${breakdownData?.units.length || 0} unit(s)` : `${billings.length} record(s) found`}
          </p>
        </motion.div>

        {/* Billings Table or Breakdown View */}
        {showBreakdown && breakdownData ? (
          // Monthly Breakdown View for All Months
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-neon-blue to-sky-blue p-6 rounded-xl text-white">
              <h2 className="text-2xl font-bold mb-2">Monthly Breakdown - All Units</h2>
              <p className="text-white/80">
                {breakdownData.tenantName} ({breakdownData.tenantEmail})
              </p>
            </div>

            {breakdownData.units.map((unit, unitIndex) => (
              <motion.div
                key={unitIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + unitIndex * 0.1 }}
                className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-lg"
              >
                <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-navy-dark">
                        Unit {unit.unitNumber} - {unit.propertyName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Monthly Rent: KSh {unit.monthlyRent.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Paid</p>
                      <p className="text-2xl font-bold text-neon-blue">
                        KSh {unit.totalPaid.toLocaleString()}
                      </p>
                    </div>
                  </div>
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
                      {unit.monthlyBreakdown.map((month, monthIndex) => (
                        <tr key={monthIndex} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-navy-dark font-medium">
                            {month.month}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            KSh {month.monthlyRent.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-navy-dark font-semibold">
                            KSh {month.amountPaid.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(month.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Regular Billings Table
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
        )}
      </div>
    </div>
  );
}