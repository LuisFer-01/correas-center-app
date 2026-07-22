import { useGlobalData } from '@/hooks/useGlobalData'
import { supabase } from '@/lib/supabase'
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useEffect, useState } from 'react'

// Datos estáticos de FAQ (puedes migrarlos a la BD después si lo deseas)
const faqData = [
  {
    pregunta: '¿Cuál es el horario de atención?',
    respuesta: 'Atendemos de lunes a viernes de 8:00 a 18:30 y sábados de 8:00 a 13:00. Nuestras sucursales están disponibles para atenderte.',
  },
  {
    pregunta: '¿Realizan entregas a todo Bolivia?',
    respuesta: 'Sí, contamos con cobertura nacional. Realizamos envíos a todos los departamentos de Bolivia. Para pedidos urgentes, consulta disponibilidad de entrega express.',
  },
  {
    pregunta: '¿Cuánto tiempo tarda una cotización?',
    respuesta: 'Las cotizaciones se responden en un máximo de 24 horas hábiles. Para consultas urgentes, te recomendamos contactarnos directamente por WhatsApp o teléfono.',
  },
  {
    pregunta: '¿Fabrican productos a medida?',
    respuesta: 'Sí, somos fabricantes autorizados SKF y podemos producir sellos, retenes y otros componentes según tus especificaciones técnicas. Contáctanos con los detalles.',
  },
  {
    pregunta: '¿Tienen garantía en sus productos?',
    respuesta: 'Todos nuestros productos cuentan con garantía de calidad. Los productos SKF tienen garantía del fabricante. Consulta los términos específicos según el producto.',
  },
]

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
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
      
      // TODO: Aquí puedes invocar la Edge Function para enviar el correo si ya la configuraste
      await supabase.functions.invoke('send-contact-email', { body: formData })

    } catch (err: any) {
      console.error('Error al enviar contacto:', err)
      setSubmitMessage({ 
        type: 'error', 
        text: err.message || 'Hubo un error al enviar el mensaje. Por favor intenta nuevamente.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[#EA0A2A] font-semibold text-sm uppercase tracking-wider mb-2">
            Contáctanos
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Hablemos de tu Proyecto
          </h2>
          <p className="text-lg text-gray-600 max-w-1xl mx-auto">
            Nuestro equipo está listo para asesorarte y encontrar la mejor solución
          </p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
          {/* Información de contacto */}
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
                className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                <MessageCircle size={20} />
                Escribir por WhatsApp
              </a>
              <a
                href={`tel:${sucursalPrincipal?.telefono?.replace(/\s/g, '') || '+59177306576'}`}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 hover:scale-105"
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

        {/* SE ELIMINÓ: Mapa de Sucursales Interactivo (Se moverá a Locations.tsx) */}

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-10">
            <p className="text-[#EA0A2A] font-semibold text-sm uppercase tracking-wider mb-2">
              Preguntas Frecuentes
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Tienes Dudas?
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra respuestas a las preguntas más comunes
            </p>
          </div>
          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:border-[#EA0A2A]/30"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.pregunta}</span>
                  <div className={`transform transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="#EA0A2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.respuesta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banner de Chat en Vivo (Tawk.to) */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="bg-blue-500 p-4 rounded-full">
              <MessageCircle size={32} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Prefieres hablar con un agente ahora?
              </h3>
              <p className="text-gray-600">
                Nuestro equipo está disponible en línea para resolver tus dudas en tiempo real
              </p>
            </div>
            <button
              onClick={() => {
                // Abrir el chat de Tawk.to si está disponible
                if (typeof window !== 'undefined' && (window as any).Tawk_API) {
                  (window as any).Tawk_API.maximize()
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap"
            >
              <MessageCircle size={18} />
              Iniciar Chat
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}