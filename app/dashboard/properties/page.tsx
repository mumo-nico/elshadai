"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Plus, Eye, Pencil, Trash2, Building2, MapPin, LayoutGrid, Table as TableIcon, Home } from "lucide-react";
import { motion } from "framer-motion";

interface Property {
  id: string;
  name: string;
  location: string;
  description: string | null;
  createdAt: string;
  _count?: {
    units: number;
  };
}

type ModalMode = "create" | "edit" | "view" | "delete" | null;
type ViewMode = "table" | "cards";

export default function PropertiesPage() {
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalMode, setModalMode] = React.useState<ModalMode>(null);
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [formData, setFormData] = React.useState({
    name: "",
    location: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Load view mode from localStorage
  React.useEffect(() => {
    const savedViewMode = localStorage.getItem("propertiesViewMode") as ViewMode;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("propertiesViewMode", mode);
  };

  // Fetch properties
  const fetchProperties = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/properties");
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Open modal handlers
  const openCreateModal = () => {
    setFormData({ name: "", location: "", description: "" });
    setModalMode("create");
  };

  const openEditModal = (property: Property) => {
    setSelectedProperty(property);
    setFormData({
      name: property.name,
      location: property.location,
      description: property.description || "",
    });
    setModalMode("edit");
  };

  const openViewModal = (property: Property) => {
    setSelectedProperty(property);
    setModalMode("view");
  };

  const openDeleteModal = (property: Property) => {
    setSelectedProperty(property);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProperty(null);
    setFormData({ name: "", location: "", description: "" });
  };

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProperties();
        closeModal();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create property");
      }
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Failed to create property");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/properties/${selectedProperty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProperties();
        closeModal();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update property");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Failed to update property");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedProperty) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/properties/${selectedProperty.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchProperties();
        closeModal();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Failed to delete property");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading properties...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark">Properties</h1>
          <p className="text-gray-600 mt-2">Manage your rental properties</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => handleViewModeChange("table")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white text-neon-blue shadow-sm"
                  : "text-gray-600 hover:text-navy-dark"
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Table</span>
            </button>
            <button
              onClick={() => handleViewModeChange("cards")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === "cards"
                  ? "bg-white text-neon-blue shadow-sm"
                  : "text-gray-600 hover:text-navy-dark"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-medium">Cards</span>
            </button>
          </div>

          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Content - Table or Cards View */}
      {viewMode === "table" ? renderTableView() : renderCardsView()}

      {/* Modals */}
      {renderModals()}
    </div>
  );

  // Render Table View
  function renderTableView() {
    return (
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                  Property Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                  Units
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-dark">
                  Description
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-navy-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No properties found. Click "Add Property" to create one.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neon-blue/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-neon-blue" />
                        </div>
                        <span className="font-medium text-navy-dark">{property.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{property.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-neon-blue/10 text-neon-blue rounded-lg text-sm font-medium">
                        {property._count?.units || 0} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 line-clamp-1">
                        {property.description || "No description"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openViewModal(property)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(property)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(property)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    );
  }

  // Render Cards View
  function renderCardsView() {
    if (properties.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No properties found. Click "Add Property" to create one.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-neon-blue hover:shadow-md transition-all overflow-hidden group"
          >
            {/* Property Header */}
            <div className="bg-gradient-to-r from-navy-dark to-gray-800 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neon-blue/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{property.name}</h3>
                    <div className="flex items-center gap-1 text-gray-300 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Body */}
            <div className="p-6 space-y-4">
              {property.description && (
                <div>
                  <p className="text-sm text-gray-600 line-clamp-3">{property.description}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Home className="w-5 h-5 text-neon-blue" />
                    <span className="text-sm font-medium">Total Units</span>
                  </div>
                  <span className="text-2xl font-bold text-neon-blue">
                    {property._count?.units || 0}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => openViewModal(property)}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => openEditModal(property)}
                  className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(property)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Render Modals
  function renderModals() {
    return (
      <>
        {/* Create/Edit Modal */}
        {(modalMode === "create" || modalMode === "edit") && (
          <Modal
            isOpen={true}
            onClose={closeModal}
            title={modalMode === "create" ? "Create Property" : "Edit Property"}
          >
            <form onSubmit={modalMode === "create" ? handleCreate : handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Property Name *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Elshadai Apartments"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Location *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Kasaala Market, Ikutha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors resize-none"
                  placeholder="Brief description of the property..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : modalMode === "create" ? "Create Property" : "Update Property"}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* View Modal */}
        {modalMode === "view" && selectedProperty && (
          <Modal isOpen={true} onClose={closeModal} title="Property Details">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Property Name</label>
                <p className="text-lg font-semibold text-navy-dark">{selectedProperty.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                <p className="text-navy-dark flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neon-blue" />
                  {selectedProperty.location}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Total Units</label>
                <p className="text-2xl font-bold text-neon-blue">{selectedProperty._count?.units || 0}</p>
              </div>

              {selectedProperty.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-navy-dark">{selectedProperty.description}</p>
                </div>
              )}

              <div className="pt-4">
                <Button onClick={closeModal} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {modalMode === "delete" && selectedProperty && (
          <Modal isOpen={true} onClose={closeModal} title="Delete Property">
            <div className="space-y-6">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{selectedProperty.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete Property"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }
}

