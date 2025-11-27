"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, Home } from "lucide-react";

interface Property {
  id: string;
  name: string;
  location: string;
  description: string | null;
  _count: {
    units: number;
  };
}

export default function TenantPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties");
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading properties...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-dark">Properties</h1>
        <p className="text-gray-600 mt-2">Browse all available properties</p>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No properties available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-neon-blue hover:shadow-md transition-all overflow-hidden"
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
                      {property._count.units}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-500 text-center">
                    Visit "My Units" to see available units and request a lease
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

