"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

interface DailyPoint {
  date: string; // ISO date (YYYY-MM-DD)
  revenue: number; // naira (not kobo)
  orders: number;
}

interface Props {
  points: DailyPoint[];
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
});

export default function RevenueChart({ points }: Props) {
  const labels = points.map((p) =>
    new Date(p.date).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    }),
  );
  const revenue = points.map((p) => p.revenue);

  const data = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: revenue,
        borderColor: "#B8922A",
        backgroundColor: "rgba(184, 146, 42, 0.12)",
        borderWidth: 1.5,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#B8922A",
        pointHoverBorderColor: "#FAF8F4",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      tooltip: {
        backgroundColor: "#2B2820",
        titleColor: "#F2EDE4",
        bodyColor: "#F2EDE4",
        borderColor: "#B8922A",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => naira.format(Number(ctx.parsed.y ?? 0)),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#7A7669",
          font: { size: 10 },
          maxRotation: 0,
          autoSkipPadding: 20,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(43, 40, 32, 0.06)" },
        ticks: {
          color: "#7A7669",
          font: { size: 10 },
          callback: (v) => {
            const n = Number(v);
            if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
            if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
            return String(n);
          },
        },
      },
    },
  };

  return (
    <div className="h-64 md:h-72">
      <Line data={data} options={options} />
    </div>
  );
}
