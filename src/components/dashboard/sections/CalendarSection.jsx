import { useState } from "react";
import { WEEKDAY_LABELS } from "../../../lib/interactive/constants";
import { addCalendarEvent, formatWeekRange, getEventsForDate, getWeekDates, getWeekStart, removeCalendarEvent } from "../../../lib/interactive/state";

export function CalendarSection({ dupla, onSave }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "" });
  const dates = getWeekDates(weekStart);
  const today = new Date().toISOString().slice(0, 10);

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }

  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    addCalendarEvent(dupla, newEvent);
    setNewEvent({ title: "", date: "", time: "" });
    setShowForm(false);
    onSave();
  }

  return (
    <div className="section-page">
      <section className="dash-card calendar-card" aria-labelledby="calendar-title">
        <div className="dash-card-header gradient-green-purple">
          <span aria-hidden="true">📅</span>
          <div>
            <h2 id="calendar-title">Calendario de Actividades</h2>
            <p>Planifica momentos especiales</p>
          </div>
          <button type="button" className="small secondary" onClick={() => setShowForm(!showForm)}>
            + Nueva
          </button>
        </div>

        <div className="calendar-body">
          <button type="button" className="programa-btn">💜 Programa Semanal</button>
          <p className="calendar-range">{formatWeekRange(weekStart)}</p>

          <div className="calendar-nav">
            <button type="button" className="ghost small" onClick={prevWeek}>← Semana anterior</button>
            <button type="button" className="ghost small" onClick={nextWeek}>Siguiente semana →</button>
          </div>

          <div className="week-grid" aria-label="Calendario semanal">
            {dates.map((d, i) => {
              const key = d.toISOString().slice(0, 10);
              const events = getEventsForDate(dupla, key);
              const isToday = key === today;
              return (
                <div
                  key={key}
                  className={`week-day${isToday ? " today" : ""}`}
                  aria-label={`${WEEKDAY_LABELS[i]} ${d.getDate()}, ${events.length} evento(s)`}
                >
                  <span className="week-day-label">{WEEKDAY_LABELS[i]}</span>
                  <span className="week-day-num">{d.getDate()}</span>
                  {events.map((evt) => (
                    <div key={evt.id} className="week-event">
                      <span>{evt.title}</span>
                      <button
                        type="button"
                        className="ghost small"
                        aria-label={`Eliminar ${evt.title}`}
                        onClick={() => { removeCalendarEvent(dupla, evt.id); onSave(); }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {showForm ? (
          <form className="calendar-form" onSubmit={handleAdd}>
            <label className="field">
              <span>Título</span>
              <input value={newEvent.title} onChange={(e) => setNewEvent((f) => ({ ...f, title: e.target.value }))} required />
            </label>
            <label className="field">
              <span>Fecha</span>
              <input type="date" value={newEvent.date} onChange={(e) => setNewEvent((f) => ({ ...f, date: e.target.value }))} required />
            </label>
            <label className="field">
              <span>Hora (opcional)</span>
              <input type="time" value={newEvent.time} onChange={(e) => setNewEvent((f) => ({ ...f, time: e.target.value }))} />
            </label>
            <div className="dialog-actions">
              <button type="button" className="ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit">Agregar</button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}

export function CalendarWidget({ onGoCalendar }) {
  const weekStart = getWeekStart();
  const dates = getWeekDates(weekStart);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="dash-card calendar-card compact" aria-labelledby="calendar-widget-title">
      <div className="dash-card-header gradient-green-purple">
        <span aria-hidden="true">📅</span>
        <div>
          <h3 id="calendar-widget-title">Calendario de Actividades</h3>
          <p>Planifica momentos especiales</p>
        </div>
        <button type="button" className="small secondary" onClick={onGoCalendar}>+ Nueva</button>
      </div>
      <div className="calendar-body">
        <button type="button" className="programa-btn" onClick={onGoCalendar}>💜 Programa Semanal</button>
        <div className="week-grid compact" aria-label="Vista semanal">
          {dates.map((d, i) => {
            const key = d.toISOString().slice(0, 10);
            return (
              <div key={key} className={`week-day${key === today ? " today" : ""}`} aria-label={`${WEEKDAY_LABELS[i]} ${d.getDate()}`}>
                <span className="week-day-label">{WEEKDAY_LABELS[i]}</span>
                <span className="week-day-num">{d.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
