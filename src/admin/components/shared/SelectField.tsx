import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Info } from 'lucide-react'

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectFieldProps {
  label: string
  name: string
  value?: string
  onValueChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  helpText?: string
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
  emptyMessage?: string
}

export function SelectField({
  label,
  name,
  value,
  onValueChange,
  options,
  placeholder = 'Seleccionar...',
  error,
  helpText,
  disabled = false,
  required = false,
  className = '',
  id,
  emptyMessage = 'Sin opciones disponibles',
}: SelectFieldProps) {
  const fieldId = id || `select-${name}`
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

      {/* Select */}
      <Select
        name={name}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={fieldId}
          className={`w-full text-sm
            ${hasError
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
              : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
            }
            focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20
            disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800
            text-gray-900 dark:text-gray-100
          `}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className="bg-white bg-gray-800 border-gray-200 dark:border-gray-600"
          position="popper"
        >
          {options.length > 0 ? (
            options.map((option) => (
              <SelectItem
                key={option.value}
                value={String(option.value)}
                disabled={option.disabled}
                className="text-gray-900 dark:text-gray-100 focus:bg-[#EA0A2A]/10 dark:focus:bg-[#EA0A2A]/20 cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {emptyMessage}
            </div>
          )}
        </SelectContent>
      </Select>

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