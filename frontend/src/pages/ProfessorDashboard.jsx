import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useWeb3 } from "../context/Web3Context";
import { STATUS_LABELS, STATUS_COLORS } from "../utils/constants";

export default function ProfessorDashboard() {
  const { contract, user } = useWeb3();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [ipfsInputs, setIpfsInputs] = useState({});
  const [showQR, setShowQR] = useState(null);

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

  useEffect(() => { loadData(); }, [loadData]);

  async function handleAction(recId, action) {
    setLoading(true);
    setError(null);
    try {
      const tx = action === "approve" ? await contract.approveRecommendation(recId) : await contract.rejectRecommendation(recId);
      await tx.wait();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  async function handleSubmit(recId) {
    const hash = ipfsInputs[recId];
    if (!hash?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.submitRecommendation(recId, hash.trim());
      await tx.wait();
      setIpfsInputs(prev => ({ ...prev, [recId]: "" }));
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  if (fetching) return <div className="page-container" style={{ textAlign: "center", paddingTop: 80, color: "#a8a29e" }}>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.avatar}>{user?.name?.[0] || "P"}</div>
          <div>
            <h1 className="page-title">Professor Dashboard</h1>
            <p className="page-subtitle">Welcome, {user?.name}</p>
          </div>
        </div>
      </div>

      {error && <div className="message message-error">{error}</div>}

      {recommendations.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <p style={{ color: "#a8a29e", fontSize: 15 }}>No recommendations yet</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>ID</th><th>Student</th><th>Title</th><th>Status</th><th>Date</th><th style={{ minWidth: 210 }}>Actions</th></tr>
              </thead>
              <tbody>
                {recommendations.map(rec => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 700, color: "#1c1917" }}>#{Number(rec.id)}</td>
                    <td>Student #{Number(rec.studentId)}</td>
                    <td style={{ fontWeight: 500 }}>{rec.title}</td>
                    <td>
                      <span className="badge" style={{ background: STATUS_COLORS[Number(rec.status)] + "15", color: STATUS_COLORS[Number(rec.status)] }}>
                        {STATUS_LABELS[Number(rec.status)]}
                      </span>
                    </td>
                    <td style={{ color: "#a8a29e", fontSize: 12 }}>
                      {new Date(Number(rec.createdAt) * 1000).toLocaleDateString()}
                    </td>
                    <td>
                      {Number(rec.status) === 0 && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-success" style={{ padding: "6px 16px", fontSize: 12 }} onClick={() => handleAction(Number(rec.id), "approve")} disabled={loading}>Approve</button>
                          <button className="btn btn-danger" style={{ padding: "6px 16px", fontSize: 12 }} onClick={() => handleAction(Number(rec.id), "reject")} disabled={loading}>Reject</button>
                        </div>
                      )}
                      {Number(rec.status) === 1 && (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input className="form-input" style={{ width: 130, padding: "6px 10px", fontSize: 12 }} placeholder="IPFS hash"
                            value={ipfsInputs[Number(rec.id)] || ""}
                            onChange={e => setIpfsInputs(prev => ({ ...prev, [Number(rec.id)]: e.target.value }))} />
                          <button className="btn btn-primary" style={{ padding: "6px 16px", fontSize: 12 }}
                            onClick={() => handleSubmit(Number(rec.id))} disabled={loading || !ipfsInputs[Number(rec.id)]?.trim()}>Submit</button>
                        </div>
                      )}
                      {Number(rec.status) === 3 && (
                        <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: 12, borderRadius: 6 }}
                          onClick={() => setShowQR(showQR === Number(rec.id) ? null : Number(rec.id))}>
                          {showQR === Number(rec.id) ? "Close" : "QR"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showQR && (
        <div className="card" style={{ marginTop: 24, padding: 36, textAlign: "center" }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 14, color: "#57534e" }}>Verify Recommendation #{showQR}</h3>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "#a8a29e" }}>Scan with any QR reader</p>
          <div style={{ display: "inline-block", padding: 20, background: "white", borderRadius: 16, border: "2px solid #e7e5e4" }}>
            <QRCodeSVG value={`${window.location.origin}/verify?id=${showQR}`} size={200} level="M" includeMargin />
          </div>
          <p style={{ marginTop: 16, fontSize: 11, color: "#a8a29e", wordBreak: "break-all" }}>
            {`${window.location.origin}/verify?id=${showQR}`}
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 700,
    boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
    flexShrink: 0,
  },
};
