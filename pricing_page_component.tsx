// ========================================
// PAGE DE TARIFICATION
// ========================================
// Fichier: app/pricing/page.tsx
// Description: Page de tarification pour l'inscription des coachs

'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = [
  {
    name: 'Warm-Up',
    price: 19.99,
    period: 'mois',
    description: 'Parfait pour débuter',
    features: [
      'Jusqu\'à 15 clients',
      '15 workouts maximum',
      '30 exercices maximum',
      'Timeline 1 semaine',
      'Dashboard basique',
      'Messaging simple',
      'Calendrier simple'
    ],
    stripePriceId: 'price_warm_up_monthly', // À remplacer par l'ID réel
    color: 'blue'
  },
  {
    name: 'Transformationnel',
    price: 39.99,
    period: 'mois',
    description: 'Le plus populaire',
    popular: true,
    features: [
      'Jusqu\'à 50 clients',
      '50 workouts maximum',
      '100 exercices maximum',
      'Timeline 4 semaines',
      'Dashboard avancé',
      'Messaging vocal',
      'Suivi nutrition',
      'Calendrier avancé',
      'Photos de progression',
      'Système de trophées',
      'Rappels automatiques'
    ],
    stripePriceId: 'price_transformationnel_monthly', // À remplacer par l'ID réel
    color: 'purple'
  },
  {
    name: 'Elite',
    price: 79.99,
    period: 'mois',
    description: 'Pour les professionnels',
    features: [
      'Jusqu\'à 100 clients',
      'Workouts illimités',
      'Exercices illimités',
      'Timeline 52 semaines',
      'IA nutrition',
      'Dashboard financier',
      'Automatisation complète',
      'Thème personnalisé',
      'Messaging vidéo',
      'Support prioritaire',
      'Gamification avancée'
    ],
    stripePriceId: 'price_elite_monthly', // À remplacer par l'ID réel
    color: 'gold'
  }
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    setLoading(plan.name);

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      // Créer la session de checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planName: plan.name,
        }),
      });

      const { sessionId } = await response.json();

      // Rediriger vers Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error('Error:', error);
        alert('Erreur lors de la redirection vers Stripe');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'inscription');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre pack coach
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez des milliers de coachs qui utilisent BYW Fitness pour transformer 
            la vie de leurs clients avec des outils professionnels.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}€
                  </span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.name}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.name ? 'Redirection...' : 'Commencer maintenant'}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Questions fréquentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Puis-je changer de pack à tout moment ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez upgrader ou downgrader votre pack à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Que se passe-t-il si je dépasse mes limites ?
              </h3>
              <p className="text-gray-600">
                Vous recevrez une notification et devrez upgrader votre pack 
                pour continuer à ajouter des clients ou des workouts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Puis-je annuler mon abonnement ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis 
                votre dashboard. Aucun frais d'annulation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
