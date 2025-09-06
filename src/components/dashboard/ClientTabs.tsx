import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, TrendingUp, Calendar, BookOpen } from 'lucide-react'

interface ClientTabsProps {
  children: {
    infosPersonnelles: React.ReactNode
    progression: React.ReactNode
    seances: React.ReactNode
    ressources: React.ReactNode
  }
}

const ClientTabs: React.FC<ClientTabsProps> = ({ children }) => {
  const tabs = [
    {
      value: 'infos',
      label: 'Infos Personnelles',
      icon: User,
      content: children.infosPersonnelles
    },
    {
      value: 'progression',
      label: 'Progression',
      icon: TrendingUp,
      content: children.progression
    },
    {
      value: 'seances',
      label: 'Séances & Programmations',
      icon: Calendar,
      content: children.seances
    },
    {
      value: 'ressources',
      label: 'Ressources Personnalisées',
      icon: BookOpen,
      content: children.ressources
    }
  ]

  const [activeTab, setActiveTab] = useState<string>('infos')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-lg shadow-sm border"
    >
      {/* Navigation des onglets (boutons contrôlés) */}
      <div className="grid w-full grid-cols-4 h-auto p-1 bg-gray-50 rounded-t-lg">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex flex-col items-center space-y-1 p-3 text-xs font-medium rounded-md transition-all duration-200 ${
              activeTab === tab.value ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:bg-white/60'
            }`}
            aria-pressed={activeTab === tab.value}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:block text-center leading-tight">
              {tab.label}
            </span>
            <span className="sm:hidden">
              {tab.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-0 space-y-6"
        >
          {tabs.find((t) => t.value === activeTab)?.content}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ClientTabs
