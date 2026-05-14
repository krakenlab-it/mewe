import { RoleCard, Shell } from "../components/ui";

export function RolePage({ onMother, onDaughter, onAdmin }) {
  return (
    <Shell>
      <h2>¿Quién entra?</h2>
      <p>Elige tu rol. Cada una tiene una vista distinta de la plataforma.</p>
      <RoleCard title="Soy mamá" text="Crear cuenta o retomar con código." onClick={onMother} />
      <RoleCard title="Soy hija" text="Entrar con el código de mamá." onClick={onDaughter} />
      <RoleCard title="Soy facilitadora / admin" text="Dashboard de duplas y métricas." onClick={onAdmin} />
    </Shell>
  );
}
