"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { UserPlus, Key, Home, CreditCard } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create Your Account",
    description: "Sign up with your details and get instant access to your tenant dashboard.",
  },
  {
    icon: Key,
    number: "02",
    title: "View Your Unit",
    description: "Access all information about your rental unit, lease agreement, and payment schedule.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Make Payments",
    description: "Pay your rent securely online and receive instant digital receipts.",
  },
  {
    icon: Home,
    number: "04",
    title: "Enjoy Your Stay",
    description: "Submit maintenance requests, track payments, and communicate with management easily.",
  },
];

export function StepsSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-navy-dark mb-4">
            Simple Steps to <span className="text-neon-blue">Get Started</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting started with Elshadai Apartments is easy and straightforward
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-neon-blue to-transparent -z-10" />
                )}

                <div className="text-center">
                  {/* Icon Circle */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="w-24 h-24 bg-neon-blue/10 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-neon-blue rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-navy-dark text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-navy-dark mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

