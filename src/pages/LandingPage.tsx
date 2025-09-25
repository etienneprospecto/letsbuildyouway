import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderSection } from "@/components/landing/HeaderSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutCoachSection } from "@/components/landing/AboutCoachSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FooterSection } from "@/components/landing/FooterSection";

export const LandingPage = (): JSX.Element => {
  const [currentPage, setCurrentPage] = useState<'home' | 'privacy' | 'legal' | 'cookies'>('home');
  const navigate = useNavigate();

  const navigateToPrivacy = () => setCurrentPage('privacy');
  const navigateToLegal = () => setCurrentPage('legal');
  const navigateToCookies = () => setCurrentPage('cookies');
  const navigateToHome = () => setCurrentPage('home');
  const navigateToCoaches = () => {
    navigate('/coaches');
  };

  if (currentPage === 'privacy') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={navigateToHome}
            className="mb-8 px-4 py-2 bg-[#fa7315] text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold mb-6">Politique de confidentialité</h1>
          <div className="prose prose-invert max-w-none">
            <p>Contenu de la politique de confidentialité...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'legal') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={navigateToHome}
            className="mb-8 px-4 py-2 bg-[#fa7315] text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold mb-6">Mentions légales</h1>
          <div className="prose prose-invert max-w-none">
            <p>Contenu des mentions légales...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'cookies') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={navigateToHome}
            className="mb-8 px-4 py-2 bg-[#fa7315] text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold mb-6">Politique des cookies</h1>
          <div className="prose prose-invert max-w-none">
            <p>Contenu de la politique des cookies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-[#00060f] w-full">
      <div className="page-content bg-x-0d-0d-0d w-full">
        <HeaderSection onNavigateToCoaches={navigateToCoaches} />
        <HeroSection />
        <AboutCoachSection />
        <ServicesSection />
        <PricingSection />
        <TestimonialsSection />
        <FooterSection 
          onNavigateToPrivacy={navigateToPrivacy} 
          onNavigateToLegal={navigateToLegal} 
          onNavigateToCoaches={navigateToCoaches} 
          onNavigateToCookies={navigateToCookies} 
        />
      </div>
    </div>
  );
};
