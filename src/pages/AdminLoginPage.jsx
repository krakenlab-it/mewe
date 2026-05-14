import { Field, Shell } from "../components/ui";

export function AdminLoginPage({ form, setForm, onSubmit, onBack }) {
  return (
    <Shell>
      <h2>Acceso facilitadora</h2>
      <Field label="Email">
        <input
          type="email"
          value={form.adminEmail || ""}
          onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
          placeholder="facilitadora@taller.com"
        />
      </Field>
      <Field label="Contraseña">
        <input
          type="password"
          value={form.adminPassword || ""}
          onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
        />
      </Field>
      <button onClick={onSubmit}>Entrar al dashboard</button>
      <button className="ghost" onClick={onBack}>Volver</button>
    </Shell>
  );
}
