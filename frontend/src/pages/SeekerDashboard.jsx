import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useWeb3 } from "../context/Web3Context";
import { STATUS_LABELS, STATUS_COLORS } from "../utils/constants";

export default function SeekerDashboard() {
  const { contract, user } = useWeb3();
  const [sponsors, setSponsors] = useState([]);
  const [letters, setLetters] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showQR, setShowQR] = useState(null);

  const loadData = useCallback(async () => {
    if (!contract) return;
    setFetching(true);
    try {
      const [sps, ls] = await Promise.all([
        contract.getAllSponsors(),
        user ? contract.getSeekerLetters(user.id) : Promise.resolve([]),
      ]);
      setSponsors(sps);
      setLetters(ls);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [contract, user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleRequest(e) {
    e.preventDefault();
    if (!contract || !selectedSponsor || !title) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const tx = await contract.requestLetter(Number(selectedSponsor), title);
      await tx.wait();
      setSuccess("Letter requested!");
      setTitle("");
      setSelectedSponsor("");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="page-container" style={{ textAlign: "center", paddingTop: 80, color: "#a8a29e" }}>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.avatar}>{user?.name?.[0] || "S"}</div>
          <div>
            <h1 className="page-title">Seeker Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user?.name}</p>
          </div>
        </div>
      </div>

      {success && <div className="message message-success">{success}</div>}
      {error && <div className="message message-error">{error}</div>}

      <div className="grid-2">
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#1c1917", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>
            </svg>
            New Request
          </h3>
          <form onSubmit={handleRequest}>
            <div className="form-group">
              <label className="form-label">Sponsor</label>
              <select className="form-select" value={selectedSponsor} onChange={e => setSelectedSponsor(e.target.value)} required>
                <option value="">Choose a sponsor...</option>
                {sponsors.map(p => (
                  <option key={p.id} value={Number(p.id)}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Blockchain Course LOR" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%" }}>
              {loading ? "Submitting..." : "Request Letter"}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #e7e5e4", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, color: "#1c1917" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            History ({letters.length})
          </div>
          {letters.length === 0 ? (
            <div className="empty-state">No letters yet</div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {letters.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 700, color: "#1c1917" }}>#{Number(l.id)}</td>
                      <td style={{ fontWeight: 500 }}>{l.title}</td>
                      <td>
                        <span className="badge" style={{ background: STATUS_COLORS[Number(l.status)] + "15", color: STATUS_COLORS[Number(l.status)] }}>
                          {STATUS_LABELS[Number(l.status)]}
                        </span>
                      </td>
                      <td style={{ color: "#a8a29e", fontSize: 12 }}>
                        {new Date(Number(l.createdAt) * 1000).toLocaleDateString()}
                      </td>
                      <td>
                        <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 11, borderRadius: 6 }}
                          onClick={() => setShowQR(showQR === Number(l.id) ? null : Number(l.id))}>
                          {showQR === Number(l.id) ? "Close" : "QR"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showQR && (
        <div className="card" style={{ marginTop: 24, padding: 36, textAlign: "center" }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 14, color: "#57534e" }}>Verify Letter #{showQR}</h3>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "#a8a29e" }}>Scan with any QR reader</p>
          <div style={{ display: "inline-block", padding: 20, background: "white", borderRadius: 16, border: "2px solid #e7e5e4", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
            <QRCodeSVG value={`${window.location.origin}/verify?id=${showQR}`} size={180} level="M" includeMargin />
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
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 700,
    boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
    flexShrink: 0,
  },
};
