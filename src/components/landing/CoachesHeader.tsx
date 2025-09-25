import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

interface CoachesHeaderProps {
  onBack: () => void;
}

export const CoachesHeader = ({ onBack }: CoachesHeaderProps): JSX.Element => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const isScrollingUpNow = scrollTop < lastScrollY;
      
      setIsScrolled(scrollTop > 50);
      setIsScrollingUp(isScrollingUpNow && scrollTop > 100);
      setLastScrollY(scrollTop);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navigationItems = [
    { label: "ACCUEIL", hasDropdown: false, href: "#hero" },
    { label: "FONCTIONNALITÉS", hasDropdown: false, href: "#services" },
    { label: "TARIFS", hasDropdown: false, href: "#pricing" },
    { label: "TÉMOIGNAGES", hasDropdown: false, href: "#testimonials" },
  ];

  const scrollToSection = (href: string) => {
    // Pour la page des coachs, on revient à la page d'accueil et on scroll vers la section
    navigate('/');
    // Attendre un peu que la page se charge puis scroll
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        const headerHeight = 100;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - 20;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <header className={`w-full h-[100px] fixed top-0 left-0 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md z-50' : 'bg-transparent z-50'
    } ${isScrollingUp ? 'transform -translate-y-full' : 'transform translate-y-0'}`}>
      <div className="relative w-full h-[110px]">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-12 z-10">
        <img
          className="w-[140px] h-[140px] rounded-full -ml-20 cursor-pointer hover:scale-105 transition-transform duration-300 relative z-20"
          alt="Build Your Way Logo"
          src="/images/logo.png"
          onClick={() => navigate('/')}
        />
          <NavigationMenu className="flex items-center ml-4 relative z-20">
            <NavigationMenuList className="flex items-center gap-6">
            {navigationItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                <div 
                  className="inline-flex items-center justify-center gap-2.5 px-3 py-2 cursor-pointer relative z-30"
                  onClick={() => scrollToSection(item.href)}
                >
                  <span className="font-bebas text-white hover:text-[#fa7315] transition-colors duration-300 text-xl tracking-wider whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <div 
                className="inline-flex items-center justify-center gap-2.5 px-3 py-2 cursor-pointer relative z-30"
                onClick={() => navigate('/')}
              >
                <Users className="w-5 h-5 text-white group-hover:text-[#fa7315] transition-colors duration-300 -mt-0.5" />
                <span className="font-bebas text-white hover:text-[#fa7315] transition-colors duration-300 text-xl tracking-wider whitespace-nowrap">
                  NOS COACHS
                </span>
              </div>
            </NavigationMenuItem>
          </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};
