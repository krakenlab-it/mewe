import { useEffect, useId, useRef } from "react";

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function AccessibleDialog({ dialog, onResolve }) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!dialog) return undefined;

    previousFocusRef.current = document.activeElement;
    const panel = panelRef.current;
    const focusables = panel ? getFocusableElements(panel) : [];
    (focusables[0] || panel)?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape" && dialog.type === "alert") {
        event.preventDefault();
        onResolve(dialog.type === "prompt" ? null : false);
      }

      if (event.key !== "Tab" || !panel) return;

      const items = getFocusableElements(panel);
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [dialog, onResolve]);

  if (!dialog) return null;

  const isPrompt = dialog.type === "prompt";
  const isConfirm = dialog.type === "confirm";

  return (
    <div className="dialog-overlay" role="presentation">
      <div
        ref={panelRef}
        className="dialog-panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <h2 id={titleId} className="dialog-title">
          {dialog.title || (isConfirm ? "Confirmar acción" : "Aviso")}
        </h2>
        <p id={descriptionId} className="dialog-message">{dialog.message}</p>

        {isPrompt ? (
          <label className="field dialog-field" htmlFor={`${titleId}-input`}>
            <span>{dialog.inputLabel || "Confirmación"}</span>
            <input
              id={`${titleId}-input`}
              type="text"
              defaultValue={dialog.defaultValue || ""}
              autoComplete="off"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onResolve(event.currentTarget.value);
                }
              }}
            />
          </label>
        ) : null}

        <div className="dialog-actions">
          {isConfirm || isPrompt ? (
            <button type="button" className="ghost" onClick={() => onResolve(isPrompt ? null : false)}>
              {dialog.cancelLabel || "Cancelar"}
            </button>
          ) : null}
          <button
            type="button"
            className={isConfirm && dialog.danger ? "danger" : undefined}
            onClick={() => {
              if (isPrompt) {
                const input = panelRef.current?.querySelector("input");
                onResolve(input?.value ?? "");
                return;
              }
              onResolve(true);
            }}
          >
            {dialog.confirmLabel || (isConfirm ? "Confirmar" : "Entendido")}
          </button>
        </div>
      </div>
    </div>
  );
}
