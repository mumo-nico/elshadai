"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, DollarSign } from "lucide-react";

interface PayDeficitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  totalDeficit: number;
}

export default function PayDeficitModal({
  isOpen,
  onClose,
  onSuccess,
  totalDeficit,
}: PayDeficitModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Mpesa");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [cashReceiver, setCashReceiver] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
    }
  }, [isOpen]);

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/tenant/units?forPayment=true");
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
        if (data.length > 0) {
          setSelectedUnit(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const now = new Date();
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: selectedUnit,
          amount: parseFloat(amount),
          paymentMethod,
          referenceNumber: paymentMethod !== "Cash" ? referenceNumber : undefined,
          cashReceiver: paymentMethod === "Cash" ? cashReceiver : undefined,
          month: now.getMonth() + 1, // 1-12
          year: now.getFullYear(),
          notes: notes || "Deficit payment",
          isDeficitPayment: true,
        }),
      });

      if (response.ok) {
        alert("Deficit payment submitted successfully!");
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
    setAmount("");
    setPaymentMethod("Mpesa");
    setReferenceNumber("");
    setCashReceiver("");
    setNotes("");
  };

  if (!isOpen) return null;

  const paymentAmount = parseFloat(amount) || 0;
  const isPartialPayment = paymentAmount < totalDeficit;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-navy-dark">Pay Deficit</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total Deficit: <span className="font-semibold text-red-600">KSh {totalDeficit.toLocaleString()}</span>
            </p>
          </div>
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
            <label className="block text-sm font-medium text-navy-dark mb-2">
              Select Unit
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none"
              required
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.property.name} - Unit {unit.unitNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-navy-dark mb-2">
              Payment Amount (KSh)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={totalDeficit}
              step="0.01"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none"
              required
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setAmount((totalDeficit / 2).toFixed(2))}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Half
              </button>
              <button
                type="button"
                onClick={() => setAmount(totalDeficit.toFixed(2))}
                className="px-3 py-1 text-sm bg-neon-blue text-white hover:bg-sky-blue rounded-lg transition-colors"
              >
                Full Amount
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-navy-dark mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none"
              required
            >
              <option value="Mpesa">Mpesa</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Bank Cheque">Bank Cheque</option>
            </select>
          </div>

          {/* Reference Number (for non-cash payments) */}
          {paymentMethod !== "Cash" && (
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                {paymentMethod === "Mpesa" ? "Mpesa Code" :
                 paymentMethod === "Bank" ? "Transaction Reference" :
                 "Cheque Number"}
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={`Enter ${paymentMethod === "Mpesa" ? "Mpesa code" :
                              paymentMethod === "Bank" ? "transaction reference" :
                              "cheque number"}`}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none"
                required
              />
            </div>
          )}

          {/* Cash Receiver (for cash payments) */}
          {paymentMethod === "Cash" && (
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Cash Received By
              </label>
              <input
                type="text"
                value={cashReceiver}
                onChange={(e) => setCashReceiver(e.target.value)}
                placeholder="Name of person who received cash"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none"
                required
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-navy-dark mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none resize-none"
            />
          </div>

          {/* Payment Summary */}
          {paymentAmount > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
              <h3 className="font-semibold text-navy-dark mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-neon-blue" />
                Payment Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Deficit:</span>
                  <span className="font-semibold text-red-600">KSh {totalDeficit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Amount:</span>
                  <span className="font-semibold text-neon-blue">KSh {paymentAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between">
                  <span className="text-gray-600">Remaining Deficit:</span>
                  <span className={`font-semibold ${isPartialPayment ? "text-orange-600" : "text-green-600"}`}>
                    KSh {Math.max(0, totalDeficit - paymentAmount).toLocaleString()}
                  </span>
                </div>
                {isPartialPayment && (
                  <div className="flex items-start gap-2 mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700">
                      This is a partial payment. The amount will be distributed across the oldest unpaid months first.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
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
              className="flex-1 px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

