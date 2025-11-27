"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Plus, Eye, Pencil, Trash2, Home, MapPin, UserPlus } from "lucide-react";
import AssignUnitToTenantModal from "@/components/dashboard/assign-unit-to-tenant-modal";

interface Property {
  id: string;
  name: string;
  location: string;
}

interface Unit {
  id: string;
  unitNumber: string;
  unitType: string;
  rent: number;
  deposit: number | null;
  status: string;
  propertyId: string;
  property: Property;
}

type ModalMode = "create" | "edit" | "view" | "delete" | null;

const UNIT_TYPES = [
  { value: "SHOP", label: "Shop" },
  { value: "SINGLE_ROOM", label: "Single Room" },
  { value: "DOUBLE_ROOM", label: "Double Room" },
  { value: "BEDSITTER", label: "Bedsitter" },
  { value: "ONE_BEDROOM", label: "1 Bedroom" },
  { value: "TWO_BEDROOM", label: "2 Bedroom" },
];

const UNIT_STATUS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "RESERVED", label: "Reserved" },
];

export default function UnitsPage() {
  const [units, setUnits] = React.useState<Unit[]>([]);
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalMode, setModalMode] = React.useState<ModalMode>(null);
  const [selectedUnit, setSelectedUnit] = React.useState<Unit | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    unitNumber: "",
    unitType: "",
    rent: "",
    deposit: "",
    propertyId: "",
    status: "AVAILABLE",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch units
  const fetchUnits = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/units");
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch properties
  const fetchProperties = React.useCallback(async () => {
    try {
      const response = await fetch("/api/properties");
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  }, []);

  React.useEffect(() => {
    fetchUnits();
    fetchProperties();
  }, [fetchUnits, fetchProperties]);

  // Open modal
  const openModal = (mode: ModalMode, unit?: Unit) => {
    setModalMode(mode);
    if (unit) {
      setSelectedUnit(unit);
      setFormData({
        unitNumber: unit.unitNumber,
        unitType: unit.unitType,
        rent: unit.rent.toString(),
        deposit: unit.deposit?.toString() || "",
        propertyId: unit.propertyId,
        status: unit.status,
      });
    } else {
      setSelectedUnit(null);
      setFormData({
        unitNumber: "",
        unitType: "",
        rent: "",
        deposit: "",
        propertyId: properties[0]?.id || "",
        status: "AVAILABLE",
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalMode(null);
    setSelectedUnit(null);
    setFormData({
      unitNumber: "",
      unitType: "",
      rent: "",
      deposit: "",
      propertyId: "",
      status: "AVAILABLE",
    });
  };

  // Create unit
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchUnits();
        closeModal();
      }
    } catch (error) {
      console.error("Error creating unit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update unit
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/units/${selectedUnit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchUnits();
        closeModal();
      }
    } catch (error) {
      console.error("Error updating unit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete unit
  const handleDelete = async () => {
    if (!selectedUnit) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/units/${selectedUnit.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchUnits();
        closeModal();
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "OCCUPIED":
        return "bg-blue-100 text-blue-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "RESERVED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatUnitType = (type: string) => {
    return UNIT_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark">Units</h1>
          <p className="text-gray-600 mt-1">Manage rental units across properties</p>
        </div>
        <Button onClick={() => openModal("create")} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Unit
        </Button>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rent (KSh)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading units...
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No units found. Create your first unit to get started.
                  </td>
                </tr>
              ) : (
                units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neon-blue/10 rounded-lg flex items-center justify-center">
                          <Home className="w-5 h-5 text-neon-blue" />
                        </div>
                        <div className="font-medium text-navy-dark">{unit.unitNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatUnitType(unit.unitType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {unit.property.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-navy-dark">
                      KSh {unit.rent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal("view", unit)}
                          className="p-2 text-gray-600 hover:text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal("edit", unit)}
                          className="p-2 text-gray-600 hover:text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUnit(unit);
                            setIsAssignModalOpen(true);
                          }}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Assign Tenant"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal("delete", unit)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(modalMode === "create" || modalMode === "edit") && (
        <Modal isOpen={true} onClose={closeModal} className="max-w-lg">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-navy-dark">
                {modalMode === "create" ? "Add New Unit" : "Edit Unit"}
              </h2>
              <p className="text-gray-600 mt-1">
                {modalMode === "create"
                  ? "Create a new rental unit"
                  : "Update unit information"}
              </p>
            </div>

            <form onSubmit={modalMode === "create" ? handleCreate : handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Unit Number *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., A101"
                  value={formData.unitNumber}
                  onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Unit Type *
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  value={formData.unitType}
                  onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select unit type</option>
                  {UNIT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Property *
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2">
                    Monthly Rent (KSh) *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-2">
                    Deposit (KSh)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Status *
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                  disabled={isSubmitting}
                >
                  {UNIT_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : modalMode === "create" ? "Create Unit" : "Update Unit"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modalMode === "view" && selectedUnit && (
        <Modal isOpen={true} onClose={closeModal} className="max-w-lg">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-navy-dark">Unit Details</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Unit Number</label>
                  <p className="text-navy-dark font-medium">{selectedUnit.unitNumber}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Unit Type</label>
                  <p className="text-navy-dark">{formatUnitType(selectedUnit.unitType)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Property</label>
                <p className="text-navy-dark">{selectedUnit.property.name}</p>
                <p className="text-sm text-gray-500">{selectedUnit.property.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Monthly Rent</label>
                  <p className="text-navy-dark font-medium">KSh {selectedUnit.rent.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Deposit</label>
                  <p className="text-navy-dark font-medium">
                    {selectedUnit.deposit ? `KSh ${selectedUnit.deposit.toLocaleString()}` : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUnit.status)}`}>
                  {selectedUnit.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={closeModal} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {modalMode === "delete" && selectedUnit && (
        <Modal isOpen={true} onClose={closeModal} className="max-w-md">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-dark">Delete Unit</h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete unit <strong>{selectedUnit.unitNumber}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={closeModal} className="flex-1" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Unit"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Tenant Modal */}
      <AssignUnitToTenantModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedUnit(null);
        }}
        unit={selectedUnit}
        onSuccess={() => {
          fetchUnits();
          setIsAssignModalOpen(false);
          setSelectedUnit(null);
        }}
      />
    </div>
  );
}

