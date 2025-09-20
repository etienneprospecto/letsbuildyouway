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
      <Button variant="outline" size="icon" disabled className={className}>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleMode}
      className={className}
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