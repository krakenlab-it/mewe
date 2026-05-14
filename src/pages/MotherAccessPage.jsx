import { Shell } from "../components/ui";

export function MotherAccessPage({ onCreate, onResume, onBack }) {
  return (
    <Shell>
      <h2>Hola, mamá 🌿</h2>
      <p>Dos formas de entrar:</p>
      <button onClick={onCreate}>Es mi primera vez · crear cuenta</button>
      <button className="secondary" onClick={onResume}>Ya tengo un código · retomar</button>
      <button className="ghost" onClick={onBack}>Volver</button>
    </Shell>
  );
}
