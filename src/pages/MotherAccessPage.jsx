import { PageHeader, Panel, Shell } from "../components/ui";

export function MotherAccessPage({ onCreate, onResume, onBack }) {
  return (
    <Shell onBack={onBack}>
      <PageHeader
        eyebrow="Madre"
        title="Hola, mamá"
        text="Puedes crear una dupla nueva o retomar una experiencia ya iniciada."
      />
      <Panel tone="soft">
        <div className="actions stacked">
          <button onClick={onCreate}>Es mi primera vez · crear cuenta</button>
          <button className="secondary" onClick={onResume}>Ya tengo un código · retomar</button>
        </div>
      </Panel>
    </Shell>
  );
}
