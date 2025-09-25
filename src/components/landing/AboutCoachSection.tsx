import { CheckIcon, Users, Zap, Shield, Smartphone, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Analytics Avancés",
    description: "Analysez les données pour optimiser vos stratégies d'entraînement et mesurer l'impact de vos programmes.",
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Mobile First",
    description: "Accès complet depuis n'importe quel appareil mobile avec une interface optimisée pour le terrain.",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Sécurité Totale",
    description: "Protection maximale des données de vos clients avec un chiffrement de niveau bancaire.",
  },
];

export const AboutCoachSection = (): JSX.Element => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="buildyourway" className="relative py-16 bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#fa7315]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#fa7315]/5 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-[#fa7315]/10 border border-[#fa7315]/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
            <Zap className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm tracking-wider">PLATEFORME PROFESSIONNELLE</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bebas mb-8 bg-gradient-to-r from-white to-[#fa7315] bg-clip-text text-transparent tracking-wider leading-tight">
            BUILDYOURWAY
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            La plateforme qui transforme votre passion en business florissant. 
            Conçue par des coachs, pour des coachs.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Description */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-3xl font-bebas text-white tracking-wider">
                POURQUOI CHOISIR BUILDYOURWAY ?
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[#fa7315] rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 leading-relaxed">
                    <strong className="text-white">Expérience terrain :</strong> Nous comprenons vos défis quotidiens car nous les avons vécus. 
                    BuildYourWay est née de cette expérience pour vous offrir les outils les plus adaptés.
                  </p>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[#fa7315] rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 leading-relaxed">
                    <strong className="text-white">Innovation continue :</strong> Notre équipe d'experts développe constamment de nouvelles 
                    fonctionnalités basées sur vos retours et les dernières tendances du coaching sportif.
                  </p>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[#fa7315] rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 leading-relaxed">
                    <strong className="text-white">Support dédié :</strong> Bénéficiez d'un accompagnement personnalisé pour maximiser 
                    votre utilisation de la plateforme et développer votre business.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={scrollToPricing}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#fa7315] to-orange-600 text-white px-8 py-4 rounded-2xl font-bebas text-lg tracking-wider hover:from-orange-600 hover:to-[#fa7315] transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-[#fa7315]/25 hover:shadow-[#fa7315]/40"
            >
              <CheckIcon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>DÉCOUVRIR LES TARIFS</span>
            </button>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-[#fa7315]/40 transition-all duration-500 hover:bg-white/10 hover:shadow-xl hover:shadow-[#fa7315]/10"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-[#fa7315]/20 to-orange-500/20 rounded-xl group-hover:from-[#fa7315]/30 group-hover:to-orange-500/30 transition-all duration-300">
                    <div className="text-[#fa7315] group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bebas text-white mb-3 group-hover:text-[#fa7315] transition-colors duration-300 tracking-wider">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nicolas Founder Section */}
        <div className="mt-20 pt-16 border-t border-white/10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-[#fa7315]/10 border border-[#fa7315]/30 rounded-full px-6 py-3 mb-6 backdrop-blur-sm">
              <Users className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm tracking-wider">FONDATEUR & AMBASSADEUR</span>
            </div>
            
            <h3 className="text-5xl md:text-7xl font-bebas mb-6 bg-gradient-to-r from-white to-[#fa7315] bg-clip-text text-transparent tracking-wider leading-tight">
              RENCONTREZ NICOLAS
            </h3>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-gray-900/30 to-black/50 rounded-2xl p-8 border border-white/10 backdrop-blur-sm group hover:from-gray-900/50 hover:to-black/70 hover:border-[#fa7315]/30 hover:shadow-2xl hover:shadow-[#fa7315]/10 transition-all duration-500 hover:scale-[1.02]">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* Photo à gauche */}
                <div className="md:col-span-1">
                  <div className="relative w-48 h-48 mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#fa7315]/20 to-orange-500/20 rounded-full blur-xl group-hover:from-[#fa7315]/30 group-hover:to-orange-500/30 transition-all duration-500"></div>
                    <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-[#fa7315]/40 shadow-2xl group-hover:border-[#fa7315]/60 group-hover:shadow-[#fa7315]/30 transition-all duration-500">
                      <img 
                        src="/images/nicolas-founder.jpg" 
                        alt="Nicolas - Fondateur de BuildYourWay" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Texte à droite */}
                <div className="md:col-span-2 space-y-4 group-hover:translate-x-2 transition-transform duration-500">
                  <div>
                    <h4 className="text-2xl font-bebas text-white mb-2 tracking-wider">
                      NICOLAS CHEVALLIER
                    </h4>
                    <p className="text-[#fa7315] font-semibold text-lg mb-4 group-hover:text-orange-400 transition-colors duration-500">
                      Coach Sportif & Fondateur de BuildYourWay
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed text-base group-hover:text-gray-200 transition-colors duration-500">
                      <strong className="text-white group-hover:text-[#fa7315] transition-colors duration-500 text-lg">15 ans d'expérience</strong> dans le coaching sportif et la préparation physique. 
                      Nicolas a accompagné plus de 500 clients vers leurs objectifs, des débutants aux athlètes de haut niveau.
                    </p>
                    
                    <p className="text-gray-300 leading-relaxed text-base group-hover:text-gray-200 transition-colors duration-500">
                      <strong className="text-white group-hover:text-[#fa7315] transition-colors duration-500 text-lg">Expert certifié</strong> en musculation, CrossFit et réathlétisation, 
                      il a créé BuildYourWay pour démocratiser l'accès à un coaching professionnel de qualité.
                    </p>
                    
                    <p className="text-gray-300 leading-relaxed text-base group-hover:text-gray-200 transition-colors duration-500">
                      <strong className="text-white group-hover:text-[#fa7315] transition-colors duration-500 text-lg">Visionnaire du digital :</strong> Convaincu que la technologie peut 
                      révolutionner le coaching, Nicolas a développé une plateforme qui allie expertise humaine et innovation technologique.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
