import { ErrorHandler } from './errorHandler'

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
  hasPrevious: boolean
}

export class PaginationService {
  static validatePaginationParams(params: PaginationParams): PaginationParams {
    const { page, limit, sortBy, sortOrder } = params
    
    // Validation des paramètres
    if (page < 1) {
      ErrorHandler.handleValidationError('page', page)
    }
    
    if (limit < 1 || limit > 100) {
      ErrorHandler.handleValidationError('limit', limit)
    }
    
    return {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'desc'
    }
  }

  static calculatePagination(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages
    const hasPrevious = page > 1
    
    return {
      total,
      page,
      limit,
      totalPages,
      hasMore,
      hasPrevious
    }
  }

  static getOffset(page: number, limit: number): number {
    return (page - 1) * limit
  }

  static createPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResult<T> {
    const pagination = this.calculatePagination(total, page, limit)
    
    return {
      data,
      ...pagination
    }
  }
}

export default PaginationService
