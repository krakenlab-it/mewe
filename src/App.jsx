import { useEffect, useMemo, useState } from "react";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { ComparativeReportPage } from "./pages/ComparativeReportPage";
import { CoverPage } from "./pages/CoverPage";
import { CrisisPage } from "./pages/CrisisPage";
import { DashboardDaughterPage } from "./pages/DashboardDaughterPage";
import { DashboardMotherPage } from "./pages/DashboardMotherPage";
import { DaughterAccessPage } from "./pages/DaughterAccessPage";
import { DaughterProfilePage } from "./pages/DaughterProfilePage";
import { IndividualReportPage } from "./pages/IndividualReportPage";
import { LegalPage } from "./pages/LegalPage";
import { MotherAccessPage } from "./pages/MotherAccessPage";
import { MotherCodePage } from "./pages/MotherCodePage";
import { MotherCreatePage } from "./pages/MotherCreatePage";
import { MotherLoginPage } from "./pages/MotherLoginPage";
import { RolePage } from "./pages/RolePage";
import { TestPage } from "./pages/TestPage";
import { PREGUNTAS } from "./data/questions";
import {
  buildDimCard,
  calcularBrechas,
  calcularIndices,
  clasificarCuadrante,
  generarCodigo,
  interpretarBrechaPromedio,
  nuevaDuplaVacia,
  ordenarDimensionesPorBrecha,
  sortDimsByZone,
} from "./lib/scoring";
import { clearSession, getSavedSession, saveSession, setAdminSession } from "./lib/session";
import { createStorageAdapter } from "./lib/storageAdapter";

const QUESTION_BANK_VERSION = "v1";

export default function App() {
  const [screen, setScreen] = useState("boot");
  const [storage, setStorage] = useState(null);
  const [session, setSession] = useState({ rol: null, codigo: null });
  const [dupla, setDupla] = useState(null);
  const [duplasAdmin, setDuplasAdmin] = useState([]);
  const [form, setForm] = useState({});
  const [testIndex, setTestIndex] = useState(0);
  const [reportCards, setReportCards] = useState([]);
  const [reportCuadrante, setReportCuadrante] = useState(null);
  const [reportRole, setReportRole] = useState("madre");
  const [comparativeBrechas, setComparativeBrechas] = useState({});
  const [comparativeMeta, setComparativeMeta] = useState(null);
  const [lastMainScreen, setLastMainScreen] = useState("cover");

  const testQuestions = useMemo(
    () => PREGUNTAS[session.rol === "madre" ? "madre" : "hija"] || [],
    [session.rol],
  );

  useEffect(() => {
    let disposed = false;

    async function bootstrap() {
      const adapterPayload = await createStorageAdapter();
      if (disposed) return;
      setStorage(adapterPayload.storage);

      const isAdmin = await adapterPayload.storage.isAdminSession();
      if (isAdmin) {
        await seedQuestionBank(adapterPayload.storage);
        const all = await adapterPayload.storage.listarDuplas();
        if (disposed) return;
        setDuplasAdmin(all);
        setScreen("admin_dashboard");
        return;
      }

      const saved = getSavedSession();
      if (!saved) {
        setScreen("cover");
        return;
      }

      try {
        if (saved.rol === "madre" || saved.rol === "hija") {
          await adapterPayload.storage.claimPairAccess(saved.codigo, saved.rol);
        }
        const pair = await adapterPayload.storage.cargarDupla(saved.codigo);
        if (!pair) {
          clearSession();
          setScreen("cover");
          return;
        }
        setSession(saved);
        setDupla(pair);
        setScreen(saved.rol === "madre" ? "dashboard_mother" : "dashboard_daughter");
      } catch (_e) {
        clearSession();
        setScreen("cover");
      }
    }

    bootstrap();
    return () => {
      disposed = true;
    };
  }, []);

  async function seedQuestionBank(adapter) {
    if (!adapter?.seedQuestionBank) return;
    try {
      const motherQuestions = PREGUNTAS.madre.map((q, idx) => ({ ...q, sort_order: idx + 1 }));
      const daughterQuestions = PREGUNTAS.hija.map((q, idx) => ({ ...q, sort_order: idx + 1 }));
      await adapter.seedQuestionBank("mother_v1", QUESTION_BANK_VERSION, motherQuestions);
      await adapter.seedQuestionBank("daughter_v1", QUESTION_BANK_VERSION, daughterQuestions);
    } catch (_e) {
      // non-blocking in admin bootstrap
    }
  }

  async function logout() {
    setScreen("cover");
    setLastMainScreen("cover");
    clearSession();
    setSession({ rol: null, codigo: null });
    setDupla(null);
    setDuplasAdmin([]);
    setForm({});
    setComparativeMeta(null);
    setComparativeBrechas({});
    setAdminSession(false);

    try {
      if (storage?.logout) await storage.logout();
    } catch (_e) {
      // The UI has already left the authenticated area.
    }
  }

  async function createMother() {
    if (!storage) return;
    const nombre = (form.nombre || "").trim();
    const edadHija = form.edadHija || "11-12";
    const taller = (form.taller || "").trim() || null;
    if (!nombre) return window.alert("Necesito un nombre o apodo");
    if (!form.acepta || !form.mayor) return window.alert("Marca las dos casillas de consentimiento.");

    try {
      await storage.startFreshAnonymousSession?.();

      const codigo = generarCodigo();
      const payload = nuevaDuplaVacia();
      payload.codigo = codigo;
      payload.taller = taller;
      payload.madre.nombre = nombre;
      payload.madre.edadHija = edadHija;
      payload.madre.consentimiento = { aceptadoEn: new Date().toISOString(), version: "1.0" };

      await storage.guardarDupla(codigo, payload);
      await storage.claimPairAccess(codigo, "madre");
      saveSession("madre", codigo);
      setSession({ rol: "madre", codigo });
      setDupla(payload);
      setScreen("mother_code");
    } catch (e) {
      window.alert(e.message || "No pudimos crear la dupla. Intenta de nuevo.");
    }
  }

  async function resumeMother() {
    if (!storage) return;
    const codigo = (form.codigo || "").trim().toUpperCase();
    if (codigo.length !== 6) return window.alert("El código tiene 6 caracteres");
    try {
      await storage.claimPairAccess(codigo, "madre");
      const pair = await storage.cargarDupla(codigo);
      if (!pair?.madre?.nombre) throw new Error("Este código no fue creado por una madre");
      saveSession("madre", codigo);
      setSession({ rol: "madre", codigo });
      setDupla(pair);
      setScreen("dashboard_mother");
    } catch (e) {
      window.alert(e.message || "No encontramos ese código");
    }
  }

  async function daughterEnter() {
    if (!storage) return;
    const codigo = (form.codigo || "").trim().toUpperCase();
    if (codigo.length !== 6) return window.alert("El código tiene 6 caracteres");
    try {
      await storage.claimPairAccess(codigo, "hija");
      const pair = await storage.cargarDupla(codigo);
      if (!pair) throw new Error("No encontramos ese código");
      saveSession("hija", codigo);
      setSession({ rol: "hija", codigo });
      setDupla(pair);
      setScreen(pair.hija?.nombre ? "dashboard_daughter" : "daughter_profile");
    } catch (e) {
      window.alert(e.message || "No encontramos ese código");
    }
  }

  async function completeDaughterProfile() {
    if (!storage || !dupla) return;
    const nombre = (form.hijaNombre || "").trim();
    if (!nombre) return window.alert("Pon tu nombre o apodo");
    if (!form.hijaAcepta) return window.alert("Marca la casilla para continuar.");
    const next = structuredClone(dupla);
    next.hija.nombre = nombre;
    next.hija.consentimiento = { aceptadoEn: new Date().toISOString(), version: "1.0" };
    await storage.guardarDupla(session.codigo, next);
    setDupla(next);
    setScreen("dashboard_daughter");
  }

  function startTest() {
    if (!dupla) return;
    const persona = session.rol === "madre" ? dupla.madre : dupla.hija;
    setTestIndex(persona.preguntaIdx || 0);
    setScreen("test");
  }

  async function answerQuestion(valor) {
    if (!dupla || !storage) return;
    const role = session.rol === "madre" ? "madre" : "hija";
    const q = testQuestions[testIndex];
    if (!q) return;

    const next = structuredClone(dupla);
    const persona = next[role];
    persona.respuestas[q.id] = valor;
    const nextIdx = testIndex + 1;
    persona.preguntaIdx = nextIdx;

    if (nextIdx >= testQuestions.length) {
      persona.completado = true;
      persona.fechaCompletado = new Date().toISOString();
      persona.indices = calcularIndices(role, persona.respuestas);
      await storage.guardarDupla(session.codigo, next);
      setDupla(next);
      buildIndividualReport(role, next[role]);
      setScreen("report_individual");
      return;
    }

    await storage.guardarDupla(session.codigo, next);
    setDupla(next);
    setTestIndex(nextIdx);
  }

  function buildIndividualReport(role, persona) {
    const indices = persona.indices || {};
    const dims = sortDimsByZone(indices);
    setReportCards(dims.map((dim) => buildDimCard(dim, indices)));
    setReportCuadrante(clasificarCuadrante(indices));
    setReportRole(role);
  }

  async function viewIndividualReport() {
    if (!dupla) return;
    const role = session.rol === "madre" ? "madre" : "hija";
    const persona = dupla[role];
    if (!persona?.indices) return window.alert("Falta calcular el reporte");
    buildIndividualReport(role, persona);
    setScreen("report_individual");
  }

  function viewComparativeReport() {
    if (!dupla?.madre?.completado || !dupla?.hija?.completado) {
      return window.alert("Ambas deben terminar primero");
    }
    buildComparativeReport(dupla);
    setScreen("report_comparative");
  }

  function buildComparativeReport(pair) {
    const brechas = calcularBrechas(pair.madre.indices || {}, pair.hija.indices || {});
    const cuadM = clasificarCuadrante(pair.madre.indices || {});
    const cuadH = clasificarCuadrante(pair.hija.indices || {});
    setComparativeBrechas(brechas);
    setComparativeMeta({
      cuadM,
      cuadH,
      brechaTexto: interpretarBrechaPromedio(brechas.promedio),
      dimsOrdenadas: ordenarDimensionesPorBrecha(brechas),
    });
  }

  async function loginAdmin() {
    if (!storage) return;
    try {
      await storage.loginAdmin(form.adminEmail || "", form.adminPassword || "");
      await seedQuestionBank(storage);
      const all = await storage.listarDuplas();
      setDuplasAdmin(all);
      setScreen("admin_dashboard");
    } catch (e) {
      window.alert(e.message || "No fue posible iniciar sesión admin.");
    }
  }

  async function refreshAdmin() {
    if (!storage) return;
    const all = await storage.listarDuplas();
    setDuplasAdmin(all);
  }

  async function deletePair(codigo) {
    if (!storage) return;
    if (!window.confirm(`¿Borrar permanentemente la dupla ${codigo}?`)) return;
    const token = window.prompt("Para confirmar, escribe BORRAR en mayúsculas:");
    if (token !== "BORRAR") return;
    await storage.eliminarDupla(codigo);
    await refreshAdmin();
  }

  async function openComparativeFromAdmin(codigo) {
    if (!storage) return;
    const pair = await storage.cargarDupla(codigo);
    if (!pair) return;
    setDupla(pair);
    setLastMainScreen("admin_dashboard");
    buildComparativeReport(pair);
    setScreen("report_comparative");
  }

  function openInfoPage(target) {
    setLastMainScreen(screen);
    setScreen(target);
  }

  if (screen === "boot") return null;

  if (screen === "cover") return <CoverPage onEnter={() => setScreen("role")} />;
  if (screen === "role") return <RolePage onMother={() => setScreen("mother_access")} onDaughter={() => setScreen("daughter_access")} onAdmin={() => setScreen("admin_login")} />;
  if (screen === "mother_access") return <MotherAccessPage onCreate={() => setScreen("mother_create")} onResume={() => setScreen("mother_login")} onBack={() => setScreen("role")} />;
  if (screen === "mother_create") return <MotherCreatePage form={form} setForm={setForm} onSubmit={createMother} onBack={() => setScreen("mother_access")} />;
  if (screen === "mother_login") return <MotherLoginPage code={form.codigo || ""} setCode={(value) => setForm((f) => ({ ...f, codigo: value }))} onSubmit={resumeMother} onBack={() => setScreen("mother_access")} />;
  if (screen === "mother_code") return <MotherCodePage codigo={dupla?.codigo} onContinue={() => setScreen("dashboard_mother")} />;
  if (screen === "daughter_access") return <DaughterAccessPage code={form.codigo || ""} setCode={(value) => setForm((f) => ({ ...f, codigo: value }))} onSubmit={daughterEnter} onBack={() => setScreen("role")} />;
  if (screen === "daughter_profile") return <DaughterProfilePage form={form} setForm={setForm} onSubmit={completeDaughterProfile} />;
  if (screen === "dashboard_mother") return <DashboardMotherPage dupla={dupla} onLogout={logout} onStartTest={startTest} onViewReport={viewIndividualReport} onViewComparative={viewComparativeReport} onGoCrisis={() => openInfoPage("crisis")} onGoPolicy={() => openInfoPage("policy")} />;
  if (screen === "dashboard_daughter") return <DashboardDaughterPage dupla={dupla} onLogout={logout} onStartTest={startTest} onViewReport={viewIndividualReport} onGoCrisis={() => openInfoPage("crisis")} onGoPolicy={() => openInfoPage("policy")} />;
  if (screen === "test") return <TestPage rol={session.rol} pregunta={testQuestions[testIndex]} index={testIndex} total={testQuestions.length} onAnswer={answerQuestion} onPause={() => setScreen(session.rol === "madre" ? "dashboard_mother" : "dashboard_daughter")} onBack={() => setScreen(session.rol === "madre" ? "dashboard_mother" : "dashboard_daughter")} />;
  if (screen === "report_individual") return <IndividualReportPage persona={dupla?.[reportRole]} rol={reportRole} cards={reportCards} cuadrante={reportCuadrante} onBack={() => setScreen(reportRole === "madre" ? "dashboard_mother" : "dashboard_daughter")} onLogout={logout} />;
  if (screen === "report_comparative") return <ComparativeReportPage dupla={dupla} brechas={comparativeBrechas} meta={comparativeMeta} onBack={() => setScreen(lastMainScreen.includes("admin") ? "admin_dashboard" : "dashboard_mother")} onLogout={logout} />;
  if (screen === "admin_login") return <AdminLoginPage form={form} setForm={setForm} onSubmit={loginAdmin} onBack={() => setScreen("role")} />;
  if (screen === "admin_dashboard") return <AdminDashboardPage duplas={duplasAdmin} onRefresh={refreshAdmin} onOpenComparative={openComparativeFromAdmin} onDelete={deletePair} onLogout={logout} />;
  if (screen === "crisis") return <CrisisPage onBack={() => setScreen(lastMainScreen)} />;
  if (screen === "policy") return <LegalPage onBack={() => setScreen(lastMainScreen)} />;

  return <CoverPage onEnter={() => setScreen("role")} />;
}
