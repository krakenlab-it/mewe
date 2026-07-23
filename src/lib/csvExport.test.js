import { describe, expect, it } from "vitest";
import { buildDuplasCsv, csvEscape } from "./csvExport";

describe("csvExport", () => {
  it("escapes strings with quotes and commas", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(42)).toBe("42");
    expect(csvEscape('Ana "Luna"')).toBe('"Ana ""Luna"""');
  });

  it("builds header-only csv for empty list", () => {
    const csv = buildDuplasCsv([]);
    expect(csv.split("\n")).toHaveLength(1);
    expect(csv).toContain("codigo,taller,creada_en");
  });

  it("includes mother and daughter dimension columns", () => {
    const csv = buildDuplasCsv([
      {
        codigo: "ABC123",
        taller: "Taller 1",
        creadaEn: "2026-06-23",
        madre: {
          nombre: "Ana",
          completado: true,
          indices: {
            seguridad: 70,
            regulacion: 65,
            presencia: 60,
            validacion: 55,
            apertura: 50,
            saturacion: 40,
            presion_social: 35,
            conexion_familiar: 80,
            conciencia_relacional: 75,
          },
        },
        hija: {
          nombre: "Luna",
          completado: false,
          indices: {},
        },
      },
    ]);

    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("ABC123");
    expect(lines[1]).toContain('"Ana"');
    expect(lines[1]).toContain(',si,70,');
    expect(lines[1]).toContain('"Luna",no,');
    expect(lines[1]).toContain("75");
  });
});

