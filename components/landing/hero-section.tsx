"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-eggshell-white via-white to-sky-blue/10 pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky-blue/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-neon-blue/10 text-neon-blue px-4 py-2 rounded-full text-sm font-medium"
            >
              <span className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
              #1 Rent Management in Kenya
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-6xl font-bold text-navy-dark leading-tight"
            >
              Manage Your Properties{" "}
              <span className="text-neon-blue">Effortlessly</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 leading-relaxed"
            >
              The complete solution for landlords and tenants in Kenya. Track
              rent payments, manage properties, handle complaints, and generate
              reports—all in one beautiful platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" onClick={onGetStarted} className="group">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="group">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-8 pt-8"
            >
              <div>
                <div className="text-3xl font-bold text-navy-dark">500+</div>
                <div className="text-sm text-gray-600">Properties Managed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-navy-dark">2,000+</div>
                <div className="text-sm text-gray-600">Happy Tenants</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-navy-dark">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image
                src="https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Modern apartment building"
                width={600}
                height={700}
                className="w-full h-auto object-cover"
                priority
              />
            </motion.div>

            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl"
            >
              <div className="text-sm text-gray-600 mb-1">Monthly Revenue</div>
              <div className="text-2xl font-bold text-neon-blue">KSh 2.4M</div>
              <div className="text-xs text-green-600 mt-1">↑ 12% this month</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

