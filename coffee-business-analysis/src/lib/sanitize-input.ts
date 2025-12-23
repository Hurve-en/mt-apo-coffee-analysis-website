/**
 * INPUT SANITIZATION UTILITY
 * 
 * src/lib/sanitize-input.ts
 * Clean and validate user input
 */

/**
 * Remove HTML tags and dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w.@+-]/g, '') // Only allow valid email characters
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''
  
  return phone
    .replace(/[^\d+\-() ]/g, '') // Only allow numbers and phone characters
    .trim()
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number): number {
  const num = typeof input === 'string' ? parseFloat(input) : input
  return isNaN(num) ? 0 : num
}

/**
 * Sanitize object (recursively clean all string values)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }
  
  for (const key in sanitized) {
    const value = sanitized[key]
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value) as any
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item: any) => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' ? sanitizeObject(item) : 
        item
      ) as any
    }
  }
  
  return sanitized
}

/**
 * Validate and sanitize common inputs
 */
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^[\d+\-() ]{7,20}$/
    return phoneRegex.test(phone)
  },
  
  url: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
  
  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain a lowercase letter')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain an uppercase letter')
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain a number')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * SQL Injection prevention (Prisma handles this, but extra layer)
 */
export function preventSqlInjection(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove dangerous SQL characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .trim()
}