import { useGlobalData } from '@/hooks/useGlobalData'
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

export const WhatsAppFloat = () => {
  const { data: globals } = useGlobalData()
  const whatsapp = globals?.whatsapp || {
    numero: '59177306576',
    mensaje: 'Hola, necesito información sobre sus productos y servicios'
  }
  
  const [showTooltip, setShowTooltip] = useState(true)

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsapp.numero}?text=${encodeURIComponent(whatsapp.mensaje)}`
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Botón flotante de WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-16 right-0 mb-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 p-3 animate-fade-in">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                  <MessageCircle size={16} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">
                  ¿Necesitas ayuda?
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Escríbenos por WhatsApp y te atenderemos de inmediato
                </p>
              </div>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            {/* Triángulo del tooltip */}
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
          </div>
        )}

        {/* Botón principal */}
        <button
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setShowTooltip(true)}
          className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-pulse-slow flex items-center justify-center group"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle size={32} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Estilos CSS personalizados */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
          }
          50% {
            box-shadow: 0 4px 25px rgba(37, 211, 102, 0.6);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .shadow-3xl {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  )
}