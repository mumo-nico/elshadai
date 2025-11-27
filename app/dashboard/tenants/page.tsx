"use client";

import { useState, useEffect } from "react";
import { Plus, Eye, Pencil, Trash2, UserPlus, X } from "lucide-react";
import AssignUnitModal from "@/components/dashboard/assign-unit-modal";

interface Unit {
  id: string;
  unitNumber: string;
  property: {
    name: string;
  };
}

interface TenantAssignment {
  id: string;
  unitId: string;
  leaseStartDate: string;
  leaseEndDate: string | null;
  monthlyRent: number;
  depositPaid: number | null;
  rentDue: number;
  status: string;
  unit: Unit;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  tenants: TenantAssignment[];
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingRentDue, setEditingRentDue] = useState<{ tenantAssignmentId: string; value: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/tenants");
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setFormData({ name: "", email: "", phone: "", password: "" });
        fetchTenants();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create tenant");
      }
    } catch (error) {
      console.error("Error creating tenant:", error);
      alert("Failed to create tenant");
    }
  };

  const handleView = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsViewModalOpen(true);
  };

  const handleAssignUnit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsAssignModalOpen(true);
  };

  const handleRentDueEdit = (tenantAssignmentId: string, currentValue: number) => {
    setEditingRentDue({ tenantAssignmentId, value: currentValue.toString() });
  };

  const handleRentDueSave = async (tenantAssignmentId: string) => {
    if (!editingRentDue) return;

    try {
      const response = await fetch(`/api/tenants/${tenantAssignmentId}/rent-due`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentDue: parseFloat(editingRentDue.value) }),
      });

      if (response.ok) {
        setEditingRentDue(null);
        fetchTenants();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update rent due");
      }
    } catch (error) {
      console.error("Error updating rent due:", error);
      alert("Failed to update rent due");
    }
  };

  const handleRentDueCancel = () => {
    setEditingRentDue(null);
  };

  const getTotalRentDue = (tenant: Tenant) => {
    return tenant.tenants.reduce((sum, assignment) => sum + (assignment.rentDue || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading tenants...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark">Tenants</h1>
          <p className="text-gray-600 mt-2">Manage tenant accounts and unit assignments</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Tenant
        </button>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Units</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Rent Due</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No tenants found. Create your first tenant to get started.
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-navy-dark font-medium">{tenant.name}</td>
                  <td className="px-6 py-4 text-gray-600">{tenant.email}</td>
                  <td className="px-6 py-4 text-gray-600">{tenant.phone || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-neon-blue/10 text-neon-blue rounded-lg text-sm font-medium">
                      {tenant.tenants.length} {tenant.tenants.length === 1 ? "unit" : "units"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${getTotalRentDue(tenant) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      KSh {getTotalRentDue(tenant).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(tenant)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleAssignUnit(tenant)}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                        title="Assign Unit"
                      >
                        <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Tenant Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-navy-dark">Add New Tenant</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors"
                  placeholder="0712345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tenant can change this password after first login
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-navy-dark rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium"
                >
                  Create Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Tenant Modal */}
      {isViewModalOpen && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-navy-dark">Tenant Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="text-navy-dark font-medium">{selectedTenant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-navy-dark font-medium">{selectedTenant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-navy-dark font-medium">{selectedTenant.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Units</p>
                  <p className="text-navy-dark font-medium">{selectedTenant.tenants.length}</p>
                </div>
              </div>

              {selectedTenant.tenants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-navy-dark mb-4">Assigned Units</h3>
                  <div className="space-y-3">
                    {selectedTenant.tenants.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-navy-dark">
                              Unit {assignment.unit.unitNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {assignment.unit.property.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              Rent: KSh {assignment.monthlyRent.toLocaleString()}/month
                            </p>
                            {assignment.depositPaid && (
                              <p className="text-sm text-gray-600">
                                Deposit: KSh {assignment.depositPaid.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              assignment.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {assignment.status}
                          </span>
                        </div>

                        {/* Rent Due - Editable */}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Rent Due:</span>
                            {editingRentDue?.tenantAssignmentId === assignment.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={editingRentDue.value}
                                  onChange={(e) => setEditingRentDue({ ...editingRentDue, value: e.target.value })}
                                  className="w-32 px-3 py-1 text-sm border-2 border-neon-blue rounded-lg focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleRentDueSave(assignment.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleRentDueCancel}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${(assignment.rentDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  KSh {(assignment.rentDue || 0).toLocaleString()}
                                </span>
                                <button
                                  onClick={() => handleRentDueEdit(assignment.id, assignment.rentDue || 0)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Edit Rent Due"
                                >
                                  <Pencil className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-full px-6 py-3 bg-gray-100 text-navy-dark rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Unit Modal */}
      <AssignUnitModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        tenant={selectedTenant}
        onSuccess={fetchTenants}
      />
    </div>
  );
}

