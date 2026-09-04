import { useState } from "react";
import { DASHBOARD_SECTIONS } from "../../lib/interactive/constants";
import { completeActivity, setTodayMood, setActivityUpload, updateWhatsappPrefs } from "../../lib/interactive/state";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { WhatsAppModal } from "../../components/dashboard/modals/WhatsAppModal";
import { UploadModal } from "../../components/dashboard/modals/UploadModal";
import { MoodCard } from "../../components/dashboard/sections/MoodCard";
import { ConnectionCard, ProgressCard } from "../../components/dashboard/sections/ConnectionCard";
import { ActivitiesPreview, ActivitiesSection } from "../../components/dashboard/sections/ActivitiesSection";
import { MoodSection, MoodChartWidget } from "../../components/dashboard/sections/MoodSection";
import { SuggestedCarousel } from "../../components/dashboard/sections/SuggestedCarousel";
import { CalendarSection, CalendarWidget } from "../../components/dashboard/sections/CalendarSection";
import { PiecesSection, AchievementsSection } from "../../components/dashboard/sections/PiecesSection";
import { AssistantSection, AssistantWidget } from "../../components/dashboard/sections/AssistantSection";
import { SettingsSection, ConnectionSection } from "../../components/dashboard/sections/SettingsSection";
import { StatusCard } from "../../components/ui";
import { PREGUNTAS } from "../../data/questions";

export function InteractiveDashboardPage({
  dupla,
  rol,
  section: initialSection = DASHBOARD_SECTIONS.INICIO,
  onSectionChange,
  onSave,
  onLogout,
  onStartTest,
  onViewReport,
  onViewComparative,
  onGoCrisis,
  onGoPolicy,
  onNotify,
}) {
  const [section, setSection] = useState(initialSection);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadActivity, setUploadActivity] = useState(null);

  const persona = rol === "madre" ? dupla.madre : dupla.hija;
  const nombre = persona?.nombre || "";
  const subtitle = rol === "madre"
    ? `Tu código de dupla: ${dupla.codigo}`
    : `Conectada con ${dupla.madre?.nombre || "tu mamá"}`;

  function navigate(next) {
    setSection(next);
    onSectionChange?.(next);
  }

  async function persist(next) {
    await onSave(next || dupla);
  }

  async function handleRecordMood(value) {
    setTodayMood(dupla, rol, value);
    await onSave(structuredClone(dupla));
  }

  async function handleCompleteActivity(activityId) {
    completeActivity(dupla, activityId);
    await onSave(structuredClone(dupla));
  }

  async function handleUpload(meta) {
    if (!uploadActivity) return;
    setActivityUpload(dupla, uploadActivity.id, meta);
    await persist();
    onNotify?.(`Archivo "${meta.name}" cargado para ${uploadActivity.title}`);
  }

  async function handleWhatsappSave(prefs) {
    updateWhatsappPrefs(dupla, prefs);
    await persist();
    setWhatsappOpen(false);
    onNotify?.("Preferencias de WhatsApp guardadas");
  }

  async function handleWhatsappTest(type) {
    const enabled = import.meta.env.VITE_MEWE_WHATSAPP_ENABLED === "true";
    if (!enabled) {
      onNotify?.("Envío de WhatsApp en modo simulación. Configura VITE_MEWE_WHATSAPP_ENABLED para envío real.");
      return;
    }
    onNotify?.(`Mensaje de prueba (${type}) enviado`);
  }

  function openUpload(activity) {
    setUploadActivity(activity);
    setUploadOpen(true);
  }

  const answered = Object.keys(persona.respuestas || {}).length;
  const total = PREGUNTAS[rol === "madre" ? "madre" : "hija"].length;

  function renderSection() {
    switch (section) {
      case DASHBOARD_SECTIONS.INICIO:
        return (
          <div className="inicio-grid">
            <MoodCard dupla={dupla} rol={rol} onRecordMood={handleRecordMood} onGoMood={() => navigate(DASHBOARD_SECTIONS.ANIMO)} />
            <ConnectionCard dupla={dupla} rol={rol} codigo={dupla.codigo} />
            <ProgressCard dupla={dupla} />
            <section className="dash-card test-summary" aria-labelledby="test-summary-title">
              <h2 id="test-summary-title" className="sr-only">Resumen del test</h2>
              <StatusCard
                title={rol === "madre" ? "Tu test Me We" : "Tu espacio"}
                answered={answered}
                total={total}
                complete={persona.completado}
                onAction={persona.completado ? onViewReport : onStartTest}
                actionText={persona.completado ? "Ver reporte" : answered > 0 ? "Continuar" : "Empezar"}
              />
              {rol === "madre" && dupla.hija?.nombre ? (
                <StatusCard
                  title={dupla.hija.nombre}
                  answered={Object.keys(dupla.hija.respuestas || {}).length}
                  total={PREGUNTAS.hija.length}
                  complete={dupla.hija.completado}
                />
              ) : null}
              {rol === "madre" && dupla.madre?.completado && dupla.hija?.completado ? (
                <div>
                  <span className="eyebrow">Comparativo madre-hija</span>
                  <button type="button" className="ghost" onClick={onViewComparative}>Ver mapa comparativo</button>
                </div>
              ) : null}
            </section>
            <ActivitiesPreview
              onGoActivities={() => navigate(DASHBOARD_SECTIONS.ACTIVIDADES)}
              onUpload={openUpload}
              onCompleteInfo={() => openUpload({ id: "confidential", title: "Información confidencial" })}
            />
            <AssistantWidget onGoAssistant={() => navigate(DASHBOARD_SECTIONS.ASISTENTE)} />
            <SuggestedCarousel />
            <CalendarWidget onGoCalendar={() => navigate(DASHBOARD_SECTIONS.CALENDARIO)} />
            <MoodChartWidget dupla={dupla} rol={rol} onGoMood={() => navigate(DASHBOARD_SECTIONS.ANIMO)} />
            <AchievementsSection dupla={dupla} />
          </div>
        );
      case DASHBOARD_SECTIONS.ANIMO:
        return <MoodSection dupla={dupla} rol={rol} onSave={persist} />;
      case DASHBOARD_SECTIONS.CONEXION:
        return <ConnectionSection dupla={dupla} rol={rol} codigo={dupla.codigo} />;
      case DASHBOARD_SECTIONS.ACTIVIDADES:
        return (
          <ActivitiesSection
            dupla={dupla}
            onUpload={openUpload}
            onCompleteInfo={() => openUpload({ id: "confidential", title: "Información confidencial" })}
            onComplete={handleCompleteActivity}
          />
        );
      case DASHBOARD_SECTIONS.CALENDARIO:
        return <CalendarSection dupla={dupla} onSave={persist} />;
      case DASHBOARD_SECTIONS.PIEZAS:
        return <PiecesSection dupla={dupla} rol={rol} />;
      case DASHBOARD_SECTIONS.ASISTENTE:
        return <AssistantSection dupla={dupla} rol={rol} onSave={persist} />;
      case DASHBOARD_SECTIONS.AJUSTES:
        return (
          <SettingsSection
            dupla={dupla}
            rol={rol}
            onOpenWhatsApp={() => setWhatsappOpen(true)}
            onGoPolicy={onGoPolicy}
            onGoCrisis={onGoCrisis}
            onStartTest={onStartTest}
            onViewReport={onViewReport}
            onViewComparative={onViewComparative}
          />
        );
      default: {
        const _exhaustive = section;
        return _exhaustive ? null : null;
      }
    }
  }

  return (
    <>
      <DashboardLayout
        section={section}
        onNavigate={navigate}
        rol={rol}
        nombre={nombre}
        subtitle={subtitle}
        onLogout={onLogout}
        onStartTest={onStartTest}
        onViewReport={onViewReport}
        onViewComparative={rol === "madre" ? onViewComparative : undefined}
      >
        {renderSection()}
      </DashboardLayout>

      <WhatsAppModal
        open={whatsappOpen}
        prefs={dupla.interactivo?.whatsapp || {}}
        onSave={handleWhatsappSave}
        onClose={() => setWhatsappOpen(false)}
        onSendTest={handleWhatsappTest}
      />

      <UploadModal
        open={uploadOpen}
        activityTitle={uploadActivity?.title}
        onUpload={handleUpload}
        onClose={() => { setUploadOpen(false); setUploadActivity(null); }}
      />
    </>
  );
}
