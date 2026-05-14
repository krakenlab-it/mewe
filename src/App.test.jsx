import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { PREGUNTAS } from "./data/questions";

const pairs = new Map();
let isAdmin = false;
let freshAnonymousCalls = 0;

function clone(value) {
  return structuredClone(value);
}

function createMockStorage() {
  return {
    mode: "test",
    guardarDupla: vi.fn(async (codigo, data) => {
      pairs.set(codigo, clone(data));
    }),
    cargarDupla: vi.fn(async (codigo) => {
      const pair = pairs.get(codigo);
      return pair ? clone(pair) : null;
    }),
    eliminarDupla: vi.fn(async (codigo) => {
      pairs.delete(codigo);
    }),
    listarDuplas: vi.fn(async () => Array.from(pairs.values()).map(clone)),
    claimPairAccess: vi.fn(async (codigo) => {
      if (!pairs.has(codigo)) throw new Error("Pair code not found");
    }),
    startFreshAnonymousSession: vi.fn(async () => {
      freshAnonymousCalls += 1;
    }),
    loginAdmin: vi.fn(async (email, password) => {
      if (!email || !password) throw new Error("Credenciales inválidas");
      isAdmin = true;
    }),
    isAdminSession: vi.fn(async () => isAdmin),
    logout: vi.fn(async () => {
      isAdmin = false;
    }),
    seedQuestionBank: vi.fn(async () => 48),
  };
}

vi.mock("./lib/storageAdapter", () => ({
  createStorageAdapter: vi.fn(async () => ({
    storage: createMockStorage(),
    client: null,
  })),
}));

vi.mock("./components/RadarChart", () => ({
  RadarIndividual: () => <div data-testid="radar-individual" />,
  RadarComparativo: () => <div data-testid="radar-comparativo" />,
}));

async function openApp() {
  render(<App />);
  await screen.findByText(/Una lectura clara del vínculo madre-hija/i);
}

async function clickByName(name) {
  await userEvent.click(screen.getByRole("button", { name }));
}

async function answerAllQuestions(total) {
  for (let i = 0; i < total; i += 1) {
    await screen.findByText(new RegExp(`Pregunta ${i + 1} de ${total}`));
    const answer = screen
      .getAllByRole("button")
      .find((button) => button.textContent.includes("Mucho"));
    expect(answer).toBeTruthy();
    await userEvent.click(answer);
  }
}

async function createMotherPair() {
  await clickByName(/Entrar a la plataforma/i);
  await clickByName(/Soy mamá/i);
  await clickByName(/Es mi primera vez/i);

  await userEvent.type(screen.getByLabelText(/Cómo quieres que te llame/i), "Ana");
  await userEvent.selectOptions(screen.getByLabelText(/Qué edad tiene tu hija/i), "11-12");
  await userEvent.type(screen.getByLabelText(/Código del taller/i), "TALLER-1");
  await userEvent.click(screen.getByLabelText(/He leído y acepto/i));
  await userEvent.click(screen.getByLabelText(/Soy mayor de 18 años/i));
  await clickByName(/Crear cuenta y código de dupla/i);

  await screen.findByText(/Tu código de dupla/i);
  expect(freshAnonymousCalls).toBeGreaterThan(0);
  const codigo = Array.from(pairs.keys()).at(-1);
  expect(codigo).toHaveLength(6);
  return codigo;
}

async function completeCurrentUserTest(total) {
  await clickByName(/^Empezar$/i);
  await answerAllQuestions(total);
  await screen.findByText(/Tu mapa Me We/i);
}

async function exitToLanding() {
  await clickByName(/Salir/i);
  await screen.findByText(/Una lectura clara del vínculo madre-hija/i);
}

describe("Me We role flows", () => {
  beforeEach(() => {
    pairs.clear();
    isAdmin = false;
    freshAnonymousCalls = 0;
    sessionStorage.clear();
    localStorage.clear();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(window, "confirm").mockImplementation(() => true);
    vi.spyOn(window, "prompt").mockImplementation(() => "BORRAR");
  });

  it("completes mother, daughter, and admin flows successfully", async () => {
    await openApp();

    const codigo = await createMotherPair();
    await clickByName(/Ir al dashboard/i);
    await screen.findByText(/Hola, Ana/i);
    await completeCurrentUserTest(PREGUNTAS.madre.length);
    expect(screen.getByText(/Reporte individual/i)).toBeInTheDocument();
    await exitToLanding();

    await clickByName(/Entrar a la plataforma/i);
    await clickByName(/Soy hija/i);
    await userEvent.type(screen.getByLabelText(/Código que te pasó tu mamá/i), codigo);
    await clickByName(/^Entrar$/i);
    await screen.findByText(/Cómo te llamas/i);
    await userEvent.type(screen.getByLabelText(/Nombre o apodo/i), "Luna");
    await userEvent.click(screen.getByLabelText(/Entiendo y quiero empezar/i));
    await clickByName(/Sigamos/i);
    await screen.findByText(/Hola, Luna/i);
    await completeCurrentUserTest(PREGUNTAS.hija.length);
    expect(screen.getByText(/Reporte individual/i)).toBeInTheDocument();
    await exitToLanding();

    await clickByName(/Entrar a la plataforma/i);
    await clickByName(/Soy mamá/i);
    await clickByName(/Ya tengo un código/i);
    await userEvent.type(screen.getByLabelText(/Código de dupla/i), codigo);
    await clickByName(/^Entrar$/i);
    await screen.findByText(/Comparativo madre-hija/i);
    await clickByName(/Ver mapa comparativo/i);
    await screen.findByText(/Cómo ve cada una el vínculo/i);
    await screen.findByText(/Brechas de percepción/i);
    await screen.findByText(/En el taller/i);
    await exitToLanding();

    await clickByName(/Entrar a la plataforma/i);
    await clickByName(/facilitadora/i);
    await userEvent.type(screen.getByLabelText(/Email/i), "admin@example.com");
    await userEvent.type(screen.getByLabelText(/Contraseña/i), "secret");
    await clickByName(/Entrar al dashboard/i);
    await screen.findByText(/Dashboard Me We/i);
    expect(screen.getByText(/Total duplas/i)).toBeInTheDocument();
    const pairRow = screen.getByText(/Ana \+ Luna/i).closest(".row");
    expect(pairRow).toBeTruthy();
    await userEvent.click(within(pairRow).getByRole("button", { name: /Ver comparativo/i }));
    await screen.findByRole("heading", { name: /Mapa de la dupla/i });
    await screen.findByText(/Brecha promedio/i);
  });
});
