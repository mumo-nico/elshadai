"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Plus,
  Eye,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import CreateComplaintModal from "@/components/dashboard/create-complaint-modal";
import ViewComplaintModal from "@/components/dashboard/view-complaint-modal";
import AssignTechnicianModal from "@/components/dashboard/assign-technician-modal";

const STATUS_COLORS: any = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
  RESOLVED: "bg-green-100 text-green-800 border-green-200",
  CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
};

const PRIORITY_COLORS: any = {
  LOW: "text-green-600",
  MEDIUM: "text-yellow-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600",
};

export default function ComplaintsPage() {
  const { data: session } = useSession();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/complaints");
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewComplaint = (complaint: any) => {
    setSelectedComplaint(complaint);
    setIsViewModalOpen(true);
  };

  const handleAssignTechnician = (complaint: any) => {
    setSelectedComplaint(complaint);
    setIsAssignModalOpen(true);
  };

  const handleResolve = async (complaintId: string) => {
    if (!confirm("Mark this complaint as resolved?")) return;

    try {
      const response = await fetch(`/api/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "RESOLVED" }),
      });

      if (response.ok) {
        fetchComplaints();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleClose = async (complaintId: string) => {
    if (!confirm("Close this complaint? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CLOSED" }),
      });

      if (response.ok) {
        fetchComplaints();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to close complaint");
      }
    } catch (error) {
      console.error("Error closing complaint:", error);
      alert("Failed to close complaint");
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    if (statusFilter === "ALL") return true;
    return complaint.status === statusFilter;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "PENDING").length,
    inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
    resolved: complaints.filter((c) => c.status === "RESOLVED").length,
    closed: complaints.filter((c) => c.status === "CLOSED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark">Complaints</h1>
          <p className="text-gray-600 mt-1">
            {session?.user?.role === "LANDLORD"
              ? "Manage and resolve tenant complaints"
              : "Submit and track your complaints"}
          </p>
        </div>
        {session?.user?.role === "TENANT" && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Submit Complaint
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total</h3>
          <p className="text-2xl font-bold text-navy-dark">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Resolved</h3>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Closed</h3>
          <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
          {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                statusFilter === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden">
        <div className="p-6 border-b-2 border-gray-100">
          <h2 className="text-xl font-bold text-navy-dark">
            {filteredComplaints.length} Complaint{filteredComplaints.length !== 1 ? "s" : ""}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Unit</th>
                {session?.user?.role === "LANDLORD" && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Tenant</th>
                )}
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td
                    colSpan={session?.user?.role === "LANDLORD" ? 8 : 7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No complaints found
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy-dark">{complaint.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {complaint.category.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {complaint.unit.property.name} - {complaint.unit.unitNumber}
                    </td>
                    {session?.user?.role === "LANDLORD" && (
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {complaint.user.name}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${PRIORITY_COLORS[complaint.priority]}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg border-2 text-xs font-semibold ${
                          STATUS_COLORS[complaint.status]
                        }`}
                      >
                        {complaint.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* View Button - Both Roles */}
                        <button
                          onClick={() => handleViewComplaint(complaint)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* Landlord Actions */}
                        {session?.user?.role === "LANDLORD" && (
                          <>
                            {/* Assign Technician - Only for PENDING complaints */}
                            {complaint.status === "PENDING" && (
                              <button
                                onClick={() => handleAssignTechnician(complaint)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Assign Technician"
                              >
                                <UserPlus className="w-5 h-5" />
                              </button>
                            )}

                            {/* Close - Only for RESOLVED complaints */}
                            {complaint.status === "RESOLVED" && (
                              <button
                                onClick={() => handleClose(complaint.id)}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Close Complaint"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                          </>
                        )}

                        {/* Tenant Actions */}
                        {session?.user?.role === "TENANT" && (
                          <>
                            {/* Resolve - Only for IN_PROGRESS complaints */}
                            {complaint.status === "IN_PROGRESS" && (
                              <button
                                onClick={() => handleResolve(complaint.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Mark as Resolved"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                          </>
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

      {/* Modals */}
      {session?.user?.role === "TENANT" && (
        <CreateComplaintModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchComplaints}
        />
      )}

      <ViewComplaintModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedComplaint(null);
        }}
        complaint={selectedComplaint}
      />

      {session?.user?.role === "LANDLORD" && (
        <AssignTechnicianModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedComplaint(null);
          }}
          complaint={selectedComplaint}
          onSuccess={fetchComplaints}
        />
      )}
    </div>
  );
}
