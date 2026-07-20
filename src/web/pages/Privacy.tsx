import { Shield } from 'lucide-react'

export const Privacy = () => {
  return (
    <>
      {/* Header de página */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/20 border border-[#EA0A2A]/30 rounded-full px-4 py-2 mb-6">
            <Shield size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-white font-semibold">Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Política de Privacidad
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Tu privacidad es importante para nosotros
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none">
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
              <p className="text-sm text-gray-600">
                <strong>Última actualización:</strong>{' '}
                {new Date().toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
                <p className="text-gray-700 leading-relaxed">
                  En Correas Center, respetamos tu privacidad y nos comprometemos a proteger tus datos personales.
                  Esta política de privacidad explica cómo recopilamos, usamos y protegemos la información que nos
                  proporcionas a través de nuestro sitio web.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>
                <p className="text-gray-700 leading-relaxed mb-3">Podemos recopilar los siguientes tipos de información personal:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Nombre completo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Nombre de la empresa</li>
                  <li>Información de contacto proporcionada voluntariamente</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Uso de la Información</h2>
                <p className="text-gray-700 leading-relaxed mb-3">Utilizamos la información recopilada para:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Responder a tus consultas y solicitudes</li>
                  <li>Proporcionar asesoría técnica especializada</li>
                  <li>Enviarte información sobre nuestros productos y servicios</li>
                  <li>Mejorar nuestros servicios y experiencia del usuario</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Protección de Datos</h2>
                <p className="text-gray-700 leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tus datos
                  personales contra acceso no autorizado, alteración, divulgación o destrucción.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Tus Derechos</h2>
                <p className="text-gray-700 leading-relaxed mb-3">Tienes derecho a:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Acceder a tus datos personales</li>
                  <li>Rectificar datos inexactos</li>
                  <li>Solicitar la eliminación de tus datos</li>
                  <li>Oponerte al tratamiento de tus datos</li>
                  <li>Solicitar la portabilidad de tus datos</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contacto</h2>
                <p className="text-gray-700 leading-relaxed">
                  Si tienes preguntas sobre esta política de privacidad o deseas ejercer tus derechos, puedes
                  contactarnos a través de:
                </p>
                <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-700">
                    <strong>Email:</strong> ventas@correascenter.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Teléfono:</strong> +591 7 7306-576
                  </p>
                  <p className="text-gray-700">
                    <strong>Dirección:</strong> Av. Grigotas 2do anillo, Santa Cruz de la Sierra, Bolivia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}