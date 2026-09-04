import { ensureInteractivo } from "../../../lib/interactive/state";
import { PREGUNTAS } from "../../../data/questions";
import { StatusCard } from "../../ui";
import { ConnectionCard, ProgressCard } from "./ConnectionCard";

export function SettingsSection({
  dupla,
  rol,
  onOpenWhatsApp,
  onGoPolicy,
  onGoCrisis,
  onStartTest,
  onViewReport,
  onViewComparative,
}) {
  const interactivo = ensureInteractivo(dupla);
  const persona = rol === "madre" ? dupla.madre : dupla.hija;
  const answered = Object.keys(persona.respuestas || {}).length;
  const total = PREGUNTAS[rol === "madre" ? "madre" : "hija"].length;

  return (
    <div className="section-page">
      <header className="page-header">
        <span className="eyebrow">Configuración</span>
        <h2>Ajustes</h2>
        <p>Gestiona tu perfil, notificaciones y preferencias.</p>
      </header>

      <section className="dash-card" aria-labelledby="profile-settings-title">
        <h3 id="profile-settings-title">Perfil y test</h3>
        <StatusCard
          title={persona.nombre || (rol === "madre" ? "Madre" : "Hija")}
          answered={answered}
          total={total}
          complete={persona.completado}
          onAction={persona.completado ? onViewReport : onStartTest}
          actionText={persona.completado ? "Ver reporte" : answered > 0 ? "Continuar test" : "Empezar test"}
        />
        {rol === "madre" && dupla.hija?.nombre ? (
          <div className="settings-row">
            <div>
              <strong>Tu hija: {dupla.hija.nombre}</strong>
              <p className="muted">Código de dupla: {dupla.codigo}</p>
            </div>
          </div>
        ) : null}
        {rol === "madre" && dupla.madre?.completado && dupla.hija?.completado ? (
          <button type="button" className="ghost" onClick={onViewComparative}>Ver mapa comparativo</button>
        ) : null}
      </section>

      <section className="dash-card" aria-labelledby="whatsapp-settings-title">
        <h3 id="whatsapp-settings-title">Notificaciones WhatsApp</h3>
        <p className="muted">
          {interactivo.whatsapp.enabled
            ? `Activas · ${interactivo.whatsapp.phone || "Sin número"} · ${interactivo.whatsapp.preferredTime}`
            : "Recibe mensajes motivacionales automáticos"}
        </p>
        <button type="button" onClick={onOpenWhatsApp}>Configurar WhatsApp</button>
      </section>

      <section className="dash-card" aria-labelledby="legal-settings-title">
        <h3 id="legal-settings-title">Información legal</h3>
        <div className="actions">
          <button type="button" className="ghost" onClick={onGoPolicy}>Política y consentimiento</button>
          <button type="button" className="ghost" onClick={onGoCrisis}>Recursos de apoyo</button>
        </div>
      </section>
    </div>
  );
}

export function ConnectionSection({ dupla, rol, codigo }) {
  return (
    <div className="section-page">
      <header className="page-header">
        <span className="eyebrow">Vínculo</span>
        <h2>Conexión madre-hija</h2>
        <p>Tu código de dupla y el progreso de vuestra conexión.</p>
      </header>
      <ConnectionCard dupla={dupla} rol={rol} codigo={codigo} />
      <ProgressCard dupla={dupla} />
    </div>
  );
}
