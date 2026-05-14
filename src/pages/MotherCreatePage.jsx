import { ConsentBox, Field, Shell } from "../components/ui";

export function MotherCreatePage({ form, setForm, onSubmit, onBack }) {
  return (
    <Shell>
      <h2>Vamos a crear tu cuenta</h2>
      <Field label="¿Cómo quieres que te llame?">
        <input
          value={form.nombre || ""}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          placeholder="Tu nombre o apodo"
        />
      </Field>
      <Field label="¿Qué edad tiene tu hija?">
        <select
          value={form.edadHija || "11-12"}
          onChange={(e) => setForm((f) => ({ ...f, edadHija: e.target.value }))}
        >
          <option value="9-10">9-10 años</option>
          <option value="11-12">11-12 años</option>
          <option value="13-14">13-14 años</option>
        </select>
      </Field>
      <Field label="Código del taller (opcional)">
        <input
          value={form.taller || ""}
          onChange={(e) => setForm((f) => ({ ...f, taller: e.target.value }))}
          placeholder="Si te dieron uno"
        />
      </Field>
      <ConsentBox>
        <p>Me We es una herramienta experiencial, no un servicio de salud mental ni diagnóstico clínico.</p>
        <label>
          <input
            type="checkbox"
            checked={!!form.acepta}
            onChange={(e) => setForm((f) => ({ ...f, acepta: e.target.checked }))}
          />
          He leído y acepto las condiciones de uso.
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={!!form.mayor}
            onChange={(e) => setForm((f) => ({ ...f, mayor: e.target.checked }))}
          />
          Soy mayor de 18 años y tengo autoridad legal sobre mi hija.
        </label>
      </ConsentBox>
      <button onClick={onSubmit}>Crear cuenta y código de dupla</button>
      <button className="ghost" onClick={onBack}>Volver</button>
    </Shell>
  );
}
