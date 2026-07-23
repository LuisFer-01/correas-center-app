import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Info } from 'lucide-react'

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url'
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  error?: string
  helpText?: string
  disabled?: boolean
  required?: boolean
  multiline?: boolean
  rows?: number
  className?: string
  inputClassName?: string
  id?: string
  autoComplete?: string
  min?: number | string
  max?: number | string
  step?: number | string
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helpText,
  disabled = false,
  required = false,
  multiline = false,
  rows = 4,
  className = '',
  inputClassName = '',
  id,
  autoComplete,
  min,
  max,
  step,
}: FormFieldProps) {
  const fieldId = id || `field-${name}`
  const hasError = Boolean(error)

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <Label
        htmlFor={fieldId}
        className={`flex items-center gap-1 text-sm font-medium ${
          hasError ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'
        }`}
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Input o Textarea */}
      {multiline ? (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          autoComplete={autoComplete}
          className={`w-full px-3 py-2 rounded-lg border text-sm transition-all outline-none resize-none
            ${hasError
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
              : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
            }
            focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20
            disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800
            text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${inputClassName}
          `}
        />
      ) : (
        <Input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
          className={`text-sm
            ${hasError
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
              : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
            }
            focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20
            disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800
            text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${inputClassName}
          `}
        />
      )}

      {/* Mensaje de error o texto de ayuda */}
      {hasError ? (
        <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : helpText ? (
        <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Info size={12} />
          {helpText}
        </p>
      ) : null}
    </div>
  )
}