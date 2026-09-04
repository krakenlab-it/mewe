import { useEffect, useRef } from "react";
import { WHATSAPP_FREQUENCIES, WHATSAPP_MESSAGE_TYPES, WHATSAPP_TIMES } from "../../../lib/interactive/constants";

export function WhatsAppModal({ open, prefs, onSave, onClose, onSendTest }) {
  const dialogRef = useRef(null);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    firstFocusRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    onSave({
      phone: data.get("phone"),
      enabled: data.get("enabled") === "on",
      frequency: data.get("frequency"),
      preferredTime: data.get("preferredTime"),
    });
  }

  return (
    <div
      className="dialog-overlay"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div
        ref={dialogRef}
        className="dialog-panel dialog-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-title"
      >
        <div className="dialog-header">
          <h2 id="whatsapp-title">💬 Notificaciones WhatsApp</h2>
          <button type="button" className="ghost small dialog-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <p className="dialog-message">
          Configura mensajes motivacionales automáticos para fortalecer tu vínculo madre-hija
        </p>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>📞 Número de WhatsApp</span>
            <input
              ref={firstFocusRef}
              name="phone"
              type="tel"
              defaultValue={prefs.phone || ""}
              placeholder="+593987123456"
              aria-describedby="phone-hint"
            />
            <small id="phone-hint" className="muted">Incluye el código de país (ej: +593 para Ecuador)</small>
          </label>

          <div className="toggle-row">
            <div>
              <strong>Activar notificaciones</strong>
              <p className="muted">Recibe mensajes motivacionales automáticamente</p>
            </div>
            <label className="switch">
              <input type="checkbox" name="enabled" defaultChecked={prefs.enabled} />
              <span className="switch-slider" />
              <span className="sr-only">Activar notificaciones WhatsApp</span>
            </label>
          </div>

          <label className="field">
            <span>Frecuencia de mensajes</span>
            <select name="frequency" defaultValue={prefs.frequency || "daily"}>
              {WHATSAPP_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>🕐 Hora preferida</span>
            <select name="preferredTime" defaultValue={prefs.preferredTime || "09:00"}>
              {WHATSAPP_TIMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <div className="test-message-box">
            <strong>Probar mensaje</strong>
            <p className="muted">Envía un mensaje de prueba para verificar la configuración</p>
            <select name="testType" defaultValue="motivacional" aria-label="Tipo de mensaje de prueba">
              {WHATSAPP_MESSAGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                const form = dialogRef.current?.querySelector("form");
                const type = form?.testType?.value || "motivacional";
                onSendTest(type);
              }}
            >
              ✈️ Enviar mensaje de prueba
            </button>
          </div>

          <div className="dialog-actions">
            <button type="button" className="ghost" onClick={onClose}>Cancelar</button>
            <button type="submit">⚙️ Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
