import { ConsentBox, Field, PageHeader, Panel, Shell } from "../components/ui";
import { MOTHER_CONSENT_PARAGRAPHS } from "../data/content";

export function MotherCreatePage({ form, setForm, onSubmit, onBack }) {
  return (
    <Shell>
      <PageHeader
        eyebrow="Crear dupla"
        title="Vamos a crear tu cuenta"
        text="Solo pedimos lo necesario para sostener la experiencia del taller."
      />
      <Panel>
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
      </Panel>
      <ConsentBox>
        <h4>Antes de continuar, lee esto con calma</h4>
        <div className="consent-scroll">
          {MOTHER_CONSENT_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.title}>
              <strong>{paragraph.title}</strong> {paragraph.text}
            </p>
          ))}
        </div>
        <label>
          <input
            type="checkbox"
            checked={!!form.acepta}
            onChange={(e) => setForm((f) => ({ ...f, acepta: e.target.checked }))}
          />
          He leído y acepto las condiciones de uso. Autorizo el procesamiento de mis datos y los de mi hija para los fines descritos.
        </label>
        <label>
          <input
            type="checkbox"
            checked={!!form.mayor}
            onChange={(e) => setForm((f) => ({ ...f, mayor: e.target.checked }))}
          />
          Soy mayor de 18 años y tengo autoridad legal sobre mi hija.
        </label>
      </ConsentBox>
      <div className="actions">
        <button onClick={onSubmit}>Crear cuenta y código de dupla</button>
        <button className="ghost" onClick={onBack}>Volver</button>
      </div>
    </Shell>
  );
}
