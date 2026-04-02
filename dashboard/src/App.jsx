import { useState, useEffect } from "react";
import axios from "axios";
import RequestChart from "./components/requestCharts";
import ServiceStatus from "./components/serviceStatus";
import RateLimitStats from "./components/rateLimitStats";

const ANALYTICS_URL = "http://localhost:4000/analytics/stats";

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(ANALYTICS_URL);
      setMetrics(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch metrics:", err.message);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto refresh every 5 seconds
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div style={styles.loading}>
        <p>Connecting to analytics service...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>API Gateway Dashboard</h1>
        <span style={styles.updated}>Last updated: {lastUpdated}</span>
      </div>

      {/* Top stat cards */}
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Requests</p>
          <p style={styles.cardValue}>{metrics.totalRequests}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Errors</p>
          <p style={{ ...styles.cardValue, color: "#ef4444" }}>
            {metrics.totalErrors}
          </p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Success Rate</p>
          <p style={{ ...styles.cardValue, color: "#22c55e" }}>
            {metrics.totalRequests > 0
              ? (
                  ((metrics.totalRequests - metrics.totalErrors) /
                    metrics.totalRequests) *
                  100
                ).toFixed(1)
              : 100}
            %
          </p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Endpoints Active</p>
          <p style={styles.cardValue}>{metrics.endpointStats.length}</p>
        </div>
      </div>

      {/* Charts and stats */}
      <div style={styles.grid}>
        <RequestChart endpointStats={metrics.endpointStats} />
        <RateLimitStats endpointStats={metrics.endpointStats} />
      </div>

      <ServiceStatus recentRequests={metrics.recentRequests} />
    </div>
  );
}

const styles = {
  container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, margin: 0 },
  updated: { fontSize: 13, color: "#6b7280" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  cardRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  card: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 16px" },
  cardLabel: { fontSize: 13, color: "#6b7280", margin: "0 0 8px" },
  cardValue: { fontSize: 28, fontWeight: 700, margin: 0, color: "#111827" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }
};