import { getSupabaseImageUrl } from '@/lib/supabase'
import { useEffect, useRef, useState } from 'react'

interface OptimizedImageProps {
  src: string | null
  alt: string
  bucket: string
  className?: string
  width?: number
  height?: number
  quality?: number
  placeholder?: React.ReactNode
  fallback?: React.ReactNode
  priority?: boolean
  objectFit?: 'cover' | 'contain' | 'fill'
}

export const OptimizedImage = ({
  src,
  alt,
  bucket,
  className = '',
  width,
  height,
  quality = 80,
  placeholder,
  fallback,
  priority = false,
  objectFit = 'cover',
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(!priority) // Si es priority, cargar inmediatamente
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '100px', // Cargar 100px antes de que sea visible
        threshold: 0.01,
      }
    )

    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [priority])

  // Generar URL optimizada con transformaciones de Supabase
  const getOptimizedUrl = () => {
    if (!src) return null
    
    // Si ya es una URL completa, retornarla
    if (src.startsWith('http')) {
      // Agregar parámetros de transformación si es URL de Supabase
      if (src.includes('supabase.co')) {
        const separator = src.includes('?') ? '&' : '?'
        return `${src}${separator}format=webp&quality=${quality}${width ? `&width=${width}` : ''}${height ? `&height=${height}` : ''}`
      }
      return src
    }

    // Usar helper de Supabase con transformaciones
    try {
      const { data } = (window as any).supabase?.storage
        .from(bucket)
        .getPublicUrl(src, {
          transform: {
            width,
            height,
            format: 'webp',
            quality,
          },
        })
      return data?.publicUrl || null
    } catch {
      // Fallback: usar getSupabaseImageUrl sin transformaciones
      return getSupabaseImageUrl(src, bucket)
    }
  }

  const optimizedUrl = getOptimizedUrl()

  // Si no hay src o hay error, mostrar fallback
  if (!src || hasError) {
    return (
      <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
        {fallback || (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Skeleton mientras carga */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse">
          {placeholder || (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/50 dark:bg-gray-600/50 rounded-full" />
            </div>
          )}
        </div>
      )}

      {/* Imagen optimizada */}
      {isInView && (
        <img
          src={optimizedUrl || src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true)
            setIsLoaded(true)
          }}
          className={`w-full h-full object-${objectFit} transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          width={width}
          height={height}
        />
      )}
    </div>
  )
}