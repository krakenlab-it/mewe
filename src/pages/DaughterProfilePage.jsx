import { ConsentBox, Field, Shell } from "../components/ui";

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
        <p>
          Lo que respondas lo verá tu mamá (después) y la facilitadora del taller. No lo verá tu colegio ni tus amigas.
        </p>
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
