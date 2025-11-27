"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Building2, Users, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onLoginClick: () => void;
}

export function HeroSection({ onLoginClick }: HeroSectionProps) {
  const [stats, setStats] = React.useState({
    totalUnits: 50,
    totalTenants: 100,
  });

  React.useEffect(() => {
    fetch("/api/public/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalUnits: data.totalUnits || 50,
          totalTenants: data.totalTenants || 100,
        });
      })
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-neon-blue/10 text-neon-blue px-4 py-2 rounded-full text-sm font-medium"
            >
              <Building2 className="w-4 h-4" />
              Welcome to Elshadai Apartments
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-navy-dark leading-tight"
            >
              Your Home,{" "}
              <span className="text-neon-blue">Simplified</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              Welcome to Elshadai Apartments in Kasaala Market, Ikutha. 
              Manage your rent payments, submit maintenance requests, and stay connected with us - all in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" onClick={onLoginClick} className="text-base">
                Login to Tenant Dashboard
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              <div>
                <div className="flex items-center gap-2 text-neon-blue mb-1">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-navy-dark">{stats.totalUnits}+</div>
                <div className="text-sm text-gray-600">Quality Units</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-neon-blue mb-1">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-navy-dark">{stats.totalTenants}+</div>
                <div className="text-sm text-gray-600">Happy Tenants</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-neon-blue mb-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-navy-dark">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Elshadai Apartments"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neon-blue/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-neon-blue" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Secure & Reliable</div>
                  <div className="text-lg font-bold text-navy-dark">100% Trusted</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

