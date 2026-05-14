import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const LABELS = ["Seguridad", "Regulación", "Presencia", "Validación", "Apertura", "Calma", "Sin presión", "Conexión familiar"];

function toDataset(indices) {
  return [
    indices.seguridad || 0,
    indices.regulacion || 0,
    indices.presencia || 0,
    indices.validacion || 0,
    indices.apertura || 0,
    100 - (indices.saturacion || 0),
    100 - (indices.presion_social || 0),
    indices.conexion_familiar || 0,
  ];
}

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: { display: false },
    },
  },
};

export function RadarIndividual({ indices, label, color }) {
  const data = {
    labels: LABELS,
    datasets: [{
      label,
      data: toDataset(indices),
      backgroundColor: `${color}2e`,
      borderColor: color,
      borderWidth: 2,
      pointBackgroundColor: color,
      pointRadius: 4,
    }],
  };
  return <Radar data={data} options={{ ...OPTIONS, plugins: { legend: { display: false } } }} />;
}

export function RadarComparativo({ madre, hija }) {
  const data = {
    labels: LABELS,
    datasets: [
      {
        label: "Madre",
        data: toDataset(madre),
        backgroundColor: "rgba(192,87,60,0.2)",
        borderColor: "#C0573C",
        borderWidth: 2,
        pointBackgroundColor: "#C0573C",
      },
      {
        label: "Hija",
        data: toDataset(hija),
        backgroundColor: "rgba(122,140,93,0.2)",
        borderColor: "#7A8C5D",
        borderWidth: 2,
        pointBackgroundColor: "#7A8C5D",
      },
    ],
  };
  return <Radar data={data} options={OPTIONS} />;
}
