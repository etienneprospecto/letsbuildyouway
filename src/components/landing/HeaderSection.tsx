import { Users, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

interface HeaderSectionProps {
  onNavigateToCoaches?: () => void;
}

export const HeaderSection = ({ onNavigateToCoaches }: HeaderSectionProps): JSX.Element => {
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
    const element = document.querySelector(href);
    if (element) {
      const headerHeight = 100; // Hauteur du header fixe
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 20; // 20px d'espace supplémentaire
      
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
    <header className={`w-full h-[100px] fixed top-0 left-0 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md z-50' : 'bg-transparent z-10'
    } ${isScrollingUp ? 'transform -translate-y-full' : 'transform translate-y-0'}`}>
      <div className="relative w-full h-[110px]">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-12">
        <img
          className="w-[140px] h-[140px] rounded-full -ml-20 cursor-pointer hover:scale-105 transition-transform duration-300"
          alt="Build Your Way Logo"
          src="/images/logo.png"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
          <NavigationMenu className="flex items-center ml-4">
            <NavigationMenuList className="flex items-center gap-6">
            {navigationItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                <div 
                  className="inline-flex items-center justify-center gap-2.5 px-3 py-2 cursor-pointer"
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
                className="group inline-flex items-center justify-center gap-2.5 px-3 py-2 cursor-pointer"
                onClick={onNavigateToCoaches}
              >
                <Users className="w-5 h-5 text-white group-hover:text-[#fa7315] transition-colors duration-300" />
                <span className="font-bebas text-white group-hover:text-[#fa7315] transition-colors duration-300 text-xl tracking-wider whitespace-nowrap">
                  NOS COACHS
                </span>
              </div>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <div 
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 cursor-pointer bg-gradient-to-r from-[#fa7315] to-orange-500 rounded-xl hover:from-orange-500 hover:to-[#fa7315] transition-all duration-300 hover:scale-105"
                onClick={handleLogin}
              >
                <LogIn className="w-5 h-5 text-white" />
                <span className="font-bebas text-white text-xl tracking-wider whitespace-nowrap">
                  CONNEXION
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
