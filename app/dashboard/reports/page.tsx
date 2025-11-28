"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  CreditCard,
  AlertCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
} from "lucide-react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { generateExcelReport } from "@/lib/excel-generator";
import { generatePDFReport } from "@/lib/pdf-report-generator";

type ReportType = "units" | "tenants" | "payments" | "complaints" | null;

export default function ReportsPage() {
  const { data: session } = useSession();
  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Tenant-specific state (always declared, but only used for tenants)
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [tenantReportType, setTenantReportType] = useState<"payments" | "complaints">("payments");

  // Initialize date range to current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setDateFrom(firstDay.toISOString().split("T")[0]);
    setDateTo(lastDay.toISOString().split("T")[0]);
  }, []);

  // Initialize flatpickr when a report is selected
  useEffect(() => {
    // Only initialize if a report is selected (inputs are rendered)
    if (!selectedReport) return;

    // Wait for initial dates to be set
    if (!dateFrom || !dateTo) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const fromElement = document.getElementById("dateFrom") as HTMLInputElement;
      const toElement = document.getElementById("dateTo") as HTMLInputElement;

      if (!fromElement || !toElement) return;

      const fromPicker = flatpickr(fromElement, {
        dateFormat: "Y-m-d",
        defaultDate: dateFrom,
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            setDateFrom(selectedDates[0].toISOString().split("T")[0]);
          }
        },
      });

      const toPicker = flatpickr(toElement, {
        dateFormat: "Y-m-d",
        defaultDate: dateTo,
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            setDateTo(selectedDates[0].toISOString().split("T")[0]);
          }
        },
      });

      return () => {
        if (fromPicker && typeof fromPicker.destroy === "function") {
          fromPicker.destroy();
        }
        if (toPicker && typeof toPicker.destroy === "function") {
          toPicker.destroy();
        }
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedReport]); // Re-initialize when report changes

  const fetchReportData = async (type: ReportType) => {
    if (!type) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/reports/${type}?${params.toString()}`);
      const data = await response.json();

      // Validate response
      if (data.error) {
        alert(`Error: ${data.error}`);
        setReportData([]);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Invalid data format:", data);
        alert("Invalid data format received");
        setReportData([]);
        return;
      }

      setReportData(data);
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Failed to fetch report data");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit filters when they change
  useEffect(() => {
    if (selectedReport && dateFrom && dateTo) {
      fetchReportData(selectedReport);
    }
  }, [dateFrom, dateTo, statusFilter]);

  const handleCardClick = (type: ReportType) => {
    setSelectedReport(type);
    setStatusFilter(""); // Clear status filter when switching report types
    fetchReportData(type);
  };

  const handleRefresh = () => {
    fetchReportData(selectedReport);
  };

  // Tenant-specific reports
  if (session?.user.role === "TENANT") {

    // Initialize flatpickr for tenant complaints date filters
    useEffect(() => {
      if (tenantReportType === "complaints") {
        const fromElement = document.getElementById("tenantDateFrom");
        const toElement = document.getElementById("tenantDateTo");

        if (!fromElement || !toElement) return;

        const fromPicker = flatpickr(fromElement, {
          dateFormat: "Y-m-d",
          defaultDate: dateFrom,
          onChange: (selectedDates) => {
            if (selectedDates[0]) {
              setDateFrom(selectedDates[0].toISOString().split("T")[0]);
            }
          },
        });

        const toPicker = flatpickr(toElement, {
          dateFormat: "Y-m-d",
          defaultDate: dateTo,
          onChange: (selectedDates) => {
            if (selectedDates[0]) {
              setDateTo(selectedDates[0].toISOString().split("T")[0]);
            }
          },
        });

        return () => {
          if (fromPicker && typeof fromPicker.destroy === "function") {
            fromPicker.destroy();
          }
          if (toPicker && typeof toPicker.destroy === "function") {
            toPicker.destroy();
          }
        };
      }
    }, [tenantReportType]);

    const fetchTenantReport = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (tenantReportType === "payments") {
          params.append("year", yearFilter);
        } else {
          if (dateFrom) params.append("dateFrom", dateFrom);
          if (dateTo) params.append("dateTo", dateTo);
          if (statusFilter) params.append("status", statusFilter);
        }

        const response = await fetch(`/api/reports/${tenantReportType}?${params.toString()}`);
        const data = await response.json();

        // Validate response
        if (data.error) {
          alert(`Error: ${data.error}`);
          setReportData([]);
          return;
        }

        if (!Array.isArray(data)) {
          console.error("Invalid data format:", data);
          alert("Invalid data format received");
          setReportData([]);
          return;
        }

        setReportData(data);
      } catch (error) {
        console.error("Error fetching report:", error);
        alert("Failed to fetch report data");
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };

    const downloadTenantExcel = () => {
      if (!Array.isArray(reportData) || reportData.length === 0) {
        alert("No data to download");
        return;
      }

      if (tenantReportType === "payments") {
        const title = `My Payments Report - ${yearFilter}`;
        const headers = ["Payment ID", "Date", "Property", "Unit", "Amount", "Method", "Month/Year", "Status"];
        const data = reportData.map((item: any) => [
          item.paymentId || item.receiptNumber || "N/A",
          new Date(item.createdAt).toLocaleDateString(),
          item.property,
          item.unitNumber,
          `KSh ${(item.amount || 0).toLocaleString()}`,
          item.paymentMethod,
          `${item.month}/${item.year}`,
          item.status,
        ]);
        generateExcelReport({
          title,
          dateRange: `Year ${yearFilter}`,
          headers,
          data,
          filename: `my_payments_${yearFilter}.xlsx`,
        });
      } else {
        const title = "My Complaints Report";
        const headers = ["Report ID", "Date", "Property", "Unit", "Category", "Title", "Priority", "Status", "Assigned To"];
        const data = reportData.map((item: any) => [
          item.complaintId || "N/A",
          new Date(item.createdAt).toLocaleDateString(),
          item.property,
          item.unitNumber,
          item.category,
          item.title,
          item.priority,
          item.status,
          item.assignedToName || "N/A",
        ]);
        generateExcelReport({
          title,
          dateRange: `${dateFrom} to ${dateTo}`,
          headers,
          data,
          filename: `my_complaints_${Date.now()}.xlsx`,
        });
      }
    };

    const downloadTenantPDF = () => {
      if (!Array.isArray(reportData) || reportData.length === 0) {
        alert("No data to download");
        return;
      }

      if (tenantReportType === "payments") {
        const title = `My Payments Report - ${yearFilter}`;
        const headers = ["Payment ID", "Date", "Property", "Unit", "Amount", "Method", "Month/Year", "Status"];
        const data = reportData.map((item: any) => [
          item.paymentId || item.receiptNumber || "N/A",
          new Date(item.createdAt).toLocaleDateString(),
          item.property,
          item.unitNumber,
          `KSh ${(item.amount || 0).toLocaleString()}`,
          item.paymentMethod,
          `${item.month}/${item.year}`,
          item.status,
        ]);
        generatePDFReport({
          title,
          dateRange: `Year ${yearFilter}`,
          headers,
          data,
          filename: `my_payments_${yearFilter}.pdf`,
        });
      } else {
        const title = "My Complaints Report";
        const headers = ["Report ID", "Date", "Property", "Unit", "Category", "Title", "Priority", "Status", "Assigned To"];
        const data = reportData.map((item: any) => [
          item.complaintId || "N/A",
          new Date(item.createdAt).toLocaleDateString(),
          item.property,
          item.unitNumber,
          item.category,
          item.title,
          item.priority,
          item.status,
          item.assignedToName || "N/A",
        ]);
        generatePDFReport({
          title,
          dateRange: `${dateFrom} to ${dateTo}`,
          headers,
          data,
          filename: `my_complaints_${Date.now()}.pdf`,
        });
      }
    };

    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-navy-dark mb-2">My Reports</h1>
          <p className="text-gray-600">Download your payment and complaint history</p>
        </motion.div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ReportCard
            icon={CreditCard}
            title="My Payments"
            description="Download payment history by year"
            color="purple"
            onClick={() => setTenantReportType("payments")}
            isSelected={tenantReportType === "payments"}
          />
          <ReportCard
            icon={AlertCircle}
            title="My Complaints"
            description="Download complaint history"
            color="orange"
            onClick={() => setTenantReportType("complaints")}
            isSelected={tenantReportType === "complaints"}
          />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 mb-6"
        >
          <div className="flex flex-wrap items-end gap-4">
            {tenantReportType === "payments" ? (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date From
                  </label>
                  <input
                    id="tenantDateFrom"
                    type="text"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                    placeholder="Select start date"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date To
                  </label>
                  <input
                    id="tenantDateTo"
                    type="text"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                    placeholder="Select end date"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={fetchTenantReport}
                className="px-6 py-2 bg-neon-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Generate Report
              </button>
            </div>
          </div>

          {/* Download Buttons */}
          {reportData.length > 0 && (
            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={downloadTenantExcel}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Download Excel
              </button>
              <button
                onClick={downloadTenantPDF}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <FileText className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          )}
        </motion.div>

        {/* Report Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading report data...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No data found. Click "Generate Report" to view your {tenantReportType}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-100">
                  <tr>
                    {tenantReportType === "payments" ? (
                      <>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Payment ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Property</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Unit</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Method</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Month/Year</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Report ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Property</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Unit</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Category</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Priority</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Assigned To</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenantReportType === "payments" ? (
                    reportData.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-navy-dark">{item.paymentId || item.receiptNumber || "N/A"}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.property}</td>
                        <td className="px-6 py-4 text-gray-600">{item.unitNumber}</td>
                        <td className="px-6 py-4 text-navy-dark font-semibold">
                          KSh {(item.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.paymentMethod}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.month}/{item.year}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            item.status === "APPROVED" ? "bg-green-100 text-green-700" :
                            item.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    reportData.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-navy-dark">{item.complaintId || "N/A"}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.property}</td>
                        <td className="px-6 py-4 text-gray-600">{item.unitNumber}</td>
                        <td className="px-6 py-4 text-gray-600">{item.category}</td>
                        <td className="px-6 py-4 text-gray-600">{item.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            item.priority === "URGENT" ? "bg-red-100 text-red-700" :
                            item.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                            item.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            item.status === "CLOSED" ? "bg-gray-100 text-gray-700" :
                            item.status === "RESOLVED" ? "bg-green-100 text-green-700" :
                            item.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.assignedToName || "N/A"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Landlord reports
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-navy-dark mb-2">Reports</h1>
        <p className="text-gray-600">
          Generate and download comprehensive reports
        </p>
      </motion.div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ReportCard
          icon={Building2}
          title="Units Report"
          description="Units with tenants and rent due"
          color="blue"
          onClick={() => handleCardClick("units")}
          isSelected={selectedReport === "units"}
        />
        <ReportCard
          icon={Users}
          title="Tenants Report"
          description="Tenants with units and rent paid/due"
          color="green"
          onClick={() => handleCardClick("tenants")}
          isSelected={selectedReport === "tenants"}
        />
        <ReportCard
          icon={CreditCard}
          title="Payments Report"
          description="All payments and their status"
          color="purple"
          onClick={() => handleCardClick("payments")}
          isSelected={selectedReport === "payments"}
        />
        <ReportCard
          icon={AlertCircle}
          title="Complaints Report"
          description="All complaints and resolutions"
          color="orange"
          onClick={() => handleCardClick("complaints")}
          isSelected={selectedReport === "complaints"}
        />
      </div>

      {/* Filters and Actions */}
      {selectedReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 mb-6"
        >
          <div className="flex flex-wrap items-end gap-4">
            {/* Date Range Filters */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date From
              </label>
              <input
                id="dateFrom"
                type="text"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                placeholder="Select start date"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date To
              </label>
              <input
                id="dateTo"
                type="text"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                placeholder="Select end date"
              />
            </div>

            {/* Status Filter for Payments and Complaints */}
            {(selectedReport === "payments" || selectedReport === "complaints") && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                >
                  <option value="">All Status</option>
                  {selectedReport === "payments" ? (
                    <>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="DENIED">Denied</option>
                    </>
                  ) : (
                    <>
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                  setDateFrom(firstDay.toISOString().split("T")[0]);
                  setDateTo(lastDay.toISOString().split("T")[0]);
                  setStatusFilter("");

                  // Update flatpickr instances
                  const fromElement = document.getElementById("dateFrom") as any;
                  const toElement = document.getElementById("dateTo") as any;
                  if (fromElement?._flatpickr) fromElement._flatpickr.setDate(firstDay);
                  if (toElement?._flatpickr) toElement._flatpickr.setDate(lastDay);
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Download Buttons */}
          {reportData.length > 0 && (
            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => downloadExcel()}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Download Excel
              </button>
              <button
                onClick={() => downloadPDF()}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <FileText className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Report Table */}
      {selectedReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading report data...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No data found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              {renderReportTable()}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );

  // Helper functions for downloading
  function downloadExcel() {
    if (!Array.isArray(reportData) || reportData.length === 0) {
      alert("No data to download");
      return;
    }

    const { title, headers, data } = getReportConfig();
    const dateRange = `${dateFrom} to ${dateTo}`;
    generateExcelReport({
      title,
      dateRange,
      headers,
      data,
      filename: `${selectedReport}_report_${Date.now()}.xlsx`,
    });
  }

  function downloadPDF() {
    if (!Array.isArray(reportData) || reportData.length === 0) {
      alert("No data to download");
      return;
    }

    const { title, headers, data } = getReportConfig();
    const dateRange = `${dateFrom} to ${dateTo}`;
    generatePDFReport({
      title,
      dateRange,
      headers,
      data,
      filename: `${selectedReport}_report_${Date.now()}.pdf`,
    });
  }

  function getReportConfig() {
    // Add safety check
    if (!Array.isArray(reportData)) {
      return { title: "", headers: [], data: [] };
    }

    switch (selectedReport) {
      case "units":
        return {
          title: "Units Report",
          headers: ["Unit #", "Type", "Property", "Location", "Monthly Rent", "Status", "Tenant", "Rent Paid", "Rent Due"],
          data: reportData.map((item) => [
            item.unitNumber,
            item.unitType,
            item.property,
            item.location,
            `KSh ${(item.monthlyRent || 0).toLocaleString()}`,
            item.status,
            item.tenant?.name || "N/A",
            `KSh ${(item.rentPaid || 0).toLocaleString()}`,
            `KSh ${(item.rentDue || 0).toLocaleString()}`,
          ]),
        };
      case "tenants":
        return {
          title: "Tenants Report",
          headers: ["Tenant ID", "Name", "Email", "Phone", "Unit", "Property", "Monthly Rent", "Move-In Date", "Total Due", "Total Paid", "Balance"],
          data: reportData.map((item) => [
            item.tenantId || "N/A",
            item.name,
            item.email,
            item.phone || "N/A",
            `${item.unit.unitNumber} (${item.unit.unitType})`,
            item.unit.property,
            `KSh ${(item.unit.monthlyRent || 0).toLocaleString()}`,
            new Date(item.moveInDate).toLocaleDateString(),
            `KSh ${(item.totalRentDue || 0).toLocaleString()}`,
            `KSh ${(item.totalPaid || 0).toLocaleString()}`,
            `KSh ${(item.rentDue || 0).toLocaleString()}`,
          ]),
        };
      case "payments":
        return {
          title: "Payments Report",
          headers: ["Payment ID", "Date", "Tenant", "Property", "Unit", "Amount", "Method", "Month/Year", "Status"],
          data: reportData.map((item) => [
            item.paymentId || item.receiptNumber || "N/A",
            new Date(item.createdAt).toLocaleDateString(),
            item.tenant,
            item.property,
            item.unitNumber,
            `KSh ${(item.amount || 0).toLocaleString()}`,
            item.paymentMethod,
            `${item.month}/${item.year}`,
            item.status,
          ]),
        };
      case "complaints":
        return {
          title: "Complaints Report",
          headers: ["Report ID", "Date", "Tenant", "Property", "Unit", "Category", "Title", "Priority", "Status", "Assigned To"],
          data: reportData.map((item) => [
            item.complaintId || "N/A",
            new Date(item.createdAt).toLocaleDateString(),
            item.tenant,
            item.property,
            item.unitNumber,
            item.category,
            item.title,
            item.priority,
            item.status,
            item.assignedToName || "N/A",
          ]),
        };
      default:
        return { title: "", headers: [], data: [] };
    }
  }

  function renderReportTable() {
    const { headers } = getReportConfig();

    return (
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-sm font-semibold text-navy-dark"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {selectedReport === "units" &&
            reportData.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-navy-dark">{item.unitNumber}</td>
                <td className="px-6 py-4 text-gray-600">{item.unitType}</td>
                <td className="px-6 py-4 text-gray-600">{item.property}</td>
                <td className="px-6 py-4 text-gray-600">{item.location}</td>
                <td className="px-6 py-4 text-navy-dark font-semibold">
                  KSh {(item.monthlyRent || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    item.status === "OCCUPIED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.tenant?.name || "N/A"}</td>
                <td className="px-6 py-4 text-green-600 font-semibold">
                  KSh {(item.rentPaid || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-red-600 font-semibold">
                  KSh {(item.rentDue || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          {selectedReport === "tenants" &&
            reportData.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-navy-dark font-medium">{item.tenantId || "N/A"}</td>
                <td className="px-6 py-4 text-navy-dark font-medium">{item.name}</td>
                <td className="px-6 py-4 text-gray-600">{item.email}</td>
                <td className="px-6 py-4 text-gray-600">{item.phone || "N/A"}</td>
                <td className="px-6 py-4 text-gray-600">
                  {item.unit.unitNumber} ({item.unit.unitType})
                </td>
                <td className="px-6 py-4 text-gray-600">{item.unit.property}</td>
                <td className="px-6 py-4 text-navy-dark font-semibold">
                  KSh {(item.unit.monthlyRent || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(item.moveInDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  KSh {(item.totalRentDue || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-green-600 font-semibold">
                  KSh {(item.totalPaid || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-red-600 font-semibold">
                  KSh {(item.rentDue || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          {selectedReport === "payments" &&
            reportData.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-navy-dark">{item.paymentId || item.receiptNumber || "N/A"}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-600">{item.tenant}</td>
                <td className="px-6 py-4 text-gray-600">{item.property}</td>
                <td className="px-6 py-4 text-gray-600">{item.unitNumber}</td>
                <td className="px-6 py-4 text-navy-dark font-semibold">
                  KSh {(item.amount || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-gray-600">{item.paymentMethod}</td>
                <td className="px-6 py-4 text-gray-600">
                  {item.month}/{item.year}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    item.status === "APPROVED" ? "bg-green-100 text-green-700" :
                    item.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          {selectedReport === "complaints" &&
            reportData.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-navy-dark">{item.complaintId || "N/A"}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-navy-dark">{item.tenant}</td>
                <td className="px-6 py-4 text-gray-600">{item.property}</td>
                <td className="px-6 py-4 text-gray-600">{item.unitNumber}</td>
                <td className="px-6 py-4 text-gray-600">{item.category}</td>
                <td className="px-6 py-4 text-gray-600">{item.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    item.priority === "URGENT" ? "bg-red-100 text-red-700" :
                    item.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                    item.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    item.status === "CLOSED" ? "bg-gray-100 text-gray-700" :
                    item.status === "RESOLVED" ? "bg-green-100 text-green-700" :
                    item.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.assignedToName || "N/A"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  }
}

// Report Card Component
interface ReportCardProps {
  icon: any;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
  isSelected: boolean;
}

function ReportCard({
  icon: Icon,
  title,
  description,
  color,
  onClick,
  isSelected,
}: ReportCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-6 transition-all ${
        isSelected
          ? "ring-4 ring-neon-blue shadow-xl"
          : "shadow-sm hover:shadow-lg"
      } bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/90 text-sm">{description}</p>
    </motion.div>
  );
}


