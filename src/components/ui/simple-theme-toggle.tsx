import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSimpleTheme } from '@/hooks/useSimpleTheme'

interface SimpleThemeToggleProps {
  className?: string
}

export const SimpleThemeToggle: React.FC<SimpleThemeToggleProps> = ({ className }) => {
  const { isDark, toggleMode, isLoading } = useSimpleTheme()

  if (isLoading) {
    return (
      <Button variant="outline" size="icon" disabled className={`${className} border-gray-300 text-gray-700 bg-white dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800`}>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleMode}
      className={`${className} border-gray-300 text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-orange-900/20 dark:hover:border-orange-600 dark:hover:text-orange-300`}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}

export default SimpleThemeToggle