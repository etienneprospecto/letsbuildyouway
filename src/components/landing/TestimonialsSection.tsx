import React from "react";
import { ScrollingBanner } from "./ScrollingBanner";

export const TestimonialsSection = (): JSX.Element => {
  const testimonials = [
    {
      quote:
        "BuildYourWay a transformé ma façon de travailler. Je peux maintenant suivre tous mes clients facilement et ils sont plus motivés que jamais !",
      author: "Sarah M., Coach Fitness",
      photo: "/images/coach-female4.jpg"
    },
    {
      quote:
        "L'application m'a permis de fidéliser ma clientèle. Le suivi personnalisé fait toute la différence dans les résultats de mes clients.",
      author: "Thomas L., Coach Personnel",
      photo: "/images/coach-male1.jpg"
    },
    {
      quote:
        "Grâce à BuildYourWay, j'ai pu développer mon activité et offrir un service premium à mes clients. L'interface est intuitive et professionnelle.",
      author: "Marie D., Coach Nutrition",
      photo: "/images/coach-female2.jpg"
    },
    {
      quote:
        "La fonctionnalité de planification d'entraînements est exceptionnelle. Mes clients adorent recevoir leurs programmes personnalisés directement sur leur téléphone.",
      author: "Alex R., Coach CrossFit",
      photo: "/images/coach-male2.jpg"
    },
    {
      quote:
        "BuildYourWay m'a aidé à doubler mon chiffre d'affaires en 6 mois. La gestion des clients et le suivi des progrès sont devenus un jeu d'enfant !",
      author: "Sophie K., Coach Yoga",
      photo: "/images/coach-female3.jpg"
    },
    {
      quote:
        "L'outil de communication intégré est fantastique. Je peux échanger avec mes clients en temps réel et les motiver quotidiennement.",
      author: "Julien P., Coach Musculation",
      photo: "/images/coach-male3.jpg"
    },
    {
      quote:
        "Les statistiques détaillées m'aident à adapter mes programmes. Mes clients voient leurs progrès et restent motivés sur le long terme.",
      author: "Camille L., Coach Pilates",
      photo: "/images/coach-female5.jpg"
    },
    {
      quote:
        "La création de programmes est devenue un plaisir. L'interface est si intuitive que je peux créer des séances personnalisées en quelques minutes.",
      author: "Marc D., Coach CrossFit",
      photo: "/images/coach-male4.jpg"
    },
    {
      quote:
        "Mes clients apprécient la flexibilité de l'application. Ils peuvent s'entraîner n'importe où et n'importe quand avec leurs programmes.",
      author: "Laura M., Coach Yoga",
      photo: "/images/coach-female6.jpg"
    },
    {
      quote:
        "BuildYourWay a révolutionné mon business. J'ai pu passer de 20 à 80 clients en un an grâce à cette plateforme exceptionnelle.",
      author: "Nicolas B., Coach Personnel",
      photo: "/images/coach-male5.jpg"
    },
  ];

  return (
    <section id="testimonials" className="w-full relative py-20">
      <div className="relative w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bebas mb-4 bg-gradient-to-r from-white to-[#fa7315] bg-clip-text text-transparent tracking-wider">
            TÉMOIGNAGES
          </h2>
          <p className="text-gray-300 text-lg">NOS COACHS PARLENT</p>
        </div>
      </div>

      <div className="h-[360px] py-6 w-full">
        <ScrollingBanner speed={1.2} className="h-full w-full">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="h-[300px] w-64 flex-shrink-0 flex items-center justify-center px-2 py-4">
                <div className="h-full w-full rounded-3xl bg-gradient-to-br from-[#040d1f] to-[#0a1a2e] border border-[#fa7315]/30 p-4 md:p-5 flex flex-col items-center justify-between text-center gap-3 shadow-2xl relative overflow-hidden group hover:border-[#fa7315]/50 transition-all duration-500 hover:shadow-[#fa7315]/20 hover:shadow-2xl hover:scale-[1.01]">
                  {/* Effet de fond animé avec animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fa7315]/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                  
                  {/* Ligne orange décorative en haut */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-[#fa7315] to-transparent rounded-full"></div>
                  
                  {/* Citation avec animation */}
                  <blockquote className="relative z-10 text-sm md:text-base font-light italic text-white leading-relaxed group-hover:text-gray-100 transition-colors duration-500 flex-1 flex items-center justify-center px-2">
                    <div className="text-center">
                      <span className="text-[#fa7315] text-2xl font-serif group-hover:scale-110 transition-transform duration-500">"</span>
                      <span className="mx-2">{testimonial.quote}</span>
                      <span className="text-[#fa7315] text-2xl font-serif group-hover:scale-110 transition-transform duration-500">"</span>
                    </div>
                  </blockquote>
                  
                  {/* Auteur et étoiles */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="text-[#fa7315] font-bold text-sm tracking-wider group-hover:text-orange-400 transition-colors duration-500">
                      {testimonial.author}
                    </div>
                    
                    {/* Étoiles de notation avec animation */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-3 h-3 text-[#fa7315] group-hover:text-orange-400 group-hover:scale-110 transition-all duration-300" style={{ transitionDelay: `${i * 50}ms` }}>
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Effet de brillance au hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </ScrollingBanner>
        </div>
    </section>
  );
};
