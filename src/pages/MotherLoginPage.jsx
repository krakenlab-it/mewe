import { Field, Shell } from "../components/ui";

export function MotherLoginPage({ code, setCode, onSubmit, onBack }) {
  return (
    <Shell>
      <h2>Retomar tu sesión</h2>
      <Field label="Código de dupla">
        <input
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="6 caracteres"
        />
      </Field>
      <button onClick={onSubmit}>Entrar</button>
      <button className="ghost" onClick={onBack}>Volver</button>
    </Shell>
  );
}
