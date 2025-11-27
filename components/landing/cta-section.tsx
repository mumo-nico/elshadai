"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 bg-navy-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D9FF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Need a Custom Management System?
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Interested in a similar system for your business? Damani Nexus builds custom management solutions tailored to your needs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => window.open('https://damaninexus.com/contact', '_blank')}
                className="bg-neon-blue hover:bg-neon-blue/90"
              >
                Contact Damani Nexus
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-navy-dark"
                onClick={() => window.open('https://wa.me/254758815721', '_blank')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp Us
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 justify-center pt-6">
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-neon-blue" />
                <span>Custom Solutions</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-neon-blue" />
                <span>Expert Developers</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-neon-blue" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>

          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-8 border-t border-gray-700"
          >
            <p className="text-gray-400 text-sm">
              This system was created by{" "}
              <a
                href="https://damaninexus.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-blue hover:underline font-medium"
              >
                Damani Nexus
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
