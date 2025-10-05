import { CheckIcon, XIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { supabase } from "../../lib/supabase";

const pricingPlans = [
  {
    name: "WARM-UP",
    price: "19,99€",
    period: "/mois",
    description: "Idéal pour démarrer (coachs débutants)",
    buyButtonUrl: "https://buy.stripe.com/test_28E6oJd8T7sO7Ta53M7AI00",
    features: [
      { name: "Jusqu'à 15 clients", included: true },
      { name: "Timeline 1 semaine", included: true },
      { name: "Jusqu'à 15 workouts", included: true },
      { name: "Jusqu'à 30 exercices", included: true },
      { name: "Dashboard coach (métriques principales)", included: true },
      { name: "Gestion clients basique", included: true },
      { name: "Messagerie coach ↔ client", included: true },
      { name: "Calendrier simple (Google/Outlook + manuel)", included: true },
      { name: "Dashboard client et suivi de base", included: true },
      { name: "Paramètres et notifications basiques", included: true },
    ],
    popular: false,
    gradient: "from-gray-600 to-gray-800",
  },
  {
    name: "TRANSFORMATIONNEL",
    price: "39,99€",
    period: "/mois",
    description: "Pour coachs en développement",
    buyButtonUrl: "https://buy.stripe.com/test_28EaEZecXdRc3CUbsa7AI01",
    features: [
      { name: "Jusqu'à 50 clients", included: true },
      { name: "Timeline 1 mois", included: true },
      { name: "Jusqu'à 50 workouts", included: true },
      { name: "Jusqu'à 100 exercices", included: true },
      { name: "Messagerie + vocal", included: true },
      { name: "Calendrier avancé (créneaux / réservation)", included: true },
      { name: "Suivi nutrition (coach + client)", included: true },
      { name: "Feedbacks hebdomadaires avancés", included: true },
      { name: "Photos d'évolution + historique détaillé", included: true },
      { name: "Système de trophées", included: true },
      { name: "Ressources clients partagées", included: true },
      { name: "Relances paiements automatiques", included: true },
    ],
    popular: true,
    gradient: "from-[#fa7315] to-orange-600",
  },
  {
    name: "ELITE",
    price: "69,99€",
    period: "/mois",
    description: "Pour coachs experts et studios",
    buyButtonUrl: "https://buy.stripe.com/test_fZu4gB9WHfZk8Xecwe7AI02",
    features: [
      { name: "Jusqu'à 100 clients", included: true },
      { name: "Timeline 1 an", included: true },
      { name: "Workouts illimités", included: true },
      { name: "Exercices illimités", included: true },
      { name: "Messagerie enrichie (vocal, images, vidéos)", included: true },
      { name: "Suivi nutrition avec IA et analyses", included: true },
      { name: "Gamification avancée", included: true },
      { name: "Personnalisation interface (couleurs, thèmes)", included: true },
      { name: "Dashboard financier coach", included: true },
      { name: "Automatisations complètes", included: true },
      { name: "Intégration calendrier complète", included: true },
      { name: "Ressources premium et exports", included: true },
      { name: "Support prioritaire", included: true },
    ],
    popular: false,
    gradient: "from-purple-600 to-purple-800",
  },
];

export const PricingSection = (): JSX.Element => {
  const handleGetStarted = (buyButtonUrl: string) => {
    // Rediriger vers le Buy Button Stripe
    window.location.href = buyButtonUrl;
  };

  return (
    <section id="pricing" className="relative py-20 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fa7315' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bebas text-white mb-4 tracking-wider">
            Choisissez Votre
            <span className="bg-gradient-to-r from-[#fa7315] to-orange-400 text-transparent bg-clip-text ml-2">
              Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Des tarifs transparents pour tous les coachs, du débutant au professionnel établi
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`group relative overflow-hidden transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 h-full flex flex-col ${
                plan.popular 
                  ? 'ring-2 ring-[#fa7315] shadow-2xl shadow-[#fa7315]/20 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm' 
                  : 'hover:shadow-2xl hover:shadow-[#fa7315]/20 hover:ring-2 hover:ring-[#fa7315]/50 bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-sm'
              }`}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#fa7315] via-orange-400 to-[#fa7315] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-[#fa7315]/10 to-transparent rounded-full blur-2xl transform translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute top-1/2 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/5 to-transparent rounded-full blur-xl transform -translate-x-6 group-hover:translate-x-0 group-hover:scale-125 transition-all duration-700"></div>
              </div>

              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 group-hover:scale-110 transition-transform duration-300">
                  <div className="bg-gradient-to-r from-[#fa7315] to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg group-hover:shadow-xl group-hover:shadow-[#fa7315]/40">
                    Le plus populaire
                  </div>
                </div>
              )}

              <CardContent className={`relative z-10 p-8 ${plan.popular ? 'pt-12' : ''} group-hover:bg-gradient-to-br group-hover:from-white/5 group-hover:to-transparent transition-all duration-500 h-full flex flex-col`}>
                {/* Plan Header */}
                <div className="text-center mb-8 group-hover:transform group-hover:scale-105 transition-all duration-500">
                  <h3 className="text-2xl font-bebas text-white mb-2 tracking-wider group-hover:text-[#fa7315] transition-colors duration-500">{plan.name}</h3>
                  <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors duration-500">{plan.description}</p>
                  <div className="flex items-baseline justify-center group-hover:transform group-hover:scale-110 transition-all duration-500">
                    <span className="text-5xl font-bold text-white group-hover:text-[#fa7315] transition-colors duration-500">{plan.price}</span>
                    <span className="text-gray-400 ml-1 group-hover:text-gray-300 transition-colors duration-500">{plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex} 
                      className="flex items-center gap-3 group-hover:transform group-hover:translate-x-2 transition-all duration-300"
                      style={{ transitionDelay: `${featureIndex * 50}ms` }}
                    >
                      {feature.included ? (
                        <CheckIcon className="w-5 h-5 text-[#fa7315] flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                      ) : (
                        <XIcon className="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                      )}
                      <span className={`text-sm transition-colors duration-300 ${
                        feature.included 
                          ? 'text-white group-hover:text-[#fa7315]' 
                          : 'text-gray-500 group-hover:text-gray-400'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="w-full mt-auto">
                  <button
                    onClick={() => handleGetStarted(plan.buyButtonUrl)}
                    className={`group/btn relative w-full py-3 px-6 rounded-lg font-semibold transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#fa7315] to-orange-600 text-white hover:from-orange-600 hover:to-[#fa7315] hover:shadow-2xl hover:shadow-[#fa7315]/40'
                        : 'bg-gray-800 text-white hover:bg-gradient-to-r hover:from-[#fa7315] hover:to-orange-600 border border-gray-600 hover:border-[#fa7315] hover:shadow-2xl hover:shadow-[#fa7315]/30'
                    }`}
                  >
                    {/* Button Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>

                    {/* Button Text */}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Démarrer l'essai gratuit
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            Tous les plans incluent un essai gratuit de 14 jours
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>✓ Pas d'engagement</span>
            <span>✓ Annulation à tout moment</span>
            <span>✓ Support 24/7</span>
            <span>✓ Mises à jour gratuites</span>
          </div>
        </div>
      </div>
    </section>
  );
};
