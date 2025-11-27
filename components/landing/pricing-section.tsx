"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "Forever",
    description: "Perfect for individual landlords getting started",
    features: [
      "Up to 5 properties",
      "Up to 20 units",
      "Basic payment tracking",
      "Tenant management",
      "Email support",
      "Mobile access",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "KSh 2,999",
    period: "per month",
    description: "For growing property management businesses",
    features: [
      "Unlimited properties",
      "Unlimited units",
      "Advanced payment tracking",
      "Automated receipts",
      "Complaint management",
      "Reports & analytics",
      "Priority support",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Contact us",
    description: "For large-scale property management companies",
    features: [
      "Everything in Professional",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom reports",
      "White-label option",
      "SLA guarantee",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

interface PricingSectionProps {
  onGetStarted: () => void;
}

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" ref={ref} className="py-24 bg-gradient-to-br from-eggshell-white to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-navy-dark mb-4">
            Simple, Transparent{" "}
            <span className="text-neon-blue">Pricing</span>
          </h2>
          <p className="text-lg text-gray-600">
            Choose the perfect plan for your property management needs. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-neon-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div
                className={`relative h-full p-8 rounded-3xl bg-white transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-neon-blue shadow-2xl scale-105"
                    : "border-2 border-gray-200 hover:border-neon-blue hover:shadow-xl"
                }`}
              >
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-navy-dark mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-navy-dark">
                      {plan.price}
                    </span>
                    {plan.period !== "Contact us" && (
                      <span className="text-gray-500">/{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full mb-8"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={onGetStarted}
                >
                  {plan.cta}
                </Button>

                {/* Features */}
                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-neon-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-neon-blue" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

