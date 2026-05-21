import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BrowserProvider, Contract } from "ethers";
import contractABI from "../utils/LORSystem.json";
import { CONTRACT_ADDRESS, STATUS_LABELS, STATUS_COLORS } from "../utils/constants";

export default function Verify() {
  const [recId, setRecId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) { setRecId(id); handleVerify(id); }
  }, []);

  async function handleVerify(id) {
    const rid = id || recId;
    if (!rid?.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      if (!window.ethereum) { setError("MetaMask not found"); return; }
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, provider);
      const d = await contract.verifyRecommendation(rid);
      setResult({
        id: rid, studentName: d.studentName, professorName: d.professorName,
        title: d.title, letterIpfsHash: d.letterIpfsHash,
        status: Number(d.status),
        createdAt: new Date(Number(d.createdAt) * 1000).toLocaleDateString(),
      });
    } catch (err) { setError(err.message || "Not found"); } finally { setLoading(false); }
  }

  function handleSubmit(e) { e.preventDefault(); handleVerify(); }

  return (
    <div style={styles.page}>
      <div className="card" style={styles.card}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={styles.icon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <h2 style={styles.title}>Verify Recommendation</h2>
          <p style={styles.sub}>Enter an ID to verify on-chain</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="form-input" value={recId} onChange={e => setRecId(e.target.value)} placeholder="Recommendation ID (e.g. 1)" required />
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ whiteSpace: "nowrap", padding: "12px 28px" }}>
              {loading ? "..." : "Verify"}
            </button>
          </div>
        </form>

        {error && <div className="message message-error" style={{ marginTop: 20 }}>{error}</div>}

        {result && (
          <div style={{ marginTop: 28 }}>
            <div style={styles.verified}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#065f46", letterSpacing: "-0.03em" }}>
                      Verified — #{result.id}
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#10b981" }}>Authentic on-chain record</p>
                </div>
                <span className="badge" style={{ background: STATUS_COLORS[result.status] + "15", color: STATUS_COLORS[result.status], padding: "6px 14px", fontSize: 12 }}>
                  {STATUS_LABELS[result.status]}
                </span>
              </div>
              <div className="table-container">
                <table>
                  <tbody>
                    {[
                      ["Student", result.studentName],
                      ["Professor", result.professorName],
                      ["Title", result.title],
                      ["Created", result.createdAt],
                    ].map(([l, v]) => (
                      <tr key={l}>
                        <td style={{ padding: "10px 16px 10px 0", color: "#78716c", fontWeight: 500, width: 100, fontSize: 12 }}>{l}</td>
                        <td style={{ padding: "10px 0", color: "#1c1917", fontWeight: 600 }}>{v}</td>
                      </tr>
                    ))}
                    {result.letterIpfsHash && (
                      <tr>
                        <td style={{ padding: "10px 16px 10px 0", color: "#78716c", fontWeight: 500, verticalAlign: "top", fontSize: 12 }}>Letter Hash</td>
                        <td style={{ padding: "10px 0" }}>
                          <code style={{ fontSize: 12, background: "#f5f5f4", padding: "4px 8px", borderRadius: 6, wordBreak: "break-all", color: "#57534e" }}>{result.letterIpfsHash}</code>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 28 }}>
              <h4 style={{ margin: "0 0 14px", fontSize: 13, color: "#78716c", fontWeight: 500 }}>Share QR for instant verification</h4>
              <div style={{ display: "inline-block", padding: 20, background: "white", borderRadius: 16, border: "2px solid #e7e5e4", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
                <QRCodeSVG value={`${window.location.origin}/verify?id=${result.id}`} size={180} level="M" includeMargin />
              </div>
              <p style={{ marginTop: 14, fontSize: 11, color: "#a8a29e", wordBreak: "break-all" }}>
                {`${window.location.origin}/verify?id=${result.id}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: "0 auto", padding: "60px 24px" },
  card: { padding: 36 },
  icon: {
    width: 56, height: 56, borderRadius: 16,
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#10b981", margin: "0 auto 16px",
  },
  title: { margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1c1917", letterSpacing: "-0.04em" },
  sub: { margin: 0, fontSize: 14, color: "#a8a29e" },
  verified: {
    padding: 24,
    background: "linear-gradient(135deg, #f0fdf4, #fafafa)",
    borderRadius: 14,
    border: "1px solid #bbf7d0",
  },
};
