"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, MapPin, DollarSign, Calendar, Send, Eye } from "lucide-react";

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
  property: Property;
  tenantInfo?: {
    leaseStartDate: string;
    leaseEndDate: string | null;
    monthlyRent: number;
    depositPaid: number | null;
  };
}

interface UnitsData {
  myUnits: Unit[];
  availableUnits: Unit[];
}

export default function TenantUnitsPage() {
  const router = useRouter();
  const [unitsData, setUnitsData] = useState<UnitsData>({ myUnits: [], availableUnits: [] });
  const [loading, setLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/tenant/units");
      if (response.ok) {
        const data = await response.json();
        setUnitsData({
          myUnits: data.myUnits || [],
          availableUnits: data.availableUnits || []
        });
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    try {
      const response = await fetch("/api/tenant/lease-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: selectedUnit.id,
          message: requestMessage,
        }),
      });

      if (response.ok) {
        alert("Lease request submitted successfully! The landlord will review your request.");
        setIsRequestModalOpen(false);
        setRequestMessage("");
        setSelectedUnit(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit lease request");
      }
    } catch (error) {
      console.error("Error submitting lease request:", error);
      alert("Failed to submit lease request");
    }
  };

  const formatUnitType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading units...</div>
      </div>
    );
  }

  return (
    <div>
      {/* My Units Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-navy-dark mb-2">My Units</h1>
        <p className="text-gray-600 mb-8">Units currently leased to you</p>

        {unitsData.myUnits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-12 text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You don't have any units yet.</p>
            <p className="text-sm text-gray-400 mt-2">Browse available units below to request a lease.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unitsData.myUnits.map((unit) => (
              <div
                key={unit.id}
                className="bg-white rounded-xl shadow-sm border-2 border-neon-blue/20 hover:border-neon-blue transition-all overflow-hidden"
              >
                <div className="bg-gradient-to-r from-neon-blue to-sky-blue p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      <span className="font-bold">Unit {unit.unitNumber}</span>
                    </div>
                    <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium text-navy-dark">{formatUnitType(unit.unitType)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Property
                    </p>
                    <p className="font-medium text-navy-dark">{unit.property.name}</p>
                    <p className="text-sm text-gray-600">{unit.property.location}</p>
                  </div>

                  {unit.tenantInfo && (
                    <>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-sm text-gray-500">Monthly Rent</p>
                          <p className="font-bold text-neon-blue">
                            KSh {unit.tenantInfo.monthlyRent.toLocaleString()}
                          </p>
                        </div>
                        {unit.tenantInfo.depositPaid && (
                          <div>
                            <p className="text-sm text-gray-500">Deposit Paid</p>
                            <p className="font-medium text-gray-700">
                              KSh {unit.tenantInfo.depositPaid.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Lease Period
                        </p>
                        <p className="text-sm text-gray-700">
                          {formatDate(unit.tenantInfo.leaseStartDate)}
                          {unit.tenantInfo.leaseEndDate && ` - ${formatDate(unit.tenantInfo.leaseEndDate)}`}
                        </p>
                      </div>

                      <button
                        onClick={() => router.push(`/dashboard/unit-payments?unitId=${unit.id}`)}
                        className="w-full mt-4 px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-sky-blue transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Payments
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Units Section */}
      <div>
        <h2 className="text-2xl font-bold text-navy-dark mb-2">Available Units</h2>
        <p className="text-gray-600 mb-8">Units available for lease</p>

        {unitsData.availableUnits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-12 text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No units available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unitsData.availableUnits.map((unit) => (
              <div
                key={unit.id}
                className="bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-neon-blue transition-all overflow-hidden"
              >
                <div className="bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-neon-blue" />
                      <span className="font-bold text-navy-dark">Unit {unit.unitNumber}</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                      Available
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium text-navy-dark">{formatUnitType(unit.unitType)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Property
                    </p>
                    <p className="font-medium text-navy-dark">{unit.property.name}</p>
                    <p className="text-sm text-gray-600">{unit.property.location}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rent</p>
                      <p className="font-bold text-neon-blue">
                        KSh {unit.rent.toLocaleString()}
                      </p>
                    </div>
                    {unit.deposit && (
                      <div>
                        <p className="text-sm text-gray-500">Deposit</p>
                        <p className="font-medium text-gray-700">
                          KSh {unit.deposit.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedUnit(unit);
                      setIsRequestModalOpen(true);
                    }}
                    className="w-full mt-4 px-4 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Request Lease
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lease Request Modal */}
      {isRequestModalOpen && selectedUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-navy-dark mb-4">Request Lease</h2>
            <p className="text-gray-600 mb-6">
              Submit a request to lease Unit {selectedUnit.unitNumber} at {selectedUnit.property.name}
            </p>

            <form onSubmit={handleLeaseRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-2">
                  Message to Landlord (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors resize-none"
                  placeholder="Add any additional information or questions..."
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unit:</span>
                  <span className="text-sm font-medium text-navy-dark">
                    {selectedUnit.unitNumber} - {formatUnitType(selectedUnit.unitType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Rent:</span>
                  <span className="text-sm font-bold text-neon-blue">
                    KSh {selectedUnit.rent.toLocaleString()}
                  </span>
                </div>
                {selectedUnit.deposit && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deposit:</span>
                    <span className="text-sm font-medium text-gray-700">
                      KSh {selectedUnit.deposit.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsRequestModalOpen(false);
                    setRequestMessage("");
                    setSelectedUnit(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-navy-dark rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

