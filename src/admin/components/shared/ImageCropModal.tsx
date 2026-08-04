import { toast } from '@/admin/components/shared/Toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { CropIcon, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentImageUrl?: string | null
  bucket: string
  folder: string
  onImageChange: (imageUrl: string) => void
  aspectRatio?: number
  label?: string
  maxSizeMB?: number
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspectRatio?: number
): Crop {
  if (!aspectRatio) {
    return centerCrop(
      makeAspectCrop(
        { unit: '%', width: 90 },
        1,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    )
  }
  return centerCrop(
    makeAspectCrop(
      { unit: '%', width: 90 },
      aspectRatio,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export function ImageCropModal({
  open,
  onOpenChange,
  currentImageUrl,
  bucket,
  folder,
  onImageChange,
  aspectRatio,
  label = 'Imagen',
  maxSizeMB = 2,
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      if (currentImageUrl) {
        if (currentImageUrl.startsWith('http')) {
          // Agregar timestamp para evitar caché
          const urlWithTimestamp = `${currentImageUrl}?t=${Date.now()}`
          setImageSrc(urlWithTimestamp)
        } else {
          const { data } = supabase.storage.from(bucket).getPublicUrl(currentImageUrl)
          setImageSrc(data.publicUrl)
        }
      } else {
        setImageSrc(null)
      }
      setCrop(undefined)
      setCompletedCrop(undefined)
      setSelectedFile(null)
    }
  }, [open, currentImageUrl, bucket])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error('Archivo muy grande', `El archivo debe pesar menos de ${maxSizeMB}MB`)
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Archivo inválido', 'Solo se permiten imágenes')
      return
    }

    setSelectedFile(file)
    const objectUrl = URL.createObjectURL(file)
    setImageSrc(objectUrl)
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, aspectRatio))
  }

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error('Error', 'Selecciona un área de recorte válida')
      return
    }

    setIsUploading(true)
    try {
      const image = imgRef.current
      const canvas = document.createElement('canvas')
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      canvas.width = Math.floor(completedCrop.width * scaleX)
      canvas.height = Math.floor(completedCrop.height * scaleY)

      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No se pudo obtener el contexto del canvas')

      // Usar drawImage con parámetros explícitos
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      )

      // Convertir canvas a Blob de forma segura
      const blob: Blob | null = await new Promise((resolve) => {
        canvas.toBlob(
          (b) => {
            resolve(b)
          },
          'image/png',
          0.95
        )
      })

      if (!blob) {
        throw new Error('No se pudo generar la imagen recortada')
      }

      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/png',
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      
      onImageChange(data.publicUrl)
      toast.success('Imagen actualizada', 'La imagen se recortó y guardó correctamente')
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error al procesar imagen:', error)
      
      // Mensaje más específico según el error
      if (error.name === 'DOMException' && error.message.includes('insecure')) {
        toast.error(
          'Error de CORS', 
          'No se puede procesar la imagen debido a restricciones de seguridad. Intenta subir una imagen desde tu dispositivo en lugar de usar la existente.'
        )
      } else {
        toast.error('Error', error.message || 'No se pudo procesar la imagen')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] dark:bg-gray-800 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="dark:text-white flex items-center gap-2">
            <CropIcon className="h-5 w-5 text-[#EA0A2A]" />
            {label} - Recortar imagen
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Selecciona una imagen y ajusta el área de recorte. La imagen se subirá automáticamente al aplicar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!imageSrc ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 bg-gray-50 dark:bg-gray-800/50">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
                {currentImageUrl 
                  ? 'La imagen actual no está disponible. Selecciona una nueva.' 
                  : 'Selecciona una imagen para recortar'}
              </p>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#EA0A2A] hover:bg-[#c90825]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar imagen
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center max-h-[400px]">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  minHeight={50}
                  minWidth={50}
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Imagen a recortar"
                    onLoad={onImageLoad}
                    crossOrigin="anonymous"
                    className="max-h-[400px] max-w-full object-contain"
                  />
                </ReactCrop>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImageSrc(null)
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cambiar imagen
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedFile ? selectedFile.name : 'Imagen actual'}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApplyCrop}
            disabled={!completedCrop || !imageSrc || isUploading}
            className="bg-[#EA0A2A] hover:bg-[#c90825]"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2" />
                Subiendo...
              </>
            ) : (
              <>
                <CropIcon className="h-4 w-4 mr-2" />
                Aplicar recorte y guardar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}