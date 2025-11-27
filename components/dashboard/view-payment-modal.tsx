"use client";

import { X, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { generatePaymentReceipt } from "@/lib/pdf-receipt";

interface ViewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
}

export default function ViewPaymentModal({
  isOpen,
  onClose,
  payment,
}: ViewPaymentModalProps) {
  if (!isOpen || !payment) return null;

  const handleDownloadReceipt = () => {
    generatePaymentReceipt(payment);
  };

  const handleDownloadReceiptOld = () => {
    // Old text-based receipt (backup)
    const receiptContent = `
ELSHADAI APARTMENTS
Kasaala Market, Ikutha, Kenya
================================

PAYMENT RECEIPT
Receipt #: ${payment.id}
Date: ${new Date(payment.createdAt).toLocaleDateString()}

--------------------------------
TENANT INFORMATION
--------------------------------
Name: ${payment.user.name}
Email: ${payment.user.email}

--------------------------------
PAYMENT DETAILS
--------------------------------
Property: ${payment.unit.property.name}
Unit: ${payment.unit.unitNumber}
Month/Year: ${payment.month}/${payment.year}
Amount Paid: KSh ${payment.amount.toLocaleString()}
Payment Method: ${payment.paymentMethod}
${payment.referenceNumber ? `Reference: ${payment.referenceNumber}` : ""}
${payment.cashReceiver ? `Received By: ${payment.cashReceiver}` : ""}

--------------------------------
STATUS
--------------------------------
Status: ${payment.status}
${payment.isApproved ? `Approved By: Landlord` : ""}
${payment.approvedAt ? `Approved On: ${new Date(payment.approvedAt).toLocaleDateString()}` : ""}

${payment.notes ? `\nNotes: ${payment.notes}` : ""}

================================
Thank you for your payment!
================================
    `.trim();

    // Create a blob and download
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${payment.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = () => {
    switch (payment.status) {
      case "APPROVED":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "REJECTED":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (payment.status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-navy-dark">Payment Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor()}`}>
                  {payment.status}
                </span>
              </div>
            </div>
            {payment.status === "APPROVED" && (
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-sky-blue transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            )}
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receipt Number</p>
              <p className="font-semibold text-navy-dark">{payment.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Payment Date</p>
              <p className="font-semibold text-navy-dark">
                {new Date(payment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Property</p>
              <p className="font-semibold text-navy-dark">{payment.unit.property.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Unit</p>
              <p className="font-semibold text-navy-dark">Unit {payment.unit.unitNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Month/Year</p>
              <p className="font-semibold text-navy-dark">
                {payment.month}/{payment.year}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Amount</p>
              <p className="font-semibold text-navy-dark text-lg">
                KSh {payment.amount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-navy-dark mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Method</p>
                <p className="font-medium text-navy-dark">{payment.paymentMethod}</p>
              </div>
              {payment.referenceNumber && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reference Number</p>
                  <p className="font-medium text-navy-dark">{payment.referenceNumber}</p>
                </div>
              )}
              {payment.cashReceiver && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cash Received By</p>
                  <p className="font-medium text-navy-dark">{payment.cashReceiver}</p>
                </div>
              )}
            </div>
          </div>

          {/* Approval Details */}
          {payment.status === "APPROVED" && payment.approvedAt && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-navy-dark mb-3">Approval Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved On</p>
                  <p className="font-medium text-navy-dark">
                    {new Date(payment.approvedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-navy-dark mb-2">Notes</h3>
              <p className="text-gray-700">{payment.notes}</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-navy-dark rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

