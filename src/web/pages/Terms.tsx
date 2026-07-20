import { FileText } from 'lucide-react'

// ✅ CORREGIDO: Eliminado AppLayout ya que PublicLayout ya lo incluye
export const Terms = () => {
  return (
    <>
      {/* Header de página */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/20 border border-[#EA0A2A]/30 rounded-full px-4 py-2 mb-6">
            <FileText size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-white font-semibold">Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Lee cuidadosamente estos términos antes de usar nuestro sitio web
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
                <p className="text-gray-700 leading-relaxed">
                  Al acceder y utilizar el sitio web de Correas Center, aceptas cumplir con estos términos y condiciones de uso. 
                  Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro sitio web.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Uso del Sitio Web</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Te comprometes a utilizar el sitio web únicamente para fines legales y de manera que:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>No infrinja ninguna ley o regulación aplicable</li>
                  <li>No viole los derechos de terceros</li>
                  <li>No sea ofensivo, difamatorio o ilegal</li>
                  <li>No introduzca material malicioso o dañino</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Propiedad Intelectual</h2>
                <p className="text-gray-700 leading-relaxed">
                  Todo el contenido del sitio web, incluyendo textos, gráficos, logotipos, iconos, imágenes y software, 
                  es propiedad de Correas Center o de sus proveedores de contenido y está protegido por las leyes de 
                  propiedad intelectual aplicables.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Productos y Servicios</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  La información sobre productos y servicios en nuestro sitio web se proporciona únicamente con fines informativos. 
                  Nos reservamos el derecho de:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Modificar precios y disponibilidad sin previo aviso</li>
                  <li>Corregir errores en descripciones de productos</li>
                  <li>Cancelar pedidos en caso de indisponibilidad</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitación de Responsabilidad</h2>
                <p className="text-gray-700 leading-relaxed">
                  Correas Center no será responsable por daños directos, indirectos, incidentales o consecuentes 
                  que resulten del uso o la imposibilidad de usar nuestro sitio web o sus servicios.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Enlaces a Terceros</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nuestro sitio web puede contener enlaces a sitios web de terceros. No somos responsables del contenido 
                  o las prácticas de privacidad de estos sitios. Te recomendamos revisar sus términos y políticas.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modificaciones</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor 
                  inmediatamente después de su publicación en el sitio web. El uso continuado del sitio constituye la 
                  aceptación de los términos modificados.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Ley Aplicable</h2>
                <p className="text-gray-700 leading-relaxed">
                  Estos términos se regirán e interpretarán de acuerdo con las leyes del Estado Plurinacional de Bolivia. 
                  Cualquier disputa estará sujeta a la jurisdicción exclusiva de los tribunales de Santa Cruz de la Sierra.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contacto</h2>
                <p className="text-gray-700 leading-relaxed">
                  Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos a través de:
                </p>
                <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-700">
                    <strong>Email:</strong> ventas@correascenter.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Teléfono:</strong> +591 7 7306-576
                  </p>
                  <p className="text-gray-700">
                    <strong>Dirección:</strong> Av. Grigota 2do anillo, Santa Cruz de la Sierra, Bolivia
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