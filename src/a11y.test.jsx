import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { CoverPage } from "./pages/CoverPage";
import { RolePage } from "./pages/RolePage";
import { TestPage } from "./pages/TestPage";
import { PREGUNTAS } from "./data/questions";
import { LoadingState } from "./components/ui";
import { AccessibleDialog } from "./components/AccessibleDialog";

describe("accessibility", () => {
  it("cover page has no detectable axe violations", async () => {
    const { container } = render(<CoverPage onEnter={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("role page has no detectable axe violations", async () => {
    const { container } = render(
      <RolePage onMother={() => {}} onDaughter={() => {}} onAdmin={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("test page exposes progress and labeled scale controls", async () => {
    const { container } = render(
      <TestPage
        rol="madre"
        pregunta={PREGUNTAS.madre[0]}
        index={0}
        total={PREGUNTAS.madre.length}
        onAnswer={() => {}}
        onPause={() => {}}
        onBack={() => {}}
      />,
    );

    expect(container.querySelector('[role="progressbar"]')).toBeTruthy();
    expect(container.querySelectorAll(".scale-btn[aria-label]")).toHaveLength(5);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("loading state announces busy status", () => {
    const { container } = render(<LoadingState />);
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it("accessible dialog exposes alertdialog semantics", () => {
    const { getByRole } = render(
      <AccessibleDialog
        dialog={{
          type: "confirm",
          title: "Confirmar",
          message: "¿Seguro?",
          resolve: () => {},
        }}
        onResolve={() => {}}
      />,
    );

    expect(getByRole("alertdialog")).toBeInTheDocument();
  });
});
