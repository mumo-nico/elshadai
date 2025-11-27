"use client";

import * as React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We will get back to you soon.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

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
              Get in <span className="text-neon-blue">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-navy-dark mb-6">
                  Contact <span className="text-neon-blue">Information</span>
                </h2>
                <p className="text-gray-600 mb-8">
                  Reach out to us through any of the following channels. We're here to help!
                </p>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neon-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-dark mb-1">Location</h3>
                    <p className="text-gray-600">Kasaala Market, Ikutha</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neon-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-dark mb-1">Phone</h3>
                    <p className="text-gray-600">0727497189</p>
                    <p className="text-gray-600">0726722599</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neon-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-dark mb-1">Email</h3>
                    <p className="text-gray-600">info@elshadaiapartments.co.ke</p>
                    <p className="text-gray-600">nicholasmusingila@gmail.com</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neon-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-dark mb-1">Office Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 9:00 AM - 4:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-navy-dark mb-6">Send us a Message</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-navy-dark mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-navy-dark mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-navy-dark mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0712345678"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-navy-dark mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent resize-none"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </motion.div>
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

