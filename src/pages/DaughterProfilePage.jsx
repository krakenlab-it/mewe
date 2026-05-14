import { ConsentBox, Field, Shell } from "../components/ui";
import { DAUGHTER_ASSENT_PARAGRAPHS } from "../data/content";

export function DaughterProfilePage({ form, setForm, onSubmit }) {
  return (
    <Shell>
      <h2>¿Cómo te llamas? 🌱</h2>
      <Field label="Nombre o apodo">
        <input
          value={form.hijaNombre || ""}
          onChange={(e) => setForm((f) => ({ ...f, hijaNombre: e.target.value }))}
          placeholder="Tu nombre o apodo"
        />
      </Field>
      <ConsentBox>
        <h4>Antes de empezar, dos cosas importantes</h4>
        {DAUGHTER_ASSENT_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph.title}>
            <strong>{paragraph.title}</strong> {paragraph.text}
          </p>
        ))}
        <label>
          <input
            type="checkbox"
            checked={!!form.hijaAcepta}
            onChange={(e) => setForm((f) => ({ ...f, hijaAcepta: e.target.checked }))}
          />
          Entiendo y quiero empezar.
        </label>
      </ConsentBox>
      <button onClick={onSubmit}>Sigamos</button>
    </Shell>
  );
}
