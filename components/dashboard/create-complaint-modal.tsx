"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

interface CreateComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COMPLAINT_CATEGORIES = [
  { value: "RENT", label: "Rent Issue" },
  { value: "PLUMBING", label: "Plumbing" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "SINK", label: "Sink" },
  { value: "STRUCTURAL", label: "Structural" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "SECURITY", label: "Security" },
  { value: "APPLIANCES", label: "Appliances" },
  { value: "HEATING_COOLING", label: "Heating/Cooling" },
  { value: "PEST_CONTROL", label: "Pest Control" },
  { value: "NOISE", label: "Noise" },
  { value: "OTHER", label: "Other" },
];

const PRIORITY_LEVELS = [
  { value: "LOW", label: "Low", color: "text-green-600" },
  { value: "MEDIUM", label: "Medium", color: "text-yellow-600" },
  { value: "HIGH", label: "High", color: "text-orange-600" },
  { value: "URGENT", label: "Urgent", color: "text-red-600" },
];

export default function CreateComplaintModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateComplaintModalProps) {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    unitId: "",
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
    }
  }, [isOpen]);

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/tenant/units");
      if (response.ok) {
        const data = await response.json();
        // The API returns { myUnits: [], availableUnits: [] }
        setUnits(data.myUnits || []);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          unitId: "",
          title: "",
          description: "",
          category: "",
          priority: "MEDIUM",
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create complaint");
      }
    } catch (error) {
      console.error("Error creating complaint:", error);
      alert("Failed to create complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-dark">Submit Complaint</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Unit Selection */}
                <div>
                  <label className="block text-sm font-semibold text-navy-dark mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.unitId}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select a unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.property?.name || "Unknown Property"} - Unit {unit.unitNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-navy-dark mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {COMPLAINT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-navy-dark mb-2">
                    Urgency Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {PRIORITY_LEVELS.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: priority.value })}
                        className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                          formData.priority === priority.value
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className={priority.color}>{priority.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-navy-dark mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-navy-dark mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about the complaint..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Complaint"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

