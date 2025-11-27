"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useInView } from "framer-motion";
import { Home, CheckCircle2 } from "lucide-react";

const unitImages: Record<string, string> = {
  "SHOP": "https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=600",
  "SINGLE_ROOM": "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
  "DOUBLE_ROOM": "https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=600",
  "BEDSITTER": "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
  "ONE_BEDROOM": "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=600",
  "TWO_BEDROOM": "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=600",
};

export function RentalUnitsSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [units, setUnits] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/public/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.unitTypeStats) {
          const formattedUnits = data.unitTypeStats.map((stat: any) => ({
            type: stat.type.replace("_", " "),
            image: unitImages[stat.type] || unitImages["SINGLE_ROOM"],
            totalUnits: stat.total,
            occupied: stat.occupied,
            available: stat.available,
          }));
          setUnits(formattedUnits);
        }
      })
      .catch((error) => console.error("Error fetching unit stats:", error));
  }, []);

  return (
    <section id="units" ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-navy-dark mb-4">
            Popular Rental <span className="text-neon-blue">Units</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our variety of rental units available at Elshadai Apartments
          </p>
        </motion.div>

        {/* Units Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {units.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">Loading units...</p>
            </div>
          ) : (
            units.map((unit, index) => (
            <motion.div
              key={unit.type}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-neon-blue transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={unit.image}
                  alt={unit.type}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Availability Badge */}
                {unit.available > 0 && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {unit.available} Available
                  </div>
                )}
                {unit.available === 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Fully Occupied
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-5 h-5 text-neon-blue" />
                  <h3 className="text-2xl font-bold text-navy-dark">{unit.type}</h3>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Units:</span>
                    <span className="font-semibold text-navy-dark">{unit.totalUnits}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Occupied:</span>
                    <span className="font-semibold text-navy-dark">{unit.occupied}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold text-green-600">{unit.available}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4" />

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                    <span>24/7 Water Supply</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                    <span>Secure Compound</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                    <span>Ample Parking</span>
                  </div>
                </div>
              </div>
            </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

