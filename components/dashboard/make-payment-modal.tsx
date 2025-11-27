"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";

interface MakePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MakePaymentModal({
  isOpen,
  onClose,
  onSuccess,
}: MakePaymentModalProps) {
  const { data: session } = useSession();
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const [formData, setFormData] = useState({
    unitId: "",
    amount: "",
    paymentMethod: "MPESA",
    referenceNumber: "",
    cashReceiver: "",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    notes: "",
  });

  useEffect(() => {
    if (isOpen && session) {
      fetchUnits();
    }
  }, [isOpen, session]);

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/tenant/units?forPayment=true");
      if (response.ok) {
        const data = await response.json();
        setUnits(data);

        // Auto-select first unit and set its rent
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            unitId: data[0].unitId,
            amount: data[0].monthlyRent.toString(),
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const handleUnitChange = (unitId: string) => {
    const selectedUnit = units.find(u => u.unitId === unitId);
    setFormData(prev => ({
      ...prev,
      unitId,
      amount: selectedUnit ? selectedUnit.monthlyRent.toString() : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Payment submitted successfully! Waiting for landlord approval.");
        onSuccess();
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit payment");
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Failed to submit payment");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const now = new Date();
    setFormData({
      unitId: units.length > 0 ? units[0].unitId : "",
      amount: units.length > 0 ? units[0].monthlyRent.toString() : "",
      paymentMethod: "MPESA",
      referenceNumber: "",
      cashReceiver: "",
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      notes: "",
    });
  };

  if (!isOpen) return null;

  const selectedUnit = units.find(u => u.unitId === formData.unitId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-navy-dark">Make Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Unit *
            </label>
            <select
              value={formData.unitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-neon-blue focus:outline-none"
              required
            >
              <option value="">Select a unit</option>
              {units.map((unit) => (
                <option key={unit.unitId} value={unit.unitId}>
                  Unit {unit.unitNumber} - {unit.property.name} (KSh {unit.monthlyRent.toLocaleString()}/month)
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KSh) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-neon-blue focus:outline-none"
              placeholder="Enter amount"
              required
              min="0"
              step="0.01"
            />
            {selectedUnit && (
              <p className="text-sm text-gray-500 mt-1">
                Monthly rent: KSh {selectedUnit.monthlyRent.toLocaleString()}
                {selectedUnit.rentDue > 0 && (
                  <span className="text-red-600 ml-2">
                    | Rent due: KSh {selectedUnit.rentDue.toLocaleString()}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Month and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month *
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-neon-blue focus:outline-none"
                required
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-neon-blue focus:outline-none"
                required
                min="2020"
                max="2100"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-neon-blue focus:outline-none"
              required
            >
              <option value="MPESA">M-Pesa</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="BANK_CHEQUE">Bank Cheque</option>
            </select>
          </div>

          {/* Reference Number (for M-Pesa, Bank Transfer, Bank Cheque) */}
          {formData.paymentMethod !== "CASH" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.paymentMethod === "MPESA" ? "M-Pesa Transaction Code" :
                 formData.paymentMethod === "BANK_TRANSFER" ? "Bank Reference Number" :
                 "Cheque Number"}
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-neon-blue focus:outline-none"
                placeholder={
                  formData.paymentMethod === "MPESA" ? "e.g., SH12345678" :
                  formData.paymentMethod === "BANK_TRANSFER" ? "e.g., TRF123456" :
                  "e.g., CHQ001234"
                }
              />
            </div>
          )}

          {/* Cash Receiver (for Cash payments) */}
          {formData.paymentMethod === "CASH" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash Received By
              </label>
              <input
                type="text"
                value={formData.cashReceiver}
                onChange={(e) => setFormData({ ...formData, cashReceiver: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-neon-blue focus:outline-none"
                placeholder="Name of person who received cash"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-neon-blue focus:outline-none"
              rows={3}
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Payment Scenario Info */}
          {selectedUnit && formData.amount && (
            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
              <h4 className="font-semibold text-navy-dark mb-2">Payment Breakdown:</h4>
              <div className="text-sm text-gray-700 space-y-1">
                {(() => {
                  const amount = parseFloat(formData.amount);
                  const rentDue = selectedUnit.rentDue || 0;
                  const monthlyRent = selectedUnit.monthlyRent;

                  if (rentDue > 0) {
                    if (amount >= rentDue + monthlyRent) {
                      const excess = amount - rentDue - monthlyRent;
                      return (
                        <>
                          <p>✓ Clears rent due: KSh {rentDue.toLocaleString()}</p>
                          <p>✓ Pays current month: KSh {monthlyRent.toLocaleString()}</p>
                          {excess > 0 && <p>✓ Excess credited: KSh {excess.toLocaleString()}</p>}
                        </>
                      );
                    } else if (amount >= rentDue) {
                      const remaining = amount - rentDue;
                      return (
                        <>
                          <p>✓ Clears rent due: KSh {rentDue.toLocaleString()}</p>
                          <p>⚠ Partial payment for current month: KSh {remaining.toLocaleString()} of KSh {monthlyRent.toLocaleString()}</p>
                        </>
                      );
                    } else {
                      return <p>⚠ Partial payment towards rent due: KSh {amount.toLocaleString()} of KSh {rentDue.toLocaleString()}</p>;
                    }
                  } else {
                    if (amount >= monthlyRent) {
                      const excess = amount - monthlyRent;
                      return (
                        <>
                          <p>✓ Pays current month: KSh {monthlyRent.toLocaleString()}</p>
                          {excess > 0 && <p>✓ Excess credited: KSh {excess.toLocaleString()}</p>}
                        </>
                      );
                    } else {
                      return <p>⚠ Partial payment: KSh {amount.toLocaleString()} of KSh {monthlyRent.toLocaleString()}</p>;
                    }
                  }
                })()}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-navy-dark rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

