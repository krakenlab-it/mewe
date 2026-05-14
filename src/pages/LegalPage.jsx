import { Shell, TopBar } from "../components/ui";
import { POLICY_SUMMARY } from "../data/content";

export function LegalPage({ onBack }) {
  return (
    <Shell>
      <TopBar title="Política de privacidad y términos" onBack={onBack} />
      <p className="muted">Versión 1.0</p>
      <ul>
        {POLICY_SUMMARY.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </Shell>
  );
}
