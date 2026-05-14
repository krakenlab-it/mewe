import { Shell } from "../components/ui";

export function MotherCodePage({ codigo, onContinue }) {
  return (
    <Shell>
      <h2>Tu código de dupla 🌿</h2>
      <p>Compártelo con tu hija para que pueda entrar.</p>
      <div className="code">{codigo}</div>
      <p className="muted">También úsalo tú si entras desde otro dispositivo.</p>
      <button onClick={onContinue}>Ir al dashboard</button>
    </Shell>
  );
}
