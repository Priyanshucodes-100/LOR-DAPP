import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";

export default function AdminDashboard() {
  const { contract, user } = useWeb3();
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  const loadData = useCallback(async () => {
    if (!contract) return;
    setFetching(true);
    try {
      const [studs, profs] = await Promise.all([
        contract.getAllStudents(),
        contract.getAllProfessors(),
      ]);
      setStudents(studs);
      setProfessors(profs);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [contract]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleToggleActive(userId, currentlyActive) {
    setLoading(true);
    setActionMsg(null);
    try {
      const tx = currentlyActive
        ? await contract.deactivateUser(userId)
        : await contract.activateUser(userId);
      await tx.wait();
      setActionMsg(
        currentlyActive
          ? `User #${userId} deactivated`
          : `User #${userId} activated`
      );
      await loadData();
    } catch (err) {
      setActionMsg(`Error: ${err.message}`);
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
      <h2 style={styles.title}>Admin Dashboard</h2>
      <p style={styles.subtitle}>Welcome, {user?.name}</p>

      {actionMsg && (
        <p
          style={{
            ...styles.msg,
            color: actionMsg.startsWith("Error") ? "#ef4444" : "#16a34a",
            background: actionMsg.startsWith("Error") ? "#fef2f2" : "#f0fdf4",
          }}
        >
          {actionMsg}
        </p>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            Students ({students.length})
          </h3>
          {students.length === 0 ? (
            <p style={styles.empty}>No students registered.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Active</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td style={styles.td}>{Number(s.id)}</td>
                    <td style={styles.td}>{s.name}</td>
                    <td style={styles.td}>{s.email}</td>
                    <td style={styles.td}>
                      {s.isActive ? (
                        <span style={styles.active}>Active</span>
                      ) : (
                        <span style={styles.inactive}>Inactive</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() =>
                          handleToggleActive(Number(s.id), s.isActive)
                        }
                        disabled={loading}
                        style={
                          s.isActive ? styles.deactivateBtn : styles.activateBtn
                        }
                      >
                        {s.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            Professors ({professors.length})
          </h3>
          {professors.length === 0 ? (
            <p style={styles.empty}>No professors registered.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Active</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {professors.map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>{Number(p.id)}</td>
                    <td style={styles.td}>{p.name}</td>
                    <td style={styles.td}>{p.email}</td>
                    <td style={styles.td}>
                      {p.isActive ? (
                        <span style={styles.active}>Active</span>
                      ) : (
                        <span style={styles.inactive}>Inactive</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() =>
                          handleToggleActive(Number(p.id), p.isActive)
                        }
                        disabled={loading}
                        style={
                          p.isActive ? styles.deactivateBtn : styles.activateBtn
                        }
                      >
                        {p.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", justifyContent: "center", padding: 60, color: "#64748b" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
  title: { margin: 0, color: "#0f172a" },
  subtitle: { color: "#64748b", margin: "4px 0 24px" },
  msg: { padding: "10px 14px", borderRadius: 6, fontSize: 13, marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  cardTitle: { margin: "0 0 12px", color: "#0f172a", fontSize: 15 },
  empty: { textAlign: "center", color: "#94a3b8", padding: 20, fontSize: 13 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e2e8f0", color: "#64748b" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f1f5f9" },
  active: { color: "#22c55e", fontWeight: 600, fontSize: 11 },
  inactive: { color: "#ef4444", fontWeight: 600, fontSize: 11 },
  deactivateBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
  },
  activateBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
  },
};
