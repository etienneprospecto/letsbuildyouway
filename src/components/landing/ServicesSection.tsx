import { Card, CardContent } from "@/components/ui/card";

export const ServicesSection = (): JSX.Element => {
  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Programmes Personnalisés",
      description:
        "Créez et envoyez des programmes d'entraînement sur mesure adaptés aux objectifs de chaque client.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Suivi en Temps Réel",
      description:
        "Suivez les progrès de vos clients, leurs performances et leur assiduité en temps réel.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Communication Intégrée",
      description:
        "Échangez directement avec vos clients via un système de messagerie intégré à la plateforme.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Gestion Centralisée",
      description:
        "Centralisez toutes les informations de vos clients : profils, historiques, objectifs et résultats.",
    },
  ];

  return (
    <section id="services" className="flex w-full items-center gap-16 p-12 relative min-h-[60vh] bg-gradient-to-b from-gray-100 via-orange-50 to-white">
      
      {/* Image de fond transparente */}
      <img 
        src="https://lh3.googleusercontent.com/pw/AP1GczMxNgp_riLv2i72w7aFEgBy7GuVN1hqFKKZ2OUujifY1GSxbk4UD721qEtoHlSsc1qRDgLwFAh1STDBcRnDJ8b8_g38BGXXrmvcjsgg6MblmHcvEfz7xvzczODr6W6Q3oMbwjx7mjGO9x1wyALAEdXI=w2392-h1594-s-no-gm?authuser=0"
        alt="Salle de sport moderne avec équipements de suspension"
        className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
        crossOrigin="anonymous"
        onError={(e) => {
          console.log('Erreur de chargement de l\'image:', e);
          // Fallback vers une image de salle de sport
          e.currentTarget.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
        }}
      />
      <div className="relative w-fit -ml-[150px] -rotate-90 font-bebas font-bold italic text-[65px] text-center tracking-[6px] leading-[78px] whitespace-nowrap z-10">
        <span className="text-black [-webkit-text-stroke:1px_#000000]">
          FONCTIONNALITÉS
        </span>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#fa7315] to-transparent opacity-60"></div>
      </div>

      <div className="flex flex-col w-full max-w-[1000px] items-center relative flex-1 gap-6 z-10">
        {services.map((service, index) => {
          const getAlignment = (index: number) => {
            switch(index) {
              case 0: return "self-start ml-0 transform -translate-x-8"; // Premier à gauche avec décalage
              case 1: return "self-end mr-0 transform translate-x-8"; // Deuxième à droite avec décalage
              case 2: return "self-start ml-0 transform -translate-x-12"; // Troisième à gauche avec plus de décalage
              case 3: return "self-end mr-0 transform translate-x-12"; // Quatrième à droite avec plus de décalage
              default: return "self-center";
            }
          };

          return (
            <Card
              key={index}
              className={`group flex items-center gap-5 p-6 relative w-full max-w-[650px] bg-gradient-to-r from-white via-orange-50/30 to-white border-2 border-[#fa7315]/30 hover:border-[#fa7315] hover:bg-gradient-to-r hover:from-[#fa7315]/5 hover:via-[#fa7315]/15 hover:to-orange-100/50 transition-all duration-700 cursor-pointer rounded-2xl hover:shadow-2xl hover:shadow-[#fa7315]/30 hover:scale-105 hover:-translate-y-2 backdrop-blur-sm ${getAlignment(index)}`}
            >
              <CardContent className="flex items-center gap-6 p-0 w-full">
                <div className="relative group-hover:scale-110 transition-all duration-700 flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#fa7315] via-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white group-hover:shadow-2xl group-hover:shadow-[#fa7315]/40 transition-all duration-700 group-hover:rotate-6 group-hover:from-orange-400 group-hover:to-[#fa7315]">
                    {service.icon}
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-[#fa7315]/20 to-orange-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                  <h3 className="font-bebas text-black group-hover:text-[#fa7315] transition-all duration-700 text-2xl tracking-wider leading-tight group-hover:scale-105">
                    {service.title}
                  </h3>

                  <p className="text-gray-700 group-hover:text-gray-900 transition-all duration-700 text-base leading-relaxed group-hover:translate-x-2">
                    {service.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
