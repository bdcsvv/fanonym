// app/lib/validation.ts

import { ERROR_CODES, AppErrorClass } from './errorHandler'

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * File validation constants
 */
export const FILE_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  DOCUMENT_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  
  AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  COVER_MAX_SIZE: 5 * 1024 * 1024, // 5MB
}

/**
 * Text validation
 */
export const textValidation = {
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username harus 3-30 karakter, hanya huruf, angka, dan underscore'
  },
  
  fullName: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Nama lengkap harus 2-100 karakter, hanya huruf dan spasi'
  },
  
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email tidak valid'
  },
  
  password: {
    minLength: 6,
    maxLength: 100,
    message: 'Password minimal 6 karakter'
  },
  
  phoneNumber: {
    pattern: /^(\+62|62|0)[0-9]{9,12}$/,
    message: 'Nomor telepon tidak valid (contoh: 081234567890)'
  },
  
  accountNumber: {
    pattern: /^[0-9]{10,20}$/,
    message: 'Nomor rekening harus 10-20 digit'
  }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  
  return input.replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Sanitize text input (remove dangerous characters)
 */
export function sanitizeText(input: string): string {
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  // Remove control characters except newlines/tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  return sanitized
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationResult {
  const errors: Record<string, string> = {}
  const sanitized = sanitizeText(username)
  
  if (!sanitized) {
    errors.username = 'Username wajib diisi'
    return { isValid: false, errors }
  }
  
  if (sanitized.length < textValidation.username.minLength) {
    errors.username = `Username minimal ${textValidation.username.minLength} karakter`
    return { isValid: false, errors }
  }
  
  if (sanitized.length > textValidation.username.maxLength) {
    errors.username = `Username maksimal ${textValidation.username.maxLength} karakter`
    return { isValid: false, errors }
  }
  
  if (!textValidation.username.pattern.test(sanitized)) {
    errors.username = textValidation.username.message
    return { isValid: false, errors }
  }
  
  return { isValid: true, errors: {} }
}

/**
 * Validate email
 */
export function validateEmail(email: string): ValidationResult {
  const errors: Record<string, string> = {}
  const sanitized = sanitizeText(email).toLowerCase()
  
  if (!sanitized) {
    errors.email = 'Email wajib diisi'
    return { isValid: false, errors }
  }
  
  if (!textValidation.email.pattern.test(sanitized)) {
    errors.email = textValidation.email.message
    return { isValid: false, errors }
  }
  
  return { isValid: true, errors: {} }
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  const errors: Record<string, string> = {}
  
  if (!password) {
    errors.password = 'Password wajib diisi'
    return { isValid: false, errors }
  }
  
  if (password.length < textValidation.password.minLength) {
    errors.password = textValidation.password.message
    return { isValid: false, errors }
  }
  
  if (password.length > textValidation.password.maxLength) {
    errors.password = 'Password terlalu panjang'
    return { isValid: false, errors }
  }
  
  return { isValid: true, errors: {} }
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const errors: Record<string, string> = {}
  const sanitized = sanitizeText(phone).replace(/\s/g, '')
  
  if (!sanitized) {
    errors.phone = 'Nomor telepon wajib diisi'
    return { isValid: false, errors }
  }
  
  if (!textValidation.phoneNumber.pattern.test(sanitized)) {
    errors.phone = textValidation.phoneNumber.message
    return { isValid: false, errors }
  }
  
  return { isValid: true, errors: {} }
}

/**
 * Validate account number
 */
export function validateAccountNumber(accountNumber: string): ValidationResult {
  const errors: Record<string, string> = {}
  const sanitized = sanitizeText(accountNumber).replace(/\s/g, '')
  
  if (!sanitized) {
    errors.accountNumber = 'Nomor rekening wajib diisi'
    return { isValid: false, errors }
  }
  
  if (!textValidation.accountNumber.pattern.test(sanitized)) {
    errors.accountNumber = textValidation.accountNumber.message
    return { isValid: false, errors }
  }
  
  return { isValid: true, errors: {} }
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: string[]
    fieldName?: string
  } = {}
): ValidationResult {
  const errors: Record<string, string> = {}
  const fieldName = options.fieldName || 'file'
  
  if (!file) {
    errors[fieldName] = 'File wajib dipilih'
    return { isValid: false, errors }
  }
  
  // Check file size
  const maxSize = options.maxSize || FILE_LIMITS.IMAGE_MAX_SIZE
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    errors[fieldName] = `Ukuran file maksimal ${maxSizeMB}MB`
    return { isValid: false, errors }
  }
  
  // Check file type
  const allowedTypes = options.allowedTypes || FILE_LIMITS.IMAGE_TYPES
  if (!allowedTypes.includes(file.type)) {
    errors[fieldName] = 'Tipe file tidak didukung'
    return { isValid: false, errors }
  }
  
  return { isValid: true, errors: {} }
}

/**
 * Validate image file specifically
 */
export function validateImage(file: File, type: 'avatar' | 'cover' | 'message' = 'message'): ValidationResult {
  const maxSizes = {
    avatar: FILE_LIMITS.AVATAR_MAX_SIZE,
    cover: FILE_LIMITS.COVER_MAX_SIZE,
    message: FILE_LIMITS.IMAGE_MAX_SIZE
  }
  
  return validateFile(file, {
    maxSize: maxSizes[type],
    allowedTypes: FILE_LIMITS.IMAGE_TYPES,
    fieldName: 'image'
  })
}

/**
 * Validate document file (KTP, etc)
 */
export function validateDocument(file: File): ValidationResult {
  return validateFile(file, {
    maxSize: FILE_LIMITS.DOCUMENT_MAX_SIZE,
    allowedTypes: FILE_LIMITS.DOCUMENT_TYPES,
    fieldName: 'document'
  })
}

/**
 * Validate credits amount
 */
export function validateCredits(amount: number): ValidationResult {
  const errors: Record<string, string> = {}
  
  if (!amount || amount <= 0) {
    errors.credits = 'Jumlah kredit harus lebih dari 0'
    return { isValid: false, errors }
  }
  
  if (amount > 1000) {
    errors.credits = 'Jumlah kredit maksimal 1000'
    return { isValid: false, errors }
  }
  
  if (!Number.isInteger(amount)) {
    errors.credits = 'Jumlah kredit harus bilangan bulat'
    return { isValid: false, errors }
  }
  
  return { isValid: true, errors: {} }
}

/**
 * Validate rupiah amount
 */
export function validateRupiah(amount: number): ValidationResult {
  const errors: Record<string, string> = {}
  
  if (!amount || amount <= 0) {
    errors.amount = 'Jumlah harus lebih dari 0'
    return { isValid: false, errors }
  }
  
  if (amount > 100000000) { // 100 juta
    errors.amount = 'Jumlah terlalu besar'
    return { isValid: false, errors }
  }
  
  return { isValid: true, errors: {} }
}

/**
 * Validate message text
 */
export function validateMessage(message: string): ValidationResult {
  const errors: Record<string, string> = {}
  const sanitized = sanitizeText(message)
  
  if (!sanitized) {
    errors.message = 'Pesan tidak boleh kosong'
    return { isValid: false, errors }
  }
  
  if (sanitized.length > 5000) {
    errors.message = 'Pesan terlalu panjang (max 5000 karakter)'
    return { isValid: false, errors }
  }
  
  return { isValid: true, errors: {} }
}

/**
 * Comprehensive form validator
 */
export function validateForm(data: Record<string, any>, rules: Record<string, any>): ValidationResult {
  const allErrors: Record<string, string> = {}
  
  for (const field in rules) {
    const rule = rules[field]
    const value = data[field]
    
    // Required check
    if (rule.required && !value) {
      allErrors[field] = `${rule.label || field} wajib diisi`
      continue
    }
    
    // Skip validation if optional and empty
    if (!rule.required && !value) continue
    
    // Type-specific validation
    if (rule.type === 'email') {
      const result = validateEmail(value)
      if (!result.isValid) Object.assign(allErrors, result.errors)
    }
    
    if (rule.type === 'username') {
      const result = validateUsername(value)
      if (!result.isValid) Object.assign(allErrors, result.errors)
    }
    
    if (rule.type === 'password') {
      const result = validatePassword(value)
      if (!result.isValid) Object.assign(allErrors, result.errors)
    }
    
    if (rule.type === 'phone') {
      const result = validatePhoneNumber(value)
      if (!result.isValid) Object.assign(allErrors, result.errors)
    }
    
    // Min/max length
    if (rule.minLength && value.length < rule.minLength) {
      allErrors[field] = `${rule.label || field} minimal ${rule.minLength} karakter`
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      allErrors[field] = `${rule.label || field} maksimal ${rule.maxLength} karakter`
    }
    
    // Custom pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      allErrors[field] = rule.message || `${rule.label || field} tidak valid`
    }
  }
  
  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: Record<string, string>): string {
  return Object.values(errors).join('. ')
}
