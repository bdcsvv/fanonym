// app/lib/errorHandler.ts

export interface AppError {
  code: string
  message: string
  userMessage: string
  shouldLog: boolean
  shouldNotify: boolean
}

// Error codes mapping
export const ERROR_CODES = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'auth/invalid-credentials',
  AUTH_USER_NOT_FOUND: 'auth/user-not-found',
  AUTH_EMAIL_EXISTS: 'auth/email-exists',
  AUTH_WEAK_PASSWORD: 'auth/weak-password',
  AUTH_SESSION_EXPIRED: 'auth/session-expired',
  
  // Database errors
  DB_CONNECTION_FAILED: 'db/connection-failed',
  DB_QUERY_FAILED: 'db/query-failed',
  DB_DUPLICATE_ENTRY: 'db/duplicate-entry',
  DB_NOT_FOUND: 'db/not-found',
  DB_PERMISSION_DENIED: 'db/permission-denied',
  
  // Payment errors
  PAYMENT_INSUFFICIENT_CREDITS: 'payment/insufficient-credits',
  PAYMENT_INVALID_AMOUNT: 'payment/invalid-amount',
  PAYMENT_ALREADY_PROCESSED: 'payment/already-processed',
  PAYMENT_TOPUP_FAILED: 'payment/topup-failed',
  PAYMENT_WITHDRAW_FAILED: 'payment/withdraw-failed',
  
  // Upload errors
  UPLOAD_FILE_TOO_LARGE: 'upload/file-too-large',
  UPLOAD_INVALID_TYPE: 'upload/invalid-type',
  UPLOAD_FAILED: 'upload/failed',
  
  // Chat errors
  CHAT_SESSION_NOT_FOUND: 'chat/session-not-found',
  CHAT_SESSION_EXPIRED: 'chat/session-expired',
  CHAT_UNAUTHORIZED: 'chat/unauthorized',
  CHAT_ALREADY_ACCEPTED: 'chat/already-accepted',
  CHAT_CREATOR_BLOCKED: 'chat/creator-blocked',
  
  // Validation errors
  VALIDATION_REQUIRED_FIELD: 'validation/required-field',
  VALIDATION_INVALID_FORMAT: 'validation/invalid-format',
  VALIDATION_MIN_LENGTH: 'validation/min-length',
  VALIDATION_MAX_LENGTH: 'validation/max-length',
  
  // Network errors
  NETWORK_TIMEOUT: 'network/timeout',
  NETWORK_OFFLINE: 'network/offline',
  NETWORK_UNKNOWN: 'network/unknown',
  
  // Generic
  UNKNOWN_ERROR: 'unknown/error'
}

// User-friendly error messages
const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Email atau password salah',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'User tidak ditemukan',
  [ERROR_CODES.AUTH_EMAIL_EXISTS]: 'Email sudah terdaftar',
  [ERROR_CODES.AUTH_WEAK_PASSWORD]: 'Password terlalu lemah. Min 6 karakter.',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Sesi kamu expired. Silakan login lagi.',
  
  // Database
  [ERROR_CODES.DB_CONNECTION_FAILED]: 'Gagal terhubung ke server',
  [ERROR_CODES.DB_QUERY_FAILED]: 'Terjadi kesalahan saat memproses data',
  [ERROR_CODES.DB_DUPLICATE_ENTRY]: 'Data sudah ada',
  [ERROR_CODES.DB_NOT_FOUND]: 'Data tidak ditemukan',
  [ERROR_CODES.DB_PERMISSION_DENIED]: 'Kamu tidak punya akses',
  
  // Payment
  [ERROR_CODES.PAYMENT_INSUFFICIENT_CREDITS]: 'Kredit tidak cukup. Silakan top up.',
  [ERROR_CODES.PAYMENT_INVALID_AMOUNT]: 'Jumlah tidak valid',
  [ERROR_CODES.PAYMENT_ALREADY_PROCESSED]: 'Pembayaran sudah diproses',
  [ERROR_CODES.PAYMENT_TOPUP_FAILED]: 'Top up gagal. Coba lagi.',
  [ERROR_CODES.PAYMENT_WITHDRAW_FAILED]: 'Withdraw gagal. Coba lagi.',
  
  // Upload
  [ERROR_CODES.UPLOAD_FILE_TOO_LARGE]: 'File terlalu besar. Max 5MB.',
  [ERROR_CODES.UPLOAD_INVALID_TYPE]: 'Tipe file tidak didukung',
  [ERROR_CODES.UPLOAD_FAILED]: 'Upload gagal. Coba lagi.',
  
  // Chat
  [ERROR_CODES.CHAT_SESSION_NOT_FOUND]: 'Chat tidak ditemukan',
  [ERROR_CODES.CHAT_SESSION_EXPIRED]: 'Chat sudah expired',
  [ERROR_CODES.CHAT_UNAUTHORIZED]: 'Kamu tidak punya akses ke chat ini',
  [ERROR_CODES.CHAT_ALREADY_ACCEPTED]: 'Chat sudah di-accept',
  [ERROR_CODES.CHAT_CREATOR_BLOCKED]: 'Creator ini sudah kamu block',
  
  // Validation
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'Field ini wajib diisi',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Format tidak valid',
  [ERROR_CODES.VALIDATION_MIN_LENGTH]: 'Terlalu pendek',
  [ERROR_CODES.VALIDATION_MAX_LENGTH]: 'Terlalu panjang',
  
  // Network
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Koneksi timeout. Cek internet kamu.',
  [ERROR_CODES.NETWORK_OFFLINE]: 'Kamu offline. Cek koneksi internet.',
  [ERROR_CODES.NETWORK_UNKNOWN]: 'Terjadi kesalahan jaringan',
  
  // Generic
  [ERROR_CODES.UNKNOWN_ERROR]: 'Terjadi kesalahan. Coba lagi.'
}

/**
 * Handle errors consistently across the app
 */
export function handleError(error: any): AppError {
  console.error('App Error:', error)
  
  // Supabase auth errors
  if (error?.message?.includes('Invalid login credentials')) {
    return {
      code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      message: error.message,
      userMessage: ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS],
      shouldLog: false,
      shouldNotify: true
    }
  }
  
  if (error?.message?.includes('User already registered')) {
    return {
      code: ERROR_CODES.AUTH_EMAIL_EXISTS,
      message: error.message,
      userMessage: ERROR_MESSAGES[ERROR_CODES.AUTH_EMAIL_EXISTS],
      shouldLog: false,
      shouldNotify: true
    }
  }
  
  if (error?.code === 'PGRST116') {
    return {
      code: ERROR_CODES.DB_NOT_FOUND,
      message: error.message,
      userMessage: ERROR_MESSAGES[ERROR_CODES.DB_NOT_FOUND],
      shouldLog: false,
      shouldNotify: true
    }
  }
  
  if (error?.code === '23505') { // Postgres duplicate key
    return {
      code: ERROR_CODES.DB_DUPLICATE_ENTRY,
      message: error.message,
      userMessage: ERROR_MESSAGES[ERROR_CODES.DB_DUPLICATE_ENTRY],
      shouldLog: false,
      shouldNotify: true
    }
  }
  
  if (error?.message?.includes('JWT expired')) {
    return {
      code: ERROR_CODES.AUTH_SESSION_EXPIRED,
      message: error.message,
      userMessage: ERROR_MESSAGES[ERROR_CODES.AUTH_SESSION_EXPIRED],
      shouldLog: false,
      shouldNotify: true
    }
  }
  
  // Network errors
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
    return {
      code: ERROR_CODES.NETWORK_OFFLINE,
      message: error.message,
      userMessage: ERROR_MESSAGES[ERROR_CODES.NETWORK_OFFLINE],
      shouldLog: true,
      shouldNotify: true
    }
  }
  
  // File upload errors
  if (error?.message?.includes('payload too large')) {
    return {
      code: ERROR_CODES.UPLOAD_FILE_TOO_LARGE,
      message: error.message,
      userMessage: ERROR_MESSAGES[ERROR_CODES.UPLOAD_FILE_TOO_LARGE],
      shouldLog: false,
      shouldNotify: true
    }
  }
  
  // Default unknown error
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: error?.message || 'Unknown error',
    userMessage: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    shouldLog: true,
    shouldNotify: true
  }
}

/**
 * Log error to console/service
 */
export function logError(error: AppError, context?: any) {
  if (!error.shouldLog) return
  
  console.error({
    timestamp: new Date().toISOString(),
    code: error.code,
    message: error.message,
    context
  })
  
  // TODO: Send to error tracking service (Sentry, LogRocket, etc)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorService(error, context)
  // }
}

/**
 * Custom error class for app-specific errors
 */
export class AppErrorClass extends Error {
  code: string
  userMessage: string
  
  constructor(code: string, message?: string) {
    super(message || ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR])
    this.name = 'AppError'
    this.code = code
    this.userMessage = ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
  }
}

/**
 * Retry utility for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry on validation/auth errors
      const appError = handleError(error)
      if (
        appError.code.startsWith('auth/') || 
        appError.code.startsWith('validation/')
      ) {
        throw error
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
      }
    }
  }
  
  throw lastError
}
