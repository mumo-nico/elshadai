"use client";

import * as React from "react";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section-new";
import { FeaturesSection } from "@/components/landing/features-section";
import { StepsSection } from "@/components/landing/steps-section";
import { RentalUnitsSection } from "@/components/landing/rental-units-section";
import { ServicesSection } from "@/components/landing/services-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { AuthModal } from "@/components/auth/auth-modal";

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  return (
    <main className="min-h-screen">
      <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
      <HeroSection onLoginClick={() => setIsAuthModalOpen(true)} />
      <ServicesSection />
      <RentalUnitsSection />
      <FeaturesSection />
      <StepsSection />
      <CTASection onGetStarted={() => setIsAuthModalOpen(true)} />
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  );
}
