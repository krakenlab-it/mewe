import { Info } from "lucide-react";

export function ConsentTermsContent({ children }: { children?: React.ReactNode }) {
  return (
    <div className="max-h-96 overflow-y-auto space-y-4 text-sm" data-testid="consent-terms-content">
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">1. Responsable del Tratamiento</h4>
        <p>Me We, con domicilio en Ecuador, como responsable del tratamiento de tus datos personales.</p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">2. Finalidad del Tratamiento</h4>
        <p className="mb-2">Al aceptar este Acuerdo, autorizas expresamente que tus datos personales sean utilizados para:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Proveer funcionalidades de la app, incluyendo transmisión de información en tiempo real.</li>
          <li>Envío de notificaciones, avisos y alertas.</li>
          <li>Uso de agentes con inteligencia artificial (IA) para asistencia, procesamiento y recomendaciones.</li>
          <li>Dirección de publicidad personalizada y servicios adicionales dentro de la app.</li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">3. Consentimiento Libre, Específico, Informado e Inequívoco</h4>
        <p className="mb-2">Este consentimiento es:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Libre:</strong> sin presión o coacción.</li>
          <li><strong>Específico:</strong> cubre únicamente las finalidades antes descritas.</li>
          <li><strong>Informado:</strong> se te ha explicado claramente qué datos se recogen, por qué, y cómo se usan.</li>
          <li><strong>Inequívoco:</strong> tu aceptación al hacer click en el botón de esta app Me We, constituye una manifestación afirmativa de tu voluntad para aceptar estos términos y condiciones.</li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">4. Tipos de Datos Recogidos</h4>
        <ul className="list-disc pl-4 space-y-1">
          <li>Datos de contacto (nombres y apellidos, correo, teléfono, género, madre o hija).</li>
          <li>Datos de uso, navegación, preferencias.</li>
          <li>Interacciones con agentes IA.</li>
          <li>Datos derivados de los talleres realizados, tus respuestas o transmisiones e información dentro de la app.</li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">5. Tiempo de Conservación</h4>
        <p>Guardaremos tus datos solo por el tiempo necesario para cumplir con las finalidades señaladas y según lo exigido por la normativa. Luego serán eliminados o anonimizados.</p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">6. Seguridad y Medidas Técnicas</h4>
        <p>Aplicamos medidas organizativas y técnicas (cifrado, acceso restringido, control interno) para garantizar confidencialidad, integridad y disponibilidad de los datos.</p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">7. Revocabilidad</h4>
        <p>Puedes revocar tu consentimiento en cualquier momento sin tener que justificarlo. Para ello, puedes dirigirte a nuestro correo de asistencia o acceder a la sección de configuración dentro de la app.</p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">8. Derechos del Titular</h4>
        <p className="mb-2">De acuerdo con la LOPDP, tienes el derecho a:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Acceder a tus datos.</li>
          <li>Rectificarlos o actualizarlos si son incorrectos.</li>
          <li>Cancelar su tratamiento o eliminación.</li>
          <li>Oponerte a que se realice un tratamiento específico.</li>
        </ul>
        <p className="mt-2">Serás informado si uno de tus derechos es ejercido por un representante legal, en caso de menores de edad o personas incapaces.</p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">9. Transferencias Internacionales</h4>
        <p>Si tus datos se transfieren a servidores fuera del Ecuador, garantizamos que se aplique un nivel de protección equivalente al normado en la LOPDP o que existan mecanismos jurídicos adecuados.</p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">10. Mecanismos de Contacto</h4>
        <div className="space-y-1">
          <p>Para ejercer tus derechos o presentar una queja:</p>
          <p><strong>Delegado de Protección de Datos:</strong> Me We Support</p>
          <p><strong>Correo electrónico:</strong> privacy@mewe.ec</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">11. Aceptación del Consentimiento</h4>
        <p>Al presionar &quot;ACEPTAR&quot; al iniciar la app, confirmas que:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Has leído cuidadosamente este Acuerdo.</li>
          <li>Comprendes cómo se tratan tus datos y para qué fines se usan.</li>
          <li>Otorgas tu consentimiento explícito para el tratamiento detallado.</li>
        </ul>
      </div>

      {children}
    </div>
  );
}

export function ConsentTermsHeading() {
  return (
    <span className="flex items-center gap-2">
      <Info className="h-5 w-5 text-blue-600" />
      Acuerdo de Consentimiento – Aplicación Me We
    </span>
  );
}
