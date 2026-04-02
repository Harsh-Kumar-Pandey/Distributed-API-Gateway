import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function RequestChart({ endpointStats }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Requests per Endpoint</h2>
      {endpointStats.length === 0 ? (
        <p style={styles.empty}>No data yet — hit some gateway routes</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={endpointStats} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="endpoint" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => [value, name === "count" ? "Requests" : name]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {endpointStats.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const styles = {
  card: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 },
  title: { fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "#111827" },
  empty: { fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }
};