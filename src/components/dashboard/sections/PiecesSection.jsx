import { useState } from "react";
import { ACHIEVEMENTS, PIECES_HIJA, PIECES_MADRE, SPECIAL_PIECE } from "../../../lib/interactive/data";
import { ensureInteractivo, getUnlockedAchievements } from "../../../lib/interactive/state";

const PIECES_PER_PAGE = 6;

export function PiecesSection({ dupla, rol }) {
  const [viewRole, setViewRole] = useState(rol === "hija" ? "hija" : "madre");
  const [page, setPage] = useState(0);
  const interactivo = ensureInteractivo(dupla);
  const pieces = viewRole === "madre" ? PIECES_MADRE : PIECES_HIJA;
  const unlocked = viewRole === "madre" ? interactivo.pieces.unlockedMadre : interactivo.pieces.unlockedHija;
  const totalPages = Math.ceil(pieces.length / PIECES_PER_PAGE);
  const pagePieces = pieces.slice(page * PIECES_PER_PAGE, (page + 1) * PIECES_PER_PAGE);
  const totalUnlocked = interactivo.pieces.unlockedMadre.length + interactivo.pieces.unlockedHija.length;
  const specialLabel = interactivo.pieces.unlockedSpecial ? "+ 1 especial" : "+ 1 especial";

  return (
    <div className="section-page">
      <AchievementsSection dupla={dupla} />

      <section className="dash-card pieces-section" aria-labelledby="pieces-title">
        <div className="section-header-row">
          <h2 id="pieces-title">Nuevas piezas que te unen</h2>
          <span className="level-badge">{totalUnlocked}/17 piezas {specialLabel}</span>
        </div>
        <p className="muted">Cada pieza representa un momento especial compartido entre ustedes.</p>

        <div className="role-toggle" role="group" aria-label="Filtrar piezas por rol">
          <button
            type="button"
            className={`role-toggle-btn${viewRole === "madre" ? " active" : ""}`}
            onClick={() => { setViewRole("madre"); setPage(0); }}
            aria-pressed={viewRole === "madre"}
          >
            💗 Para Mamá
          </button>
          <button
            type="button"
            className={`role-toggle-btn${viewRole === "hija" ? " active" : ""}`}
            onClick={() => { setViewRole("hija"); setPage(0); }}
            aria-pressed={viewRole === "hija"}
          >
            ✨ Para Hija
          </button>
        </div>

        <div className="pieces-pagination" aria-label="Paginación de piezas">
          <button type="button" className="ghost small" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Página anterior">
            ←
          </button>
          <span>Página {page + 1} de {totalPages}</span>
          <button type="button" className="ghost small" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Página siguiente">
            →
          </button>
        </div>

        <div className="pieces-grid" role="list" aria-label={`Piezas para ${viewRole === "madre" ? "mamá" : "hija"}`}>
          {pagePieces.map((piece) => {
            const isUnlocked = unlocked.includes(piece.id);
            return (
              <article key={piece.id} className={`piece-card${isUnlocked ? " unlocked" : " locked"}`} role="listitem">
                <div className="piece-cube" aria-hidden="true">
                  {!isUnlocked ? <span className="piece-lock">🔒</span> : null}
                </div>
                <span className="piece-title">{piece.title}</span>
              </article>
            );
          })}
        </div>

        <div className="special-piece" aria-label={SPECIAL_PIECE.title}>
          <div className={`piece-card special${interactivo.pieces.unlockedSpecial ? " unlocked" : " locked"}`}>
            <div className="piece-cube" aria-hidden="true">
              {!interactivo.pieces.unlockedSpecial ? <span className="piece-lock">🔒</span> : "✨"}
            </div>
            <span className="piece-title">{SPECIAL_PIECE.title}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AchievementsSection({ dupla }) {
  const unlocked = getUnlockedAchievements(dupla);

  return (
    <section className="dash-card achievements-card" aria-labelledby="achievements-title">
      <div className="dash-card-header gradient-orange-yellow">
        <span aria-hidden="true">⭐</span>
        <div>
          <h2 id="achievements-title">Logros Compartidos</h2>
          <p>Celebra tus logros juntas</p>
        </div>
        <button type="button" className="ghost small">Ver todos</button>
      </div>
      <div className="dash-card-body achievements-body">
        {unlocked.length === 0 ? (
          <div className="empty-state center">
            <span className="achievement-icon-large" aria-hidden="true">⭐</span>
            <p><strong>¡Pronto tendrás logros increíbles!</strong></p>
            <p className="muted">Completa actividades para desbloquear medallas.</p>
          </div>
        ) : (
          <ul className="achievements-list" aria-label="Logros desbloqueados">
            {unlocked.map((a) => (
              <li key={a.id} className="achievement-item">
                <span aria-hidden="true">{a.icon}</span>
                <div>
                  <strong>{a.title}</strong>
                  <p className="muted">{a.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="sr-only">
          {unlocked.length === 0
            ? "Sin logros aún"
            : `${unlocked.length} de ${ACHIEVEMENTS.length} logros desbloqueados`}
        </p>
      </div>
    </section>
  );
}
