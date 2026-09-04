import { useState } from "react";
import { PAMELA_INTRO, PAMELA_STUB_RESPONSES } from "../../../lib/interactive/data";
import { addChatMessage, ensureInteractivo } from "../../../lib/interactive/state";

const ASSISTANT_ENABLED = import.meta.env.VITE_MEWE_ASSISTANT_ENABLED === "true";

export function AssistantSection({ dupla, rol, onSave }) {
  const interactivo = ensureInteractivo(dupla);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const messages = interactivo.chat.messages;

  function sendMessage(text) {
    if (!text.trim()) return;
    addChatMessage(dupla, { role: "user", content: text.trim(), authorRol: rol });
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const response = ASSISTANT_ENABLED
        ? PAMELA_STUB_RESPONSES[Math.floor(Math.random() * PAMELA_STUB_RESPONSES.length)]
        : PAMELA_STUB_RESPONSES[Math.floor(Math.random() * PAMELA_STUB_RESPONSES.length)];
      addChatMessage(dupla, { role: "assistant", content: response, author: "Pamela Gabela" });
      setThinking(false);
      onSave();
    }, 800);

    onSave();
  }

  return (
    <div className="section-page">
      <header className="page-header">
        <span className="eyebrow">Asistente Me We</span>
        <h2>Conversa con Me We</h2>
        <p>Pamela Gabela te acompaña en tu camino madre-hija.</p>
      </header>

      {messages.length === 0 ? (
        <section className="assistant-intro" aria-labelledby="pamela-intro-title">
          <div className="assistant-avatar" aria-hidden="true">PG</div>
          <p id="pamela-intro-title">{PAMELA_INTRO}</p>
          <button type="button" onClick={() => sendMessage("Hola Pamela, quiero empezar")}>
            Iniciar conversación
          </button>
          {!ASSISTANT_ENABLED ? (
            <p className="muted small-note">Modo demostración: respuestas predefinidas. Activa VITE_MEWE_ASSISTANT_ENABLED para integración OpenAI.</p>
          ) : null}
        </section>
      ) : (
        <div className="chat-thread" role="log" aria-live="polite" aria-label="Conversación con Pamela Gabela">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.role}`}>
              {msg.role === "assistant" ? <span className="chat-author">Pamela Gabela</span> : null}
              <p>{msg.content}</p>
            </div>
          ))}
          {thinking ? <div className="chat-bubble assistant" aria-busy="true"><p>Escribiendo...</p></div> : null}
        </div>
      )}

      {messages.length > 0 ? (
        <form
          className="chat-input-form"
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
        >
          <label className="sr-only" htmlFor="chat-input">Tu mensaje</label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={thinking}
          />
          <button type="submit" disabled={thinking || !input.trim()}>Enviar</button>
        </form>
      ) : null}
    </div>
  );
}

export function AssistantWidget({ onGoAssistant }) {
  return (
    <section className="assistant-intro compact" aria-labelledby="assistant-widget-title">
      <div className="assistant-avatar" aria-hidden="true">PG</div>
      <div>
        <h3 id="assistant-widget-title" className="sr-only">Conversa con Me We</h3>
        <p>{PAMELA_INTRO}</p>
        <button type="button" onClick={onGoAssistant}>Iniciar conversación</button>
      </div>
    </section>
  );
}
