import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, Star, MapPin, Users, Trophy, ArrowRightIcon, CheckCircleIcon, StarIcon, ZapIcon, HeartIcon, ArrowUpIcon, MailIcon, PhoneIcon, MapPinIcon, FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon, Loader2 } from "lucide-react";
import ElectricBorder from "@/components/landing/ElectricBorder";
import { Button } from "@/components/ui/button";
import { CoachesHeader } from "@/components/landing/CoachesHeader";
import { CoachService, Coach } from "@/services/coachService";

interface CoachesPageProps {
  onBack?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToLegal?: () => void;
  onNavigateToCookies?: () => void;
}

export const CoachesPage = ({ onBack, onNavigateToPrivacy, onNavigateToLegal, onNavigateToCookies }: CoachesPageProps): JSX.Element => {
      const [coaches, setCoaches] = useState<Coach[]>([]);
      const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [searchTerm, setSearchTerm] = useState("");
      const [selectedSpeciality, setSelectedSpeciality] = useState("Tous");
      const [hoveredCard, setHoveredCard] = useState<number | string | null>(null);
      const [stats, setStats] = useState({ totalCoaches: 0, totalClients: 0, averageRating: 0 });
      const navigate = useNavigate();

      // Charger les coachs au montage du composant
      useEffect(() => {
        loadCoaches();
      }, []);

      // Filtrer les coachs quand les critères changent
      useEffect(() => {
        filterCoaches();
      }, [coaches, searchTerm, selectedSpeciality]);

      const loadCoaches = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const [coachesData, statsData] = await Promise.all([
            CoachService.getAllCoaches(),
            CoachService.getCoachStats()
          ]);
          
          setCoaches(coachesData);
          setStats(statsData);
        } catch (err) {
          console.error('Erreur lors du chargement des coachs:', err);
          setError('Erreur lors du chargement des coachs. Veuillez réessayer.');
        } finally {
          setLoading(false);
        }
      };

      const filterCoaches = () => {
        let filtered = coaches;

        // Filtre par recherche
        if (searchTerm) {
          filtered = filtered.filter(coach => 
            coach.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coach.specialities?.some(spec => 
              spec.toLowerCase().includes(searchTerm.toLowerCase())
            ) ||
            (coach.bio && coach.bio.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        // Filtre par spécialité
        if (selectedSpeciality !== "Tous") {
          filtered = filtered.filter(coach => 
            coach.specialities?.some(spec => 
              spec.toLowerCase().includes(selectedSpeciality.toLowerCase())
            )
          );
        }

        setFilteredCoaches(filtered);
      };

      // Récupérer les spécialités uniques pour le filtre
      const specialities = ["Tous", ...Array.from(new Set(
        coaches.flatMap(coach => coach.specialities || [])
      )).sort()];

  const goBack = () => {
    navigate('/');
  };

  const scrollToPricing = () => {
    // Redirection vers la page d'accueil pour voir les tarifs
    navigate('/');
  };

  const quickLinks = [
    { label: "Accueil", href: "#home" },
    { label: "Fonctionnalités", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Témoignages", href: "#testimonials" },
    { label: "Contact", href: "#contact" }
  ];

  const legalLinks = [
    { label: "Mentions légales", href: "#legal" },
    { label: "Politique de confidentialité", href: "#privacy" },
    { label: "Cookies", href: "#cookies" }
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
    <div className="page-container bg-black text-white relative">
      <div className="page-content w-full">
      {/* Background Image with transparency effect - covers entire page including CTA */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-40 z-0"
        style={{
          backgroundImage: 'url(/images/gym-full-page.jpg)',
          backgroundPosition: 'center center',
          backgroundSize: 'cover'
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50 z-0" />
      
      {/* Header avec effets de scroll */}
      <CoachesHeader onBack={goBack} />
      
      {/* Hero Section */}
      <div className="relative pt-[100px] z-10">
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bebas bg-gradient-to-r from-white to-[#fa7315] bg-clip-text text-transparent tracking-wider">
              NOS COACHS
            </h1>
            
            <div className="w-20"></div> {/* Spacer pour centrer le titre */}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un coach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fa7315] focus:ring-2 focus:ring-[#fa7315]/20 transition-all duration-300"
              />
            </div>
            
            <div className="relative w-full max-w-xs">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedSpeciality}
                onChange={(e) => setSelectedSpeciality(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#fa7315] focus:ring-2 focus:ring-[#fa7315]/20 transition-all duration-300 appearance-none cursor-pointer"
              >
                {specialities.map((spec) => (
                  <option key={spec} value={spec} className="bg-gray-900">
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

          {/* Stats */}
          <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center group cursor-pointer">
                  <ElectricBorder
                    color="#fa7315"
                    speed={1}
                    chaos={0.5}
                    thickness={2}
                    style={{ borderRadius: 16 }}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    isActive={hoveredCard === 'stats-1'}
                  >
                    <div
                      className="p-4 bg-gradient-to-br from-gray-900/80 via-black/80 to-gray-800/80 rounded-2xl h-full flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 group-hover:border-[#fa7315]/30 transition-all duration-500"
                      onMouseEnter={() => setHoveredCard('stats-1')}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="text-4xl font-bebas text-white mb-2 group-hover:text-[#fa7315] transition-colors duration-500 drop-shadow-lg">
                        {stats.totalCoaches}
                      </div>
                      <div className="text-gray-200 text-base font-semibold group-hover:text-white transition-colors duration-500">
                        Coachs certifiés
                      </div>
                    </div>
                  </ElectricBorder>
                </div>

                <div className="text-center group cursor-pointer">
                  <ElectricBorder
                    color="#fa7315"
                    speed={1}
                    chaos={0.5}
                    thickness={2}
                    style={{ borderRadius: 16 }}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    isActive={hoveredCard === 'stats-2'}
                  >
                    <div
                      className="p-4 bg-gradient-to-br from-gray-900/80 via-black/80 to-gray-800/80 rounded-2xl h-full flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 group-hover:border-[#fa7315]/30 transition-all duration-500"
                      onMouseEnter={() => setHoveredCard('stats-2')}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="text-4xl font-bebas text-white mb-2 group-hover:text-[#fa7315] transition-colors duration-500 drop-shadow-lg">
                        {stats.totalClients}+
                      </div>
                      <div className="text-gray-200 text-base font-semibold group-hover:text-white transition-colors duration-500">
                        Clients accompagnés
                      </div>
                    </div>
                  </ElectricBorder>
                </div>

                <div className="text-center group cursor-pointer">
                  <ElectricBorder
                    color="#fa7315"
                    speed={1}
                    chaos={0.5}
                    thickness={2}
                    style={{ borderRadius: 16 }}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    isActive={hoveredCard === 'stats-3'}
                  >
                    <div
                      className="p-4 bg-gradient-to-br from-gray-900/80 via-black/80 to-gray-800/80 rounded-2xl h-full flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 group-hover:border-[#fa7315]/30 transition-all duration-500"
                      onMouseEnter={() => setHoveredCard('stats-3')}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="text-4xl font-bebas text-white mb-2 group-hover:text-[#fa7315] transition-colors duration-500 drop-shadow-lg">
                        {stats.averageRating}/5
                      </div>
                      <div className="text-gray-200 text-base font-semibold group-hover:text-white transition-colors duration-500">
                        Note moyenne
                      </div>
                    </div>
                  </ElectricBorder>
                </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-[#fa7315] animate-spin mb-4" />
                <h3 className="text-2xl font-bebas text-white mb-2">Chargement des coachs...</h3>
                <p className="text-gray-400">Récupération des données depuis la base</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bebas text-red-400 mb-2">Erreur de chargement</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <Button 
                  onClick={loadCoaches}
                  className="bg-[#fa7315] hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          )}

          {/* Coaches Grid */}
          {!loading && !error && (
            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="group relative"
                    onMouseEnter={() => setHoveredCard(coach.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <ElectricBorder
                      color="#fa7315"
                      speed={1}
                      chaos={0.5}
                      thickness={2}
                      style={{ borderRadius: 16 }}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      isActive={hoveredCard === coach.id}
                    >
                      <div className="p-4 flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl h-full">
                        {/* Photo */}
                        <div className="relative mb-3 flex-shrink-0">
                          <img
                            src={coach.avatar_url || `https://ui-avatars.com/api/?name=${coach.full_name}&background=fa7315&color=fff&size=200`}
                            alt={coach.full_name}
                            className="w-full h-40 object-cover rounded-xl transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${coach.full_name}&background=fa7315&color=fff&size=200`;
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-white text-xs font-semibold">{coach.rating?.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2 flex-1 flex flex-col min-h-0">
                          <h3 className="text-lg font-bebas text-white leading-tight">
                            {coach.full_name}
                          </h3>

                          <div className="flex items-center gap-2 text-orange-100">
                            <Trophy className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs font-semibold truncate">
                              {coach.specialities?.join(', ') || 'Coaching général'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-orange-100">
                            <Users className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs">{coach.client_count || 0} clients</span>
                          </div>

                          <div className="flex items-center gap-2 text-orange-100">
                            <Trophy className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs">{coach.experience_years || 1} ans d'expérience</span>
                          </div>

                          {coach.bio && (
                            <p className="text-orange-100 text-xs leading-relaxed flex-1 overflow-hidden">
                              <span className="line-clamp-3">{coach.bio}</span>
                            </p>
                          )}

                          <div className="pt-2 border-t border-orange-300/30 mt-auto">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-orange-100">
                                {coach.client_count || 0} clients
                              </span>
                              <span className="text-orange-100">
                                {coach.experience_years || 1} ans exp.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ElectricBorder>
                  </div>
                ))}
              </div>

              {filteredCoaches.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bebas text-gray-400 mb-2">Aucun coach trouvé</h3>
                  <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </div>
          )}

      {/* CTA Section - With background image */}
      <section className="relative w-full py-16 overflow-hidden mt-16">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#fa7315]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#fa7315]/5 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Main Content */}
          <div className="text-center mb-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#fa7315]/10 border border-[#fa7315]/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <ZapIcon className="w-4 h-4 text-[#fa7315]" />
              <span className="text-white font-semibold text-xs tracking-wider">PRÊT À COMMENCER ?</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bebas mb-4 bg-gradient-to-r from-white to-[#fa7315] bg-clip-text text-transparent tracking-wider leading-tight">
              REJOIGNEZ LA RÉVOLUTION
            </h2>

            {/* Subtitle */}
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Plus de 1000 coachs nous font déjà confiance. 
              Votre tour de transformer votre passion en business florissant.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircleIcon className="w-5 h-5 text-[#fa7315]" />
                <span className="text-base font-semibold">1000+ Coachs</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <StarIcon className="w-5 h-5 text-[#fa7315]" />
                <span className="text-base font-semibold">4.9/5 Note</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <ZapIcon className="w-5 h-5 text-[#fa7315]" />
                <span className="text-base font-semibold">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary Button */}
            <Button 
              onClick={scrollToPricing}
              className="group relative overflow-hidden bg-gradient-to-r from-[#fa7315] via-orange-500 to-[#fa7315] text-white px-12 py-5 rounded-2xl font-bebas text-xl tracking-wider shadow-2xl shadow-[#fa7315]/40 hover:shadow-[#fa7315]/60 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-0"
            >
              {/* Floating particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-2 left-4 w-2 h-2 bg-white/50 rounded-full animate-ping"></div>
                <div className="absolute top-4 right-6 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute bottom-3 left-8 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
              </div>
              
              {/* Content */}
              <span className="relative z-10 flex items-center gap-3">
                <span className="group-hover:tracking-widest transition-all duration-300">COMMENCER MAINTENANT</span>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                </div>
              </span>
            </Button>

            {/* Secondary Button */}
            <Button 
              onClick={scrollToPricing}
              variant="outline"
              className="group relative overflow-hidden border-2 border-white/30 bg-white/5 backdrop-blur-lg text-white hover:bg-white/15 hover:border-white/50 px-10 py-5 rounded-2xl font-bebas text-xl tracking-wider transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/20"
            >
              {/* Floating particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-2 left-4 w-2 h-2 bg-white/50 rounded-full animate-ping"></div>
                <div className="absolute top-4 right-6 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute bottom-3 left-8 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
              </div>
              
              {/* Content */}
              <span className="relative z-10 flex items-center gap-3">
                <span className="group-hover:tracking-widest transition-all duration-300">VOIR LA DÉMO</span>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 group-hover:rotate-12 transition-all duration-300">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </span>
            </Button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative w-full bg-gradient-to-br from-[#000c22] via-[#001122] to-[#000816] overflow-hidden mt-16">

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
                    <a
                      href={link.href}
                      className="font-body text-[#ffffffb2] hover:text-orange-light transition-colors duration-300 hover:translate-x-1 transform inline-block"
                    >
                      {link.label}
                    </a>
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
      </div>
    </div>
  );
};
