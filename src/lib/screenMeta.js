export const SCREEN_TITLES = {
  boot: "Cargando",
  boot_error: "Error de conexión",
  cover: "Inicio",
  role: "Elegir rol",
  mother_access: "Acceso madre",
  mother_create: "Crear cuenta",
  mother_login: "Retomar sesión",
  mother_code: "Código de dupla",
  daughter_access: "Acceso hija",
  daughter_profile: "Perfil hija",
  dashboard_mother: "Dashboard madre",
  dashboard_daughter: "Dashboard hija",
  test: "Test Me We",
  report_individual: "Reporte individual",
  report_comparative: "Mapa comparativo",
  admin_login: "Acceso facilitadora",
  admin_dashboard: "Dashboard facilitadora",
  crisis: "Recursos de apoyo",
  policy: "Política y consentimiento",
};

export function getScreenTitle(screen) {
  return SCREEN_TITLES[screen] || "Plataforma";
}
