export default function ServiceStatus({ recentRequests }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Recent Requests</h2>
      {recentRequests.length === 0 ? (
        <p style={styles.empty}>No requests yet</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              {["Time", "Method", "Endpoint", "Status", "Latency", "User"].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((req, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>
                  {new Date(req.timestamp).toLocaleTimeString()}
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: methodColor(req.method) }}>
                    {req.method}
                  </span>
                </td>
                <td style={styles.td}>{req.endpoint}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: statusColor(req.statusCode) }}>
                    {req.statusCode}
                  </span>
                </td>
                <td style={styles.td}>{req.latencyMs}ms</td>
                <td style={styles.td}>{req.userId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const methodColor = (method) => {
  const colors = { GET: "#3b82f6", POST: "#10b981", PUT: "#f59e0b", DELETE: "#ef4444" };
  return colors[method] || "#6b7280";
};

const statusColor = (code) => {
  if (code < 300) return "#10b981";
  if (code < 400) return "#f59e0b";
  return "#ef4444";
};

const styles = {
  card: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 },
  title: { fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "#111827" },
  empty: { fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 12px", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e5e7eb" },
  td: { padding: "10px 12px", color: "#374151" },
  rowEven: { background: "#ffffff" },
  rowOdd: { background: "#f9fafb" },
  badge: { color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }
};