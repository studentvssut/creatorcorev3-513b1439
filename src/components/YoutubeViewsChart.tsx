import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function YoutubeViewsChart({ data }) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Total Views Growth</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="metric_date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total_views"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
