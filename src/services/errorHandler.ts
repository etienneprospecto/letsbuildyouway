import { toast } from '@/hooks/use-toast'

export interface ErrorHandlerOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  logError?: boolean
  showToast?: boolean
}

export interface ApiError {
  code: string
  message: string
  status?: number
  details?: any
}

export class ApiError extends Error {
  constructor(
    message: string, 
    public code: string, 
    public status: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
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
      logError = true,
      showToast = true
    } = options

    if (logError) {
      console.error('Error handled by ErrorHandler:', error)
    }

    // Afficher le toast d'erreur seulement si demandé
    if (showToast) {
      toast({
        title,
        description: description || this.getErrorMessage(error),
        variant
      })
    }
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

  static async withErrorHandlingAndThrow<T>(
    operation: () => Promise<T>,
    customMessage?: string
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      const message = customMessage || this.getErrorMessage(error)
      throw new ApiError(message, 'OPERATION_FAILED', 500, error)
    }
  }

  // Méthodes spécialisées pour les erreurs Supabase
  static handleSupabaseError(error: any, context: string): never {
    console.error(`Supabase error in ${context}:`, error)
    
    let message = "Une erreur de base de données s'est produite"
    let code = "DATABASE_ERROR"
    
    if (error?.code) {
      switch (error.code) {
        case 'PGRST116':
          message = "Aucun résultat trouvé"
          code = "NOT_FOUND"
          break
        case '23505':
          message = "Cette donnée existe déjà"
          code = "DUPLICATE_ENTRY"
          break
        case '23503':
          message = "Référence invalide"
          code = "FOREIGN_KEY_VIOLATION"
          break
        case '42501':
          message = "Accès non autorisé"
          code = "PERMISSION_DENIED"
          break
        default:
          message = error.message || message
      }
    }
    
    throw new ApiError(message, code, 400, error)
  }

  // Méthode pour les erreurs de validation
  static handleValidationError(field: string, value: any): never {
    const message = `Validation échouée pour le champ ${field}: ${value}`
    throw new ApiError(message, 'VALIDATION_ERROR', 400)
  }

  // Méthode pour les erreurs d'authentification
  static handleAuthError(error: any): never {
    console.error('Authentication error:', error)
    const message = "Erreur d'authentification"
    throw new ApiError(message, 'AUTH_ERROR', 401, error)
  }

  handleError(error: any, message?: string): never {

    if (message) {
      throw new ApiError(message, 'SERVICE_ERROR', 500, error);
    }
    throw error;
  }
}

// Instance pour l'export nommé
export const errorHandler = new ErrorHandler();

export default ErrorHandler
