import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

interface CheckboxFieldProps {
  label: string
  name: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  error?: string
  helpText?: string
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
  description?: string
}

export function CheckboxField({
  label,
  name,
  checked,
  onCheckedChange,
  error,
  helpText,
  disabled = false,
  required = false,
  className = '',
  id,
  description,
}: CheckboxFieldProps) {
  const fieldId = id || `checkbox-${name}`
  const hasError = Boolean(error)

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox
          id={fieldId}
          name={name}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={`mt-0.5 data-[state=checked]:bg-[#EA0A2A] data-[state=checked]:border-[#EA0A2A]
            ${hasError ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}
          `}
        />

        {/* Label y descripción */}
        <div className="space-y-1">
          <Label
            htmlFor={fieldId}
            className={`text-sm font-medium cursor-pointer select-none
              ${hasError ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Mensaje de error o texto de ayuda */}
      {hasError ? (
        <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 ml-8">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : helpText ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
          {helpText}
        </p>
      ) : null}
    </div>
  )
}