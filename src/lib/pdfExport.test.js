import { beforeEach, describe, expect, it, vi } from "vitest";

const save = vi.fn();
const addImage = vi.fn();
const addPage = vi.fn();

vi.mock("html2canvas", () => ({
  default: vi.fn(async () => ({
    width: 800,
    height: 1200,
    toDataURL: () => "data:image/jpeg;base64,fake",
  })),
}));

vi.mock("jspdf", () => ({
  jsPDF: vi.fn(function MockJsPDF() {
    return {
      addImage,
      addPage,
      save,
    };
  }),
}));


import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { downloadElementAsPdf } from "./pdfExport";

describe("pdfExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="reporte-individual-contenido">Reporte</div>';
  });

  it("renders element to pdf and saves file", async () => {
    await downloadElementAsPdf("reporte-individual-contenido", "MeWe_madre_individual.pdf");

    expect(html2canvas).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ backgroundColor: "#FBF5EE", scale: 1.6 }),
    );
    expect(jsPDF).toHaveBeenCalledWith("p", "mm", "a4");
    expect(addImage).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith("MeWe_madre_individual.pdf");
  });

  it("paginates tall content across multiple pages", async () => {
    html2canvas.mockResolvedValueOnce({
      width: 800,
      height: 4000,
      toDataURL: () => "data:image/jpeg;base64,tall",
    });

    await downloadElementAsPdf("reporte-individual-contenido", "tall.pdf");

    expect(addPage).toHaveBeenCalled();
  });
});
