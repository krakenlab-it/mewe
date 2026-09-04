import { Field, Shell } from "../components/ui";

export function DaughterAccessPage({ code, setCode, onSubmit, onBack }) {
  return (
    <Shell onBack={onBack}>
      <h2>Hola 🌱</h2>
      <p>¿Tu mamá te pasó un código? Ingrésalo acá.</p>
      <Field label="Código que te pasó tu mamá">
        <input
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="6 caracteres"
        />
      </Field>
      <button onClick={onSubmit}>Entrar</button>
    </Shell>
  );
}
