import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HeroSection = (): JSX.Element => {
  const navigate = useNavigate();

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      const headerHeight = 100;
      const elementPosition = pricingSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 20;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleLogin = () => {
    navigate('/app');
  };

  return (
    <section 
      id="hero"
      className="flex w-full items-center justify-end gap-2.5 pt-0 pb-0 px-20 relative min-h-screen"
      style={{
        backgroundImage: 'linear-gradient(88deg, rgba(255,140,66,0.3) 22%, rgba(255,107,53,0.2) 40%, rgba(1,6,16,0.7) 59%), url("/images/hero-image.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="flex w-full max-w-[1188px] items-center justify-end relative">

        <div className="flex flex-col w-[587px] items-end gap-[41px] relative text-right">
          <div className="flex flex-col items-end gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
            <h1 className="relative self-stretch mt-[-1.00px] font-bebas text-5xl md:text-6xl tracking-wider leading-tight text-right">
              <span className="text-white">TRANSFORMEZ VOS CLIENTS </span>
              <span className="bg-gradient-to-r from-white to-[#fa7315] bg-clip-text text-transparent">EN CHAMPIONS</span>
            </h1>

            <div className="relative self-stretch font-h6 font-[number:var(--h6-font-weight)] [font-style:var(--h6-font-style)] text-white text-[length:var(--h6-font-size)] tracking-[var(--h6-letter-spacing)] leading-[var(--h6-line-height)] text-right">
              <div>La plateforme qui transforme votre passion</div>
              <div>en business florissant. Créez, suivez et engagez</div>
              <div>vos athlètes comme un pro.</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <div className="w-2 h-2 bg-[#fa7315] rounded-full animate-pulse"></div>
              <span>Plus de 1000 coachs nous font confiance</span>
            </div>
            
              <div className="flex items-center gap-6">
                {/* Bouton Principal - CONNEXION */}
                <Button onClick={handleLogin} className="group/btn relative overflow-hidden bg-gradient-to-r from-[#fa7315] via-orange-500 to-[#fa7315] text-white px-12 py-6 rounded-2xl font-bebas text-xl tracking-wider shadow-2xl shadow-[#fa7315]/40 hover:shadow-[#fa7315]/60 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-0">
                  {/* Effet de particules flottantes */}
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-2 left-4 w-2 h-2 bg-white/50 rounded-full animate-ping"></div>
                    <div className="absolute top-4 right-6 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute bottom-3 left-8 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                    <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
                  </div>
                  
                  {/* Effet de glow externe */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#fa7315]/50 via-orange-400/50 to-[#fa7315]/50 rounded-2xl blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Contenu du bouton */}
                  <span className="relative z-10 flex items-center gap-4">
                    <span className="group-hover/btn:tracking-widest transition-all duration-300">CONNEXION</span>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover/btn:bg-white/30 group-hover/btn:scale-110 transition-all duration-300">
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                  </span>
                </Button>
                
                {/* Bouton Secondaire - VOIR LA DÉMO */}
                <Button onClick={scrollToPricing} variant="outline" className="group/demo relative overflow-hidden border-2 border-white/30 bg-white/10 backdrop-blur-lg text-white hover:bg-white/20 hover:border-white/50 px-10 py-6 rounded-2xl font-bebas text-xl tracking-wider transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/20">
                  {/* Effet de particules flottantes */}
                  <div className="absolute inset-0 opacity-0 group-hover/demo:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-2 left-4 w-2 h-2 bg-white/50 rounded-full animate-ping"></div>
                    <div className="absolute top-4 right-6 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute bottom-3 left-8 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                    <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
                  </div>
                  
                  {/* Contenu du bouton */}
                  <span className="relative z-10 flex items-center gap-4">
                    <span className="group-hover/demo:tracking-widest transition-all duration-300">VOIR LA DÉMO</span>
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover/demo:bg-white/20 group-hover/demo:rotate-12 transition-all duration-300">
                      <svg className="w-5 h-5 group-hover/demo:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </span>
                </Button>
              </div>
            
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Essai gratuit 14 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Sans engagement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
