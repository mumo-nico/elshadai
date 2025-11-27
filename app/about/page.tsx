"use client";

import * as React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { AuthModal } from "@/components/auth/auth-modal";
import { motion } from "framer-motion";
import { Building2, Users, Shield, Heart, MapPin, Phone, Mail } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-navy-dark mb-6">
              About <span className="text-neon-blue">Elshadai Apartments</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Your trusted home in Kasaala Market, Ikutha. We provide quality rental units with excellent service and modern amenities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-navy-dark mb-6">
                Our <span className="text-neon-blue">Story</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Elshadai Apartments has been serving the Ikutha community for years, providing quality rental housing solutions to families and individuals.
                </p>
                <p>
                  Located in the heart of Kasaala Market, we offer a variety of rental units including shops, single rooms, double rooms, bedsitters, and 1-2 bedroom apartments.
                </p>
                <p>
                  Our commitment is to provide safe, comfortable, and affordable housing with excellent customer service and modern amenities.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-[400px] rounded-lg overflow-hidden shadow-xl"
            >
              <Image
                src="https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Elshadai Apartments Building"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-navy-dark mb-4">
              Our <span className="text-neon-blue">Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Building2,
                title: "Quality Housing",
                description: "Well-maintained properties with modern amenities and regular inspections.",
              },
              {
                icon: Users,
                title: "Tenant First",
                description: "Your comfort and satisfaction are our top priorities.",
              },
              {
                icon: Shield,
                title: "Security",
                description: "Safe and secure compound with 24/7 monitoring.",
              },
              {
                icon: Heart,
                title: "Community",
                description: "Building a strong, supportive community of residents.",
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-lg border border-gray-200 hover:border-neon-blue hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-neon-blue/10 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-neon-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-dark mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  );
}

