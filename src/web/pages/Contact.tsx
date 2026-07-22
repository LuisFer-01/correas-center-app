import { useGlobalData } from '@/hooks/useGlobalData'
import { supabase } from '@/lib/supabase'
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Contact = () => {
  const { data: globals } = useGlobalData()
  const sucursalPrincipal = globals?.sucursales?.find((s) => s.es_principal) || globals?.sucursales?.[0]

  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    telefono: '',
    email: '',
    mensaje: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Limpiar mensaje después de 5 segundos
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => setSubmitMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [submitMessage])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio'
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido'
    }
    if (!formData.mensaje.trim()) newErrors.mensaje = 'El mensaje es obligatorio'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      // 1. Guardar en la base de datos de Supabase
      const { error } = await supabase.from('contactos').insert({
        empresa_id: globals?.empresa?.id || 1,
        nombre: formData.nombre,
        empresa: formData.empresa || null,
        telefono: formData.telefono,
        email: formData.email,
        mensaje: formData.mensaje,
        estado: 'nuevo',
      })

      if (error) throw error

      // 2. Éxito
      setSubmitMessage({ 
        type: 'success', 
        text: '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.' 
      })
      setFormData({ nombre: '', empresa: '', telefono: '', email: '', mensaje: '' })

      // TODO: Aquí es donde llamarías a tu Supabase Edge Function para enviar el email real.
      // await supabase.functions.invoke('send-contact-email', { body: formData })

    } catch (err) {
      console.error('Error al enviar contacto:', err)
      setSubmitMessage({ 
        type: 'error', 
        text: 'Hubo un error al enviar el mensaje. Por favor intenta nuevamente.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Header de página */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/20 border border-[#EA0A2A]/30 rounded-full px-4 py-2 mb-6">
            <MessageCircle size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-white font-semibold">Contáctanos</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Hablemos de tu Proyecto
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Nuestro equipo está listo para asesorarte y encontrar la mejor solución
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Mensaje de estado (reemplazo de flash messages) */}
          {submitMessage && (
            <div className={`mb-8 rounded-lg p-4 flex items-start gap-3 ${
              submitMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {submitMessage.type === 'success' ? (
                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${submitMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {submitMessage.type === 'success' ? '¡Mensaje enviado!' : 'Error'}
                </p>
                <p className={`text-sm mt-1 ${submitMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {submitMessage.text}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Información de contacto (Dinámica desde globals) */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#EA0A2A] to-[#c90825] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Información de Contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Teléfono</p>
                      <p className="text-xl font-semibold">
                        {sucursalPrincipal?.telefono || '+591 7 7306-576'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Email</p>
                      <p className="text-xl font-semibold">
                        {sucursalPrincipal?.email || 'ventas@correascenter.com'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">WhatsApp</p>
                      <p className="text-xl font-semibold">
                        {globals?.whatsapp?.numero || '+591 7 7306-576'}
                      </p>
                    </div>
                  </div>
                  {sucursalPrincipal && (
                    <>
                      <div className="flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <p className="text-white/80 text-sm">Dirección</p>
                          <p className="text-lg font-semibold">{sucursalPrincipal.direccion}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                          <Clock size={24} />
                        </div>
                        <div>
                          <p className="text-white/80 text-sm">Horarios</p>
                          <p className="text-lg font-semibold">{sucursalPrincipal.horarios}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Botones de acción rápida */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`https://wa.me/${globals?.whatsapp?.numero || '59177306576'}?text=${encodeURIComponent('Hola, necesito información sobre sus productos y servicios')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  Escribir por WhatsApp
                </a>
                <a
                  href={`tel:${sucursalPrincipal?.telefono?.replace(/\s/g, '') || '+59177306576'}`}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Phone size={20} />
                  Llamar Ahora
                </a>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Cuéntanos qué necesitas</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 transition-all outline-none`}
                      placeholder="Juan Perez"
                    />
                    {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                  </div>
                  <div>
                    <label htmlFor="empresa" className="block text-sm font-semibold text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 transition-all outline-none"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.telefono ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 transition-all outline-none`}
                      placeholder="+591 7000-0000"
                    />
                    {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 transition-all outline-none`}
                      placeholder="email@empresa.com"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">
                    Consulta *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.mensaje ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 transition-all outline-none resize-none`}
                    placeholder="Cuéntanos qué necesitas..."
                  />
                  {errors.mensaje && <p className="text-red-600 text-sm mt-1">{errors.mensaje}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#EA0A2A] hover:bg-[#c90825] disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Consulta
                      <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}