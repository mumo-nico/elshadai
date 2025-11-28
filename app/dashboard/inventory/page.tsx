"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Calendar,
  ShoppingCart,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { generatePDFReport } from "@/lib/pdf-report-generator";
import { generateExcelReport } from "@/lib/excel-generator";

interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  date: string;
  quantityIn: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  yearlyValue: number;
  monthlyValue: number;
}

export default function InventoryPage() {
  const { data: session } = useSession();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filter state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    quantityIn: "",
    unit: "",
    unitCost: "",
    supplier: "",
  });

  const categories = [
    "Building Materials",
    "Tools",
    "Plumbing",
    "Electrical",
    "Paint & Finishes",
    "Hardware",
    "Cleaning Supplies",
    "Other",
  ];

  const units = ["kg", "bags", "pieces", "liters", "meters", "boxes", "rolls", "units"];

  // Initialize date filters to current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setDateFrom(firstDay.toISOString().split("T")[0]);
    setDateTo(lastDay.toISOString().split("T")[0]);
  }, []);

  // Initialize flatpickr for date filters
  useEffect(() => {
    const fromElement = document.getElementById("inventoryDateFrom");
    const toElement = document.getElementById("inventoryDateTo");

    if (!fromElement || !toElement) return;

    const fromPicker = flatpickr(fromElement, {
      dateFormat: "Y-m-d",
      defaultDate: dateFrom,
      onChange: (selectedDates, dateStr) => {
        setDateFrom(dateStr);
      },
    });

    const toPicker = flatpickr(toElement, {
      dateFormat: "Y-m-d",
      defaultDate: dateTo,
      onChange: (selectedDates, dateStr) => {
        setDateTo(dateStr);
      },
    });

    return () => {
      fromPicker.destroy();
      toPicker.destroy();
    };
  }, []);

  // Initialize flatpickr for modal date input
  useEffect(() => {
    if (isModalOpen) {
      const modalDateElement = document.getElementById("modalDate");
      if (!modalDateElement) return;

      const modalDatePicker = flatpickr(modalDateElement, {
        dateFormat: "Y-m-d",
        defaultDate: formData.date,
        onChange: (selectedDates, dateStr) => {
          setFormData({ ...formData, date: dateStr });
        },
      });

      return () => {
        modalDatePicker.destroy();
      };
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (session?.user.role === "LANDLORD") {
      fetchInventory();
      fetchStats();
    }
  }, [session]);

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/inventory/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setFormData({
      itemName: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      quantityIn: "",
      unit: "",
      unitCost: "",
      supplier: "",
    });
    setIsModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setIsEditMode(true);
    setSelectedItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      date: new Date(item.date).toISOString().split("T")[0],
      quantityIn: item.quantityIn.toString(),
      unit: item.unit,
      unitCost: item.unitCost.toString(),
      supplier: item.supplier || "",
    });
    setIsModalOpen(true);
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/inventory?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchInventory();
        fetchStats();
        alert("Item deleted successfully");
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = isEditMode ? "/api/inventory" : "/api/inventory";
      const method = isEditMode ? "PUT" : "POST";
      const body = isEditMode
        ? { ...formData, id: selectedItem?.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchInventory();
        fetchStats();
        setIsModalOpen(false);
        alert(isEditMode ? "Item updated successfully" : "Item added successfully");
      } else {
        alert("Failed to save item");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item");
    }
  };

  // Filter inventory by date range
  const filteredInventory = inventory.filter((item) => {
    if (!dateFrom || !dateTo) return true;
    const itemDate = new Date(item.date);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    return itemDate >= fromDate && itemDate <= toDate;
  });

  // Download PDF function
  const handleDownloadPDF = () => {
    if (filteredInventory.length === 0) {
      alert("No inventory items to download for the selected date range.");
      return;
    }

    const headers = ["Item Name", "Category", "Date", "Quantity", "Unit Cost", "Total Cost", "Supplier"];
    const data = filteredInventory.map((item) => [
      item.itemName,
      item.category,
      new Date(item.date).toLocaleDateString(),
      `${item.quantityIn} ${item.unit}`,
      `KSh ${item.unitCost.toLocaleString()}`,
      `KSh ${item.totalCost.toLocaleString()}`,
      item.supplier || "N/A",
    ]);

    const dateRange = dateFrom && dateTo
      ? `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`
      : "All Time";

    generatePDFReport({
      title: "Store Inventory Report",
      dateRange,
      headers,
      data,
      filename: `inventory-report-${dateFrom}-to-${dateTo}.pdf`,
    });
  };

  // Download Excel function
  const handleDownloadExcel = () => {
    if (filteredInventory.length === 0) {
      alert("No inventory items to download for the selected date range.");
      return;
    }

    const headers = ["Item Name", "Category", "Date", "Quantity", "Unit Cost", "Total Cost", "Supplier"];
    const data = filteredInventory.map((item) => [
      item.itemName,
      item.category,
      new Date(item.date).toLocaleDateString(),
      `${item.quantityIn} ${item.unit}`,
      `KSh ${item.unitCost.toLocaleString()}`,
      `KSh ${item.totalCost.toLocaleString()}`,
      item.supplier || "N/A",
    ]);

    const dateRange = dateFrom && dateTo
      ? `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`
      : "All Time";

    generateExcelReport({
      title: "Store Inventory Report",
      dateRange,
      headers,
      data,
      filename: `inventory-report-${dateFrom}-to-${dateTo}.xlsx`,
    });
  };

  if (session?.user.role !== "LANDLORD") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Access denied. Landlords only.</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Items",
      value: stats?.totalItems || 0,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Total Value",
      value: `KSh ${(stats?.totalValue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Yearly Value",
      value: `KSh ${(stats?.yearlyValue || 0).toLocaleString()}`,
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      title: "Monthly Value",
      value: `KSh ${(stats?.monthlyValue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark">Store Inventory</h1>
          <p className="text-gray-600 mt-2">Manage your store keeping inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
            title="Download PDF"
          >
            <FileText className="w-5 h-5" />
            PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg"
            title="Download Excel"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Excel
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Inventory
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-navy-dark">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy-dark">Inventory Items</h2>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date From
              </label>
              <input
                id="inventoryDateFrom"
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
                id="inventoryDateTo"
                type="text"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                placeholder="Select end date"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                  setDateFrom(firstDay.toISOString().split("T")[0]);
                  setDateTo(lastDay.toISOString().split("T")[0]);

                  // Update flatpickr instances
                  const fromElement = document.getElementById("inventoryDateFrom") as any;
                  const toElement = document.getElementById("inventoryDateTo") as any;
                  if (fromElement?._flatpickr) fromElement._flatpickr.setDate(firstDay);
                  if (toElement?._flatpickr) toElement._flatpickr.setDate(lastDay);
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Item Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Unit Cost</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Total Cost</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Supplier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No inventory items found for the selected date range.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-navy-dark font-medium">{item.itemName}</td>
                    <td className="px-6 py-4 text-gray-600">{item.category}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.quantityIn} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      KSh {item.unitCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-navy-dark font-semibold">
                      KSh {item.totalCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.supplier || "N/A"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewItem(item)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b-2 border-gray-100">
              <h2 className="text-2xl font-bold text-navy-dark">
                {isEditMode ? "Edit Inventory Item" : "Add Inventory Item"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                    placeholder="e.g., Cement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    id="modalDate"
                    type="text"
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                    placeholder="Select date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantityIn}
                    onChange={(e) => setFormData({ ...formData, quantityIn: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                    placeholder="e.g., 50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Cost (KSh) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                    placeholder="e.g., 800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-neon-blue focus:outline-none"
                    placeholder="e.g., ABC Hardware"
                  />
                </div>

                {formData.quantityIn && formData.unitCost && (
                  <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Cost:</p>
                    <p className="text-2xl font-bold text-navy-dark">
                      KSh {(parseFloat(formData.quantityIn) * parseFloat(formData.unitCost)).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium"
                >
                  {isEditMode ? "Update Item" : "Add Item"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
          >
            <div className="p-6 border-b-2 border-gray-100">
              <h2 className="text-2xl font-bold text-navy-dark">Inventory Item Details</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Item Name</p>
                  <p className="text-lg font-semibold text-navy-dark">{selectedItem.itemName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="text-lg font-semibold text-navy-dark">{selectedItem.category}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Date Purchased</p>
                  <p className="text-lg font-semibold text-navy-dark">
                    {new Date(selectedItem.date).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Quantity</p>
                  <p className="text-lg font-semibold text-navy-dark">
                    {selectedItem.quantityIn} {selectedItem.unit}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Unit Cost</p>
                  <p className="text-lg font-semibold text-navy-dark">
                    KSh {selectedItem.unitCost.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                  <p className="text-lg font-semibold text-green-600">
                    KSh {selectedItem.totalCost.toLocaleString()}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Supplier</p>
                  <p className="text-lg font-semibold text-navy-dark">
                    {selectedItem.supplier || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Created At</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedItem.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditItem(selectedItem);
                  }}
                  className="flex-1 px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium"
                >
                  Edit Item
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

