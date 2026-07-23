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
const KEYS = ["seguridad", "regulacion", "presencia", "validacion", "apertura", "saturacion", "presion_social", "conexion_familiar"];

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

function toRows(indices) {
  return LABELS.map((label, index) => {
    const key = KEYS[index];
    const value = key === "saturacion" || key === "presion_social"
      ? 100 - (indices[key] || 0)
      : indices[key] || 0;
    return { label, value };
  });
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

function ScoreTable({ caption, headers, rows }) {
  return (
    <table className="chart-data-table">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Dimensión</th>
          {headers.map((header) => <th key={header} scope="col">{header}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {row.values.map((value, index) => <td key={`${row.label}-${index}`}>{value}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RadarIndividual({ indices, label, color }) {
  const rows = toRows(indices);
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

  return (
    <figure className="chart-figure" aria-label={`Gráfico radar de ${label}`}>
      <Radar
        data={data}
        options={{ ...OPTIONS, plugins: { legend: { display: false } } }}
        aria-hidden="true"
      />
      <ScoreTable
        caption={`Datos del gráfico radar de ${label}`}
        headers={["Puntuación"]}
        rows={rows.map((row) => ({ label: row.label, values: [row.value] }))}
      />
    </figure>
  );
}

export function RadarComparativo({ madre, hija }) {
  const motherRows = toRows(madre);
  const daughterRows = toRows(hija);
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

  return (
    <figure className="chart-figure" aria-label="Gráfico radar comparativo madre e hija">
      <Radar data={data} options={OPTIONS} aria-hidden="true" />
      <ScoreTable
        caption="Datos comparativos del gráfico radar"
        headers={["Madre", "Hija"]}
        rows={motherRows.map((row, index) => ({
          label: row.label,
          values: [row.value, daughterRows[index].value],
        }))}
      />
    </figure>
  );
}
