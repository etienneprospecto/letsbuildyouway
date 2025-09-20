import React from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/services/themeService'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'default' | 'sidebar' | 'minimal'
  showLabel?: boolean
  className?: string
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'default', 
  showLabel = true,
  className 
}) => {
  const { theme, setTheme, isDark } = useTheme()

  const themes = [
    { value: 'light' as const, label: 'Clair', icon: Sun },
    { value: 'dark' as const, label: 'Sombre', icon: Moon },
    { value: 'system' as const, label: 'Système', icon: Monitor }
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]

  const handleThemeChange = () => {
    const currentIndex = themes.findIndex(t => t.value === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].value)
  }

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleThemeChange}
        className={cn(
          "h-8 w-8 relative overflow-hidden",
          className
        )}
        title={`Mode actuel: ${currentTheme.label}`}
      >
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          <currentTheme.icon className="h-4 w-4" />
        </motion.div>
      </Button>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn("p-2", className)}>
        <Button
          variant="ghost"
          onClick={handleThemeChange}
          className={cn(
            "w-full justify-start h-10 transition-all duration-200",
            "hover:bg-sidebar-hover hover:scale-[1.02]"
          )}
          title={`Mode actuel: ${currentTheme.label}`}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="mr-3"
          >
            <motion.div
              key={theme}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <currentTheme.icon className="h-5 w-5" />
            </motion.div>
          </motion.div>
          
          <div className="flex items-center justify-between flex-1 min-w-0">
            <span className="font-medium text-sm">
              Mode {isDark ? 'sombre' : 'clair'}
            </span>
            <span className="text-xs text-sidebar-text-muted">
              {currentTheme.label}
            </span>
          </div>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {showLabel && (
        <span className="text-sm font-medium">Thème:</span>
      )}
      
      <div className="flex bg-muted rounded-lg p-1">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isActive = theme === themeOption.value
          
          return (
            <Button
              key={themeOption.value}
              variant="ghost"
              size="sm"
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                "h-8 px-3 transition-all duration-200",
                isActive && "bg-background shadow-sm",
                !isActive && "hover:bg-background/50"
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              <span className="text-xs">{themeOption.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default ThemeToggle
