// app/components/FormInput.tsx
'use client'

import { useState } from 'react'

interface FormInputProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  maxLength?: number
  icon?: React.ReactNode
  helper?: string
}

export function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  maxLength,
  icon,
  helper
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const inputType = type === 'password' && showPassword ? 'text' : type
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-zinc-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            {icon}
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`
            w-full ${icon ? 'pl-12' : 'pl-4'} ${type === 'password' ? 'pr-12' : 'pr-4'} py-3
            bg-zinc-800/50 border rounded-xl text-white placeholder-zinc-500
            outline-none transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500 focus:border-red-400' 
              : isFocused 
                ? 'border-purple-500' 
                : 'border-zinc-700 hover:border-zinc-600'
            }
          `}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {helper && !error && (
        <p className="mt-1.5 text-xs text-zinc-500">{helper}</p>
      )}
      
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {maxLength && (
        <p className="mt-1 text-xs text-zinc-600 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  )
}

interface FormTextAreaProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  maxLength?: number
  helper?: string
}

export function FormTextArea({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  helper
}: FormTextAreaProps) {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-zinc-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3
          bg-zinc-800/50 border rounded-xl text-white placeholder-zinc-500
          outline-none transition-all resize-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-500 focus:border-red-400' 
            : isFocused 
              ? 'border-purple-500' 
              : 'border-zinc-700 hover:border-zinc-600'
          }
        `}
      />
      
      {helper && !error && (
        <p className="mt-1.5 text-xs text-zinc-500">{helper}</p>
      )}
      
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {maxLength && (
        <p className="mt-1 text-xs text-zinc-600 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  )
}

interface FormSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  disabled?: boolean
  helper?: string
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  helper
}: FormSelectProps) {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-zinc-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-10
            bg-zinc-800/50 border rounded-xl text-white
            outline-none transition-all appearance-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500 focus:border-red-400' 
              : isFocused 
                ? 'border-purple-500' 
                : 'border-zinc-700 hover:border-zinc-600'
            }
          `}
        >
          <option value="" disabled>Pilih {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {helper && !error && (
        <p className="mt-1.5 text-xs text-zinc-500">{helper}</p>
      )}
      
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

interface FormFileInputProps {
  label: string
  name: string
  onChange: (file: File | null) => void
  error?: string
  accept?: string
  required?: boolean
  disabled?: boolean
  helper?: string
  preview?: string
}

export function FormFileInput({
  label,
  name,
  onChange,
  error,
  accept = 'image/*',
  required = false,
  disabled = false,
  helper,
  preview
}: FormFileInputProps) {
  const [dragActive, setDragActive] = useState(false)
  
  const handleFile = (file: File | null) => {
    onChange(file)
  }
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center
          transition-all cursor-pointer
          ${error 
            ? 'border-red-500 bg-red-500/5' 
            : dragActive 
              ? 'border-purple-500 bg-purple-500/10' 
              : 'border-zinc-700 bg-zinc-800/20 hover:border-zinc-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        {preview ? (
          <div className="space-y-3">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
            <p className="text-sm text-zinc-400">Click atau drag untuk ganti</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="w-12 h-12 mx-auto text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-zinc-400">
              Click atau drag file ke sini
            </p>
            <p className="text-xs text-zinc-600">
              {accept === 'image/*' ? 'PNG, JPG, GIF hingga 5MB' : 'File dokumen'}
            </p>
          </div>
        )}
      </div>
      
      {helper && !error && (
        <p className="mt-1.5 text-xs text-zinc-500">{helper}</p>
      )}
      
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
