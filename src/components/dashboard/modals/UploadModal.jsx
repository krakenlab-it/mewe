import { useEffect, useRef, useState } from "react";

export function UploadModal({ open, activityTitle, onUpload, onClose }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleFiles(files) {
    if (!files?.length) return;
    const file = files[0];
    onUpload({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    onClose();
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      className="dialog-overlay"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div
        className="dialog-panel dialog-upload"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
      >
        <button type="button" className="dialog-close-float" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        <h2 id="upload-title" className="sr-only">Cargar documento{activityTitle ? `: ${activityTitle}` : ""}</h2>
        <div
          className={`upload-zone${dragOver ? " drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Zona para cargar documentos. Arrastra archivos o busca archivos."
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
        >
          <p>
            Carga o pega tus documentos o{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => inputRef.current?.click()}
            >
              busca archivos
            </button>
          </p>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>
    </div>
  );
}
