import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function RateLimitStats({ endpointStats }) {
  const data = endpointStats.map((ep) => ({
    endpoint: ep.endpoint,
    avgLatencyMs: ep.avgLatencyMs
  }));

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Avg Latency per Endpoint (ms)</h2>
      {data.length === 0 ? (
        <p style={styles.empty}>No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="endpoint" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value}ms`, "Avg Latency"]} />
            <Bar dataKey="avgLatencyMs" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill="#10b981" />
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