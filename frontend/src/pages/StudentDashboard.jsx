import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";
import { STATUS, STATUS_LABELS, STATUS_COLORS } from "../utils/constants";

export default function StudentDashboard() {
  const { contract, user } = useWeb3();
  const [professors, setProfessors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadData = useCallback(async () => {
    if (!contract) return;
    setFetching(true);
    try {
      const profs = await contract.getAllProfessors();
      setProfessors(profs);

      if (user) {
        const recs = await contract.getStudentRecommendations(user.id);
        setRecommendations(recs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [contract, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleRequest(e) {
    e.preventDefault();
    if (!contract || !selectedProfessor || !title) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const tx = await contract.requestRecommendation(
        Number(selectedProfessor),
        title
      );
      await tx.wait();
      setSuccess("Recommendation requested successfully!");
      setTitle("");
      setSelectedProfessor("");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div style={styles.wrapper}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Student Dashboard</h2>
      <p style={styles.welcome}>Welcome, {user?.name}</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Request Recommendation</h3>
          <form onSubmit={handleRequest}>
            <div style={styles.field}>
              <label style={styles.label}>Professor</label>
              <select
                style={styles.select}
                value={selectedProfessor}
                onChange={(e) => setSelectedProfessor(e.target.value)}
                required
              >
                <option value="">Select a professor</option>
                {professors.map((p) => (
                  <option key={p.id} value={Number(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Blockchain Course LOR"
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "Submitting..." : "Request Recommendation"}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>My Recommendations</h3>
          {recommendations.length === 0 ? (
            <p style={styles.empty}>
              No recommendations yet. Request one from a professor.
            </p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec) => (
                    <tr key={rec.id}>
                      <td style={styles.td}>{Number(rec.id)}</td>
                      <td style={styles.td}>{rec.title}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            background: STATUS_COLORS[Number(rec.status)] || "#94a3b8",
                          }}
                        >
                          {STATUS_LABELS[Number(rec.status)] || "Unknown"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {new Date(Number(rec.createdAt) * 1000).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", justifyContent: "center", padding: 60, color: "#64748b" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
  pageTitle: { margin: 0, color: "#0f172a" },
  welcome: { color: "#64748b", margin: "4px 0 24px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  cardTitle: { margin: "0 0 16px", color: "#0f172a", fontSize: 16 },
  field: { marginBottom: 14 },
  label: { display: "block", marginBottom: 4, fontSize: 13, color: "#475569", fontWeight: 500 },
  input: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    fontSize: 13,
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    fontSize: 13,
    background: "#fff",
    boxSizing: "border-box",
  },
  error: { color: "#ef4444", fontSize: 12, margin: "8px 0" },
  success: { color: "#16a34a", fontSize: 12, margin: "8px 0" },
  btn: {
    width: "100%",
    padding: "10px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  empty: { color: "#94a3b8", fontSize: 14, textAlign: "center", padding: 20 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e2e8f0", color: "#64748b" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f1f5f9" },
  statusBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 12,
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
  },
};
