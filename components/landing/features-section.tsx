"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import {
  Building2,
  CreditCard,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Easy Payment Tracking",
    description:
      "Track your rent payments in KSh, view payment history, and receive instant digital receipts.",
    color: "bg-green-500",
  },
  {
    icon: MessageSquare,
    title: "Submit Maintenance Requests",
    description:
      "Report maintenance issues and complaints easily. Track the status of your requests in real-time.",
    color: "bg-pink-500",
  },
  {
    icon: FileText,
    title: "Digital Lease Access",
    description:
      "Access your lease agreement anytime, anywhere. All your documents stored securely online.",
    color: "bg-indigo-500",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Your personal information and payment data are protected with bank-level security.",
    color: "bg-red-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description:
      "Access your tenant dashboard from any device - desktop, tablet, or smartphone.",
    color: "bg-teal-500",
  },
  {
    icon: Users,
    title: "Direct Communication",
    description:
      "Stay connected with property management. Get quick responses to your queries and concerns.",
    color: "bg-purple-500",
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description:
      "Receive instant notifications for payment confirmations, maintenance updates, and important announcements.",
    color: "bg-yellow-500",
  },
  {
    icon: BarChart3,
    title: "Payment History",
    description:
      "View your complete payment history and download receipts for your records anytime.",
    color: "bg-orange-500",
  },
  {
    icon: Building2,
    title: "Unit Information",
    description:
      "Access all information about your rental unit, amenities, and property guidelines.",
    color: "bg-blue-500",
  },
];

export function FeaturesSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-navy-dark mb-4">
            Everything You Need for{" "}
            <span className="text-neon-blue">Comfortable Living</span>
          </h2>
          <p className="text-lg text-gray-600">
            Powerful features designed to make your tenant experience at Elshadai Apartments seamless and convenient.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative p-8 rounded-lg bg-white border border-gray-200 hover:border-neon-blue transition-all duration-300 hover:shadow-lg h-full">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="w-14 h-14 rounded-lg bg-neon-blue/10 flex items-center justify-center group-hover:bg-neon-blue group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-7 h-7 text-neon-blue group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-navy-dark mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-lg bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

