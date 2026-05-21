import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";
import { STATUS, STATUS_LABELS, STATUS_COLORS } from "../utils/constants";

export default function ProfessorDashboard() {
  const { contract, user } = useWeb3();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");

  const loadData = useCallback(async () => {
    if (!contract || !user) return;
    setFetching(true);
    try {
      const recs = await contract.getProfessorRecommendations(user.id);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [contract, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleApprove(recId) {
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.approveRecommendation(recId);
      await tx.wait();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(recId) {
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.rejectRecommendation(recId);
      await tx.wait();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(recId) {
    if (!ipfsHash.trim()) return;
    setSubmitting(recId);
    setError(null);
    try {
      const tx = await contract.submitRecommendation(recId, ipfsHash.trim());
      await tx.wait();
      setIpfsHash("");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(null);
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
      <h2 style={styles.pageTitle}>Professor Dashboard</h2>
      <p style={styles.welcome}>Welcome, {user?.name}</p>

      {error && <p style={styles.error}>{error}</p>}

      {recommendations.length === 0 ? (
        <p style={styles.empty}>No recommendations received yet.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec) => (
                <tr key={rec.id}>
                  <td style={styles.td}>{Number(rec.id)}</td>
                  <td style={styles.td}>Student #{Number(rec.studentId)}</td>
                  <td style={styles.td}>{rec.title}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        background: STATUS_COLORS[Number(rec.status)] || "#94a3b8",
                      }}
                    >
                      {STATUS_LABELS[Number(rec.status)]}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(Number(rec.createdAt) * 1000).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    {Number(rec.status) === 0 && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleApprove(Number(rec.id))}
                          disabled={loading}
                          style={styles.approveBtn}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(Number(rec.id))}
                          disabled={loading}
                          style={styles.rejectBtn}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {Number(rec.status) === 1 && (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                          style={styles.ipfsInput}
                          placeholder="IPFS hash"
                          value={ipfsHash}
                          onChange={(e) => setIpfsHash(e.target.value)}
                        />
                        <button
                          onClick={() => handleSubmit(Number(rec.id))}
                          disabled={submitting === Number(rec.id)}
                          style={styles.submitBtn}
                        >
                          {submitting === Number(rec.id) ? "..." : "Submit"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", justifyContent: "center", padding: 60, color: "#64748b" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
  pageTitle: { margin: 0, color: "#0f172a" },
  welcome: { color: "#64748b", margin: "4px 0 24px" },
  error: { color: "#ef4444", fontSize: 13, marginBottom: 16, padding: "8px 12px", background: "#fef2f2", borderRadius: 6 },
  empty: { textAlign: "center", color: "#94a3b8", padding: 40, fontSize: 15 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "10px 12px", borderBottom: "2px solid #e2e8f0", color: "#64748b" },
  td: { padding: "12px", borderBottom: "1px solid #f1f5f9" },
  statusBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 12,
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
  },
  approveBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "5px 14px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  rejectBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "5px 14px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  submitBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "5px 14px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  ipfsInput: {
    padding: "5px 8px",
    border: "1px solid #cbd5e1",
    borderRadius: 4,
    fontSize: 12,
    width: 140,
  },
};
