import { toast } from '@/hooks/use-toast'

export interface ErrorHandlerOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  logError?: boolean
}

export class ErrorHandler {
  static handle(
    error: any, 
    options: ErrorHandlerOptions = {}
  ) {
    const {
      title = "Erreur",
      description = "Une erreur inattendue s'est produite",
      variant = "destructive",
      logError = true
    } = options

    if (logError) {
      console.error('Error handled by ErrorHandler:', error)
    }

    // Afficher le toast d'erreur
    toast({
      title,
      description: description || this.getErrorMessage(error),
      variant
    })
  }

  static getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error
    }
    
    if (error?.message) {
      return error.message
    }
    
    if (error?.error_description) {
      return error.error_description
    }
    
    if (error?.details) {
      return error.details
    }
    
    return "Une erreur inattendue s'est produite"
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      this.handle(error, options)
      return null
    }
  }

  static async withErrorHandlingAndFallback<T>(
    operation: () => Promise<T>,
    fallback: T,
    options: ErrorHandlerOptions = {}
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      this.handle(error, options)
      return fallback
    }
  }
}

export default ErrorHandler
