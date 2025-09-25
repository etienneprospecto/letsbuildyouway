import { ArrowUpIcon, MailIcon, PhoneIcon, MapPinIcon, FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from "lucide-react";

interface FooterSectionProps {
  onNavigateToPrivacy?: () => void;
  onNavigateToLegal?: () => void;
  onNavigateToCoaches?: () => void;
  onNavigateToCookies?: () => void;
}

export const FooterSection = ({ onNavigateToPrivacy, onNavigateToLegal, onNavigateToCoaches, onNavigateToCookies }: FooterSectionProps): JSX.Element => {
  const quickLinks = [
    { label: "Accueil", href: "#home" },
    { label: "Fonctionnalités", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Témoignages", href: "#testimonials" },
    { label: "Nos coachs", href: "#coaches", onClick: onNavigateToCoaches }
  ];


  const socialLinks = [
    { icon: FacebookIcon, href: "https://facebook.com/buildyourway", label: "Facebook" },
    { icon: InstagramIcon, href: "https://instagram.com/buildyourway", label: "Instagram" },
    { icon: LinkedinIcon, href: "https://linkedin.com/company/buildyourway", label: "LinkedIn" },
    { icon: TwitterIcon, href: "https://twitter.com/buildyourway", label: "Twitter" }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="relative w-full bg-gradient-to-br from-[#000c22] via-[#001122] to-[#000816] overflow-hidden">

      <div className="relative z-10 px-20 py-8">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-6">
          {/* Brand Section */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center -mb-8">
        <img
          className="w-40 h-40 rounded-full"
          alt="Build Your Way Logo"
          src="/images/logo.png"
        />
            </div>
            <p className="font-body text-[#ffffffb2] text-sm leading-relaxed text-center">
              L'application tout-en-un pour les coachs sportifs qui veulent révolutionner leur approche du coaching et fidéliser leurs clients.
            </p>
            <div className="flex gap-4 justify-center">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 rounded-full bg-white/5 border border-white/10 hover:bg-orange-primary hover:border-orange-primary transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg hover:shadow-orange-primary/30"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6 animate-fade-in ml-[130px] mt-8" style={{animationDelay: '0.2s'}}>
            <h3 className="font-bebas font-bold text-white text-lg tracking-wider">Navigation</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  {link.onClick ? (
                    <button
                      onClick={link.onClick}
                      className="font-body text-[#ffffffb2] hover:text-orange-light transition-colors duration-300 hover:translate-x-1 transform inline-block text-left"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="font-body text-[#ffffffb2] hover:text-orange-light transition-colors duration-300 hover:translate-x-1 transform inline-block"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6 animate-fade-in ml-[100px] mt-8" style={{animationDelay: '0.4s'}}>
            <h3 className="font-bebas font-bold text-white text-lg tracking-wider">Contact</h3>
            <div className="space-y-4">
              <a
                href="mailto:contact@buildyourway.app"
                className="flex items-center gap-3 font-body text-[#ffffffb2] hover:text-orange-light transition-colors duration-300 group"
              >
                <MailIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                contact@buildyourway.app
              </a>
              <a
                href="tel:+33123456789"
                className="flex items-center gap-3 font-body text-[#ffffffb2] hover:text-orange-light transition-colors duration-300 group"
              >
                <PhoneIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                +33 1 23 45 67 89
              </a>
              <div className="flex items-center gap-3 font-body text-[#ffffffb2]">
                <MapPinIcon className="w-6 h-6" />
                Paris, France
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-6 animate-fade-in ml-[100px] mt-8" style={{animationDelay: '0.6s'}}>
            <h3 className="font-bebas font-bold text-white text-lg tracking-wider">Légal</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={onNavigateToLegal}
                  className="font-body text-[#ffffffb2] hover:text-orange-light transition-colors duration-300 hover:translate-x-1 transform inline-block text-sm text-left"
                >
                  Mentions légales
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToPrivacy}
                  className="font-body text-[#ffffffb2] hover:text-orange-light transition-colors duration-300 hover:translate-x-1 transform inline-block text-sm text-left"
                >
                  Politique de confidentialité
                </button>
              </li>
                     <li>
                       <button
                         onClick={onNavigateToCookies}
                         className="font-body text-[#ffffffb2] hover:text-orange-light transition-colors duration-300 hover:translate-x-1 transform inline-block text-sm text-left"
                       >
                         Cookies
                       </button>
                     </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-4 animate-fade-in" style={{animationDelay: '0.8s'}}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-body text-[#ffffffb2] text-sm">
              © 2025 BuildYourWay (BYW). Tous droits réservés.
            </div>
            
            <div className="flex items-center gap-2 font-body text-[#ffffffb2] text-sm -ml-20">
              Développé avec <span className="font-semibold">passion</span> par <a href="https://www.propulseo-site.com/" target="_blank" rel="noopener noreferrer" className="text-[#fa7315] hover:text-orange-400 transition-colors duration-300 font-semibold">Propul'SEO</a>.
            </div>
            
            <button
              onClick={scrollToTop}
              className="group p-3 rounded-full bg-orange-primary/20 border border-orange-primary/30 hover:bg-orange-primary hover:border-orange-primary transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg hover:shadow-orange-primary/30"
              aria-label="Retour en haut"
            >
              <ArrowUpIcon className="w-5 h-5 text-orange-primary group-hover:text-white transition-colors duration-300" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
