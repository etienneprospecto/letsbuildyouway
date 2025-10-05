/**
 * Service de logging optimisé pour la production
 * Remplace tous les console.log par un système de logging intelligent
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // En développement : tout logger
    if (this.isDevelopment) return true;
    
    // En production : seulement warn et error
    if (this.isProduction) {
      return level === 'warn' || level === 'error';
    }
    
    return true;
  }

  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, data, context);
    
    // En développement : utiliser console avec couleurs
    if (this.isDevelopment) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
      }[level];

      const color = {
        debug: 'color: #6B7280',
        info: 'color: #3B82F6',
        warn: 'color: #F59E0B',
        error: 'color: #EF4444'
      }[level];

      console.log(
        `%c${emoji} [${logEntry.timestamp}] ${context ? `[${context}] ` : ''}${message}`,
        color,
        data ? data : ''
      );
    } else {
      // En production : utiliser console standard ou envoyer à un service
      console[level](`[${logEntry.timestamp}] ${context ? `[${context}] ` : ''}${message}`, data || '');
    }
  }

  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context);
  }

  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }

  error(message: string, data?: any, context?: string): void {
    this.log('error', message, data, context);
  }

  // Méthode spéciale pour les erreurs d'authentification
  authError(message: string, error?: any): void {
    this.error(`[AUTH] ${message}`, error, 'AuthProvider');
  }

  // Méthode spéciale pour les requêtes Supabase
  supabaseQuery(operation: string, data?: any): void {
    this.debug(`[SUPABASE] ${operation}`, data, 'Supabase');
  }

  // Méthode spéciale pour les performances
  performance(operation: string, duration: number): void {
    this.info(`[PERF] ${operation} took ${duration}ms`, null, 'Performance');
  }
}

// Export d'une instance singleton
export const logger = new Logger();

// Export des types pour TypeScript
export type { LogLevel, LogEntry };
