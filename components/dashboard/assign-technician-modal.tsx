"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, User, Phone } from "lucide-react";

interface AssignTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: any;
  onSuccess: () => void;
}

export default function AssignTechnicianModal({
  isOpen,
  onClose,
  complaint,
  onSuccess,
}: AssignTechnicianModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    assignedToName: "",
    assignedToPhone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/complaints/${complaint.id}/assign`, {
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
          assignedToName: "",
          assignedToPhone: "",
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to assign technician");
      }
    } catch (error) {
      console.error("Error assigning technician:", error);
      alert("Failed to assign technician");
    } finally {
      setLoading(false);
    }
  };

  if (!complaint) return null;

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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            >
              {/* Header */}
              <div className="bg-white border-b-2 border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-dark">Assign Technician</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Complaint Info */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Complaint</h3>
                  <p className="text-navy-dark font-medium">{complaint.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {complaint.unit.property.name} - Unit {complaint.unit.unitNumber}
                  </p>
                </div>

                {/* Technician Name */}
                <div>
                  <label className="block text-sm font-semibold text-navy-dark mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Technician Name <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.assignedToName}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedToName: e.target.value })
                    }
                    placeholder="Enter technician's full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Technician Phone */}
                <div>
                  <label className="block text-sm font-semibold text-navy-dark mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.assignedToPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedToPhone: e.target.value })
                    }
                    placeholder="e.g., +254 712 345 678"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> The tenant will be notified with the technician's details
                    and the complaint status will change to "In Progress".
                  </p>
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
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? "Assigning..." : "Assign Technician"}
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

