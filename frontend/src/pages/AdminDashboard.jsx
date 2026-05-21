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
      const [studs, profs] = await Promise.all([contract.getAllStudents(), contract.getAllProfessors()]);
      setStudents(studs);
      setProfessors(profs);
    } catch (err) { console.error(err); } finally { setFetching(false); }
  }, [contract]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleToggle(userId, currentlyActive) {
    setLoading(true);
    setActionMsg(null);
    try {
      const tx = currentlyActive ? await contract.deactivateUser(userId) : await contract.activateUser(userId);
      await tx.wait();
      setActionMsg({ type: "success", text: `User #${userId} ${currentlyActive ? "deactivated" : "activated"}` });
      await loadData();
    } catch (err) { setActionMsg({ type: "error", text: err.message }); } finally { setLoading(false); }
  }

  if (fetching) return <div className="page-container" style={{ textAlign: "center", paddingTop: 80, color: "#a8a29e" }}>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.avatar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Manage users — {user?.name}</p>
          </div>
        </div>
      </div>

      {actionMsg && <div className={`message message-${actionMsg.type}`}>{actionMsg.text}</div>}

      <div className="grid-2">
        {[
          { title: "Students", users: students, icon: "M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", color: "#6366f1" },
          { title: "Professors", users: professors, icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", color: "#8b5cf6" },
        ].map(section => (
          <div className="card" key={section.title} style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e7e5e4", background: "#fafafa", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, color: "#1c1917" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={section.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={section.icon}/></svg>
              {section.title}
              <span style={{ color: "#a8a29e", fontWeight: 400, marginLeft: 4 }}>({section.users.length})</span>
            </div>
            {section.users.length === 0 ? (
              <div className="empty-state">No users</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {section.users.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 700, color: "#1c1917" }}>#{Number(u.id)}</td>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td style={{ color: "#a8a29e", fontSize: 12 }}>{u.email}</td>
                        <td>
                          {u.isActive ? (
                            <span className="badge" style={{ background: "#ecfdf5", color: "#10b981" }}>Active</span>
                          ) : (
                            <span className="badge" style={{ background: "#fef2f2", color: "#ef4444" }}>Inactive</span>
                          )}
                        </td>
                        <td>
                          <button
                            className={u.isActive ? "btn btn-danger" : "btn btn-success"}
                            style={{ padding: "5px 14px", fontSize: 11 }}
                            onClick={() => handleToggle(Number(u.id), u.isActive)}
                            disabled={loading}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: "linear-gradient(135deg, #ef4444, #f43f5e)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
    flexShrink: 0,
  },
};
