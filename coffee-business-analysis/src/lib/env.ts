/**
 * ENVIRONMENT VARIABLES VALIDATION
 * 
 * src/lib/env.ts
 * Validate required environment variables
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const

const optionalEnvVars = [
  'NODE_ENV',
] as const

type RequiredEnvVar = typeof requiredEnvVars[number]
type OptionalEnvVar = typeof optionalEnvVars[number]

/**
 * Validate that all required environment variables are set
 */
export function validateEnv() {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\nPlease add them to your .env file`
    )
  }

  // Validate NEXTAUTH_SECRET length
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn('⚠️  NEXTAUTH_SECRET should be at least 32 characters long')
  }

  // Validate database URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.warn('⚠️  DATABASE_URL should start with postgresql://')
  }

  console.log('✅ Environment variables validated')
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: RequiredEnvVar): string
export function getEnv(key: OptionalEnvVar): string | undefined
export function getEnv(key: string): string | undefined {
  return process.env[key]
}

/**
 * Check if running in production
 */
export const isProd = process.env.NODE_ENV === 'production'

/**
 * Check if running in development
 */
export const isDev = process.env.NODE_ENV === 'development'

/**
 * Check if running in test
 */
export const isTest = process.env.NODE_ENV === 'test'

// Run validation on import
if (typeof window === 'undefined') {
  validateEnv()
}