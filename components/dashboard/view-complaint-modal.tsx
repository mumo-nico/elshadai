"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Calendar, User, Phone, MapPin, Clock } from "lucide-react";

interface ViewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: any;
}

const STATUS_COLORS: any = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
  RESOLVED: "bg-green-100 text-green-800 border-green-200",
  CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
};

const PRIORITY_COLORS: any = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  URGENT: "bg-red-100 text-red-800 border-red-200",
};

export default function ViewComplaintModal({
  isOpen,
  onClose,
  complaint,
}: ViewComplaintModalProps) {
  if (!complaint) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-navy-dark">Complaint Details</h2>
                    <p className="text-sm text-gray-500">#{complaint.id.slice(0, 8)}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status and Priority */}
                <div className="flex gap-3">
                  <span
                    className={`px-4 py-2 rounded-xl border-2 font-semibold ${
                      STATUS_COLORS[complaint.status]
                    }`}
                  >
                    {complaint.status.replace("_", " ")}
                  </span>
                  <span
                    className={`px-4 py-2 rounded-xl border-2 font-semibold ${
                      PRIORITY_COLORS[complaint.priority]
                    }`}
                  >
                    {complaint.priority} Priority
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Title</h3>
                  <p className="text-lg font-bold text-navy-dark">{complaint.title}</p>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-semibold">Property & Unit</span>
                    </div>
                    <p className="text-navy-dark font-medium">
                      {complaint.unit.property.name} - Unit {complaint.unit.unitNumber}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Category</span>
                    </div>
                    <p className="text-navy-dark font-medium">
                      {complaint.category.replace("_", " ")}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-semibold">Submitted By</span>
                    </div>
                    <p className="text-navy-dark font-medium">{complaint.user.name}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">Submitted On</span>
                    </div>
                    <p className="text-navy-dark font-medium text-sm">
                      {formatDate(complaint.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Assigned Technician */}
                {complaint.assignedToName && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">
                      Assigned Technician
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-navy-dark font-medium">
                          {complaint.assignedToName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-navy-dark font-medium">
                          {complaint.assignedToPhone}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-navy-dark">Complaint Submitted</p>
                        <p className="text-xs text-gray-500">{formatDate(complaint.createdAt)}</p>
                      </div>
                    </div>

                    {complaint.status !== "PENDING" && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-navy-dark">In Progress</p>
                          <p className="text-xs text-gray-500">{formatDate(complaint.updatedAt)}</p>
                        </div>
                      </div>
                    )}

                    {complaint.resolvedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-navy-dark">Resolved</p>
                          <p className="text-xs text-gray-500">{formatDate(complaint.resolvedAt)}</p>
                        </div>
                      </div>
                    )}

                    {complaint.closedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-navy-dark">Closed</p>
                          <p className="text-xs text-gray-500">{formatDate(complaint.closedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-100 p-6">
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-navy-dark text-white rounded-xl hover:bg-navy-dark/90 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

