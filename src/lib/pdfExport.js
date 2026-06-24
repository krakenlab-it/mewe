import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;

export async function downloadElementAsPdf(elementId, filename, button = null) {
  const originalText = button?.textContent;
  if (button) {
    button.textContent = "Generando...";
    button.disabled = true;
  }

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento ${elementId} no encontrado`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: "#FBF5EE",
      scale: 1.6,
      useCORS: true,
      logging: false,
    });

    const imgWidth = PAGE_WIDTH_MM;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let remainingHeight = imgHeight;
    let position = 0;
    const pdf = new jsPDF("p", "mm", "a4");
    const imageData = canvas.toDataURL("image/jpeg", 0.92);

    pdf.addImage(imageData, "JPEG", 0, position, imgWidth, imgHeight);
    remainingHeight -= PAGE_HEIGHT_MM;

    while (remainingHeight > 0) {
      position = remainingHeight - imgHeight;
      pdf.addPage();
      pdf.addImage(imageData, "JPEG", 0, position, imgWidth, imgHeight);
      remainingHeight -= PAGE_HEIGHT_MM;
    }

    pdf.save(filename);
  } catch (error) {
    window.alert("Hubo un problema generando el PDF.");
    console.error(error);
  } finally {
    if (button) {
      button.textContent = originalText;
      button.disabled = false;
    }
  }
}
