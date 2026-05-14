import { PageHeader, RoleCard, Shell } from "../components/ui";

export function RolePage({ onMother, onDaughter, onAdmin }) {
  return (
    <Shell>
      <PageHeader
        eyebrow="Acceso"
        title="¿Quién entra?"
        text="Cada rol tiene una experiencia distinta, con el mismo código de dupla como hilo conductor."
      />
      <div className="role-grid">
        <RoleCard badge="01" title="Soy mamá" text="Crear cuenta o retomar con código." onClick={onMother} />
        <RoleCard badge="02" title="Soy hija" text="Entrar con el código de mamá." onClick={onDaughter} />
        <RoleCard badge="03" title="Soy facilitadora / admin" text="Dashboard de duplas y métricas." onClick={onAdmin} />
      </div>
    </Shell>
  );
}
