"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import DatePicker from "@/components/ui/date-picker";

interface Property {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  unitNumber: string;
  unitType: string;
  rent: number;
  deposit: number | null;
  property: Property;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
}

interface AssignUnitToTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
  onSuccess: () => void;
}

export default function AssignUnitToTenantModal({
  isOpen,
  onClose,
  unit,
  onSuccess,
}: AssignUnitToTenantModalProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    userId: "",
    leaseStartDate: "",
    leaseEndDate: "",
    monthlyRent: "",
    depositPaid: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
      if (unit) {
        setFormData((prev) => ({
          ...prev,
          monthlyRent: unit.rent.toString(),
          depositPaid: unit.deposit?.toString() || "",
        }));
      }
    }
  }, [isOpen, unit]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return;

    try {
      const response = await fetch("/api/tenants/assign-unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: unit.id,
          ...formData,
        }),
      });

      if (response.ok) {
        onSuccess();
        setFormData({
          userId: "",
          leaseStartDate: "",
          leaseEndDate: "",
          monthlyRent: "",
          depositPaid: "",
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to assign tenant");
      }
    } catch (error) {
      console.error("Error assigning tenant:", error);
      alert("Failed to assign tenant");
    }
  };

  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-navy-dark">Assign Tenant</h2>
            <p className="text-sm text-gray-600 mt-1">
              Assign a tenant to Unit {unit.unitNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-dark mb-2">
              Select Tenant *
            </label>
            <select
              required
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors"
            >
              <option value="">Choose a tenant...</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} ({tenant.email})
                </option>
              ))}
            </select>
            {tenants.length === 0 && !loading && (
              <p className="text-xs text-red-500 mt-1">
                No tenants found. Create a tenant first.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Lease Start Date *
              </label>
              <DatePicker
                value={formData.leaseStartDate}
                onChange={(date) =>
                  setFormData({ ...formData, leaseStartDate: date })
                }
                placeholder="Select start date"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Lease End Date
              </label>
              <DatePicker
                value={formData.leaseEndDate}
                onChange={(date) =>
                  setFormData({ ...formData, leaseEndDate: date })
                }
                placeholder="Select end date (optional)"
                minDate={formData.leaseStartDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Monthly Rent (KSh) *
              </label>
              <input
                type="number"
                required
                value={formData.monthlyRent}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyRent: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors"
                placeholder="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Deposit Paid (KSh)
              </label>
              <input
                type="number"
                value={formData.depositPaid}
                onChange={(e) =>
                  setFormData({ ...formData, depositPaid: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors"
                placeholder="5000"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-navy-dark rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={tenants.length === 0}
              className="flex-1 px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

