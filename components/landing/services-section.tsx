"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import {
  CreditCard,
  FileText,
  Shield,
  Users,
  Package,
  Headphones,
  Building2,
} from "lucide-react";

const services = [
  // Row 1: 2 cards
  {
    icon: CreditCard,
    title: "Easy Payment Tracking",
    description: "Track your rent payments, view payment history, and receive digital receipts instantly.",
  },
  {
    icon: FileText,
    title: "Digital Lease Agreements",
    description: "Access your lease agreement anytime, anywhere. All documents stored securely online.",
  },
  // Row 2: 3 cards
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your data is protected with bank-level security. We prioritize your privacy and safety.",
  },
  {
    icon: Users,
    title: "Tenant Support",
    description: "Get quick responses to your queries. Our support team is here to help you 24/7.",
  },
  {
    icon: Package,
    title: "Maintenance Requests",
    description: "Submit and track maintenance requests easily. Get updates on repair progress in real-time.",
  },
  // Row 3: 2 cards
  {
    icon: Headphones,
    title: "Customer Service",
    description: "Dedicated customer service team ready to assist with any concerns or questions you may have.",
  },
  {
    icon: Building2,
    title: "Property Management",
    description: "Well-maintained properties with regular inspections and prompt attention to all issues.",
  },
];

export function ServicesSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" ref={ref} className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-navy-dark mb-4">
            Our Property <span className="text-neon-blue">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for a comfortable living experience
          </p>
        </motion.div>

        {/* Services Grid - 2-3-2 Layout */}
        <div className="space-y-8">
          {/* Row 1: 2 Cards - Wider to match 3-card row */}
          <div className="grid md:grid-cols-2 gap-8">
            {services.slice(0, 2).map((service, index) => (
              <ServiceCard
                key={service.title}
                service={service}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>

          {/* Row 2: 3 Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {services.slice(2, 5).map((service, index) => (
              <ServiceCard
                key={service.title}
                service={service}
                index={index + 2}
                isInView={isInView}
              />
            ))}
          </div>

          {/* Row 3: 2 Cards - Wider to match 3-card row */}
          <div className="grid md:grid-cols-2 gap-8">
            {services.slice(5, 7).map((service, index) => (
              <ServiceCard
                key={service.title}
                service={service}
                index={index + 5}
                isInView={isInView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  service: {
    icon: React.ElementType;
    title: string;
    description: string;
  };
  index: number;
  isInView: boolean;
}

function ServiceCard({ service, index, isInView }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-8 rounded-lg border border-gray-200 hover:border-neon-blue hover:shadow-lg transition-all duration-300 group"
    >
      <div className="w-14 h-14 bg-navy-dark rounded-lg flex items-center justify-center mb-6 group-hover:bg-neon-blue transition-colors duration-300">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-navy-dark mb-3">{service.title}</h3>
      <p className="text-gray-600 leading-relaxed">{service.description}</p>
    </motion.div>
  );
}

