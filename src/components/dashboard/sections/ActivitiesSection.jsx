import { WORKSHOP_ACTIVITIES } from "../../../lib/interactive/data";
import { ensureInteractivo } from "../../../lib/interactive/state";

export function ActivitiesPreview({ onGoActivities, onUpload, onCompleteInfo }) {
  return (
    <section className="dash-card" aria-labelledby="activities-preview-title">
      <div className="section-header-row">
        <h2 id="activities-preview-title">Actividades del taller Me We</h2>
        <button type="button" className="ghost small outline-purple" onClick={onCompleteInfo}>
          🛡️ Completar información
        </button>
      </div>
      <ul className="activity-list" aria-label="Actividades del taller">
        {WORKSHOP_ACTIVITIES.slice(0, 3).map((act) => (
          <li key={act.id}>
            <ActivityRow activity={act} onDoc={() => onUpload(act)} onImage={() => onUpload(act)} />
          </li>
        ))}
      </ul>
      <button type="button" className="ghost" onClick={onGoActivities}>Ver todas las actividades</button>
    </section>
  );
}

export function ActivitiesSection({ dupla, onUpload, onCompleteInfo, onComplete }) {
  const interactivo = ensureInteractivo(dupla);

  return (
    <div className="section-page">
      <header className="page-header">
        <span className="eyebrow">Taller Me We</span>
        <h2>Actividades del taller Me We</h2>
        <p>Explora las actividades diseñadas para fortalecer tu vínculo madre-hija.</p>
      </header>
      <div className="section-header-row">
        <span />
        <button type="button" className="ghost small outline-purple" onClick={onCompleteInfo}>
          🛡️ Completar información
        </button>
      </div>
      <ul className="activity-list full" aria-label="Lista de actividades del taller">
        {WORKSHOP_ACTIVITIES.map((act) => {
          const completed = interactivo.activities.completed.includes(act.id);
          const uploads = interactivo.activities.uploads[act.id]?.length || 0;
          return (
            <li key={act.id}>
              <ActivityRow
                activity={act}
                completed={completed}
                uploads={uploads}
                onDoc={() => onUpload(act)}
                onImage={() => onUpload(act)}
                onComplete={() => onComplete(act.id)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ActivityRow({ activity, completed, uploads = 0, onDoc, onImage, onComplete }) {
  return (
    <article className="activity-row">
      <div className="activity-icon" style={{ background: activity.color }} aria-hidden="true">
        {activity.icon}
      </div>
      <div className="activity-info">
        <h3>{activity.title}</h3>
        <p className="muted">{activity.description}</p>
        {uploads > 0 ? <p className="small-note">{uploads} archivo(s) cargado(s)</p> : null}
      </div>
      <div className="activity-actions">
        <button type="button" className="icon-btn blue" onClick={onDoc} aria-label={`Documento de ${activity.title}`}>
          📄
        </button>
        <button type="button" className="icon-btn blue" onClick={onImage} aria-label={`Imagen de ${activity.title}`}>
          🖼️
        </button>
        {onComplete && !completed ? (
          <button type="button" className="small secondary" onClick={onComplete}>Completar</button>
        ) : (
          <span className={`pill${completed ? " done" : ""}`}>{completed ? "Completada" : "Disponible"}</span>
        )}
      </div>
    </article>
  );
}
