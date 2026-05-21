import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import contractABI from "../utils/LORSystem.json";
import { CONTRACT_ADDRESS, STATUS_LABELS, STATUS_COLORS } from "../utils/constants";

export default function Verify() {
  const [recId, setRecId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleVerify(e) {
    e.preventDefault();
    if (!recId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let contract;
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        contract = new Contract(CONTRACT_ADDRESS, contractABI, provider);
      } else {
        setError("Please install MetaMask or use a Web3 wallet.");
        return;
      }

      const data = await contract.verifyRecommendation(recId);
      setResult({
        studentName: data.studentName,
        professorName: data.professorName,
        title: data.title,
        letterIpfsHash: data.letterIpfsHash,
        status: Number(data.status),
        createdAt: new Date(Number(data.createdAt) * 1000).toLocaleDateString(),
      });
    } catch (err) {
      setError(err.message || "Recommendation not found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Verify Recommendation</h2>
        <p style={styles.subtitle}>
          Enter a Recommendation ID to verify its authenticity on-chain.
        </p>

        <form onSubmit={handleVerify}>
          <div style={styles.field}>
            <input
              style={styles.input}
              value={recId}
              onChange={(e) => setRecId(e.target.value)}
              placeholder="Enter recommendation ID..."
              required
            />
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "Checking..." : "Verify"}
            </button>
          </div>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        {result && (
          <div style={styles.resultCard}>
            <h3 style={{ margin: "0 0 16px", color: "#0f172a" }}>
              Recommendation #{recId}
            </h3>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.label}>Student</td>
                  <td style={styles.value}>{result.studentName}</td>
                </tr>
                <tr>
                  <td style={styles.label}>Professor</td>
                  <td style={styles.value}>{result.professorName}</td>
                </tr>
                <tr>
                  <td style={styles.label}>Title</td>
                  <td style={styles.value}>{result.title}</td>
                </tr>
                <tr>
                  <td style={styles.label}>Status</td>
                  <td style={styles.value}>
                    <span
                      style={{
                        ...styles.badge,
                        background: STATUS_COLORS[result.status] || "#94a3b8",
                      }}
                    >
                      {STATUS_LABELS[result.status] || "Unknown"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={styles.label}>Created</td>
                  <td style={styles.value}>{result.createdAt}</td>
                </tr>
                {result.letterIpfsHash && (
                  <tr>
                    <td style={styles.label}>Letter Hash</td>
                    <td style={styles.value}>
                      <code style={styles.hash}>{result.letterIpfsHash}</code>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "60px 24px",
  },
  card: {
    background: "#fff",
    padding: 32,
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  title: { margin: "0 0 8px", color: "#0f172a" },
  subtitle: { margin: "0 0 24px", color: "#64748b", fontSize: 14 },
  field: { display: "flex", gap: 8 },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    fontSize: 14,
  },
  btn: {
    padding: "10px 24px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  error: { color: "#ef4444", fontSize: 13, marginTop: 16 },
  resultCard: {
    marginTop: 24,
    padding: 20,
    background: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  table: { width: "100%", fontSize: 13 },
  label: { padding: "8px 12px 8px 0", color: "#64748b", fontWeight: 500, width: 120, verticalAlign: "top" },
  value: { padding: "8px 0", color: "#0f172a" },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 12,
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
  },
  hash: {
    fontSize: 12,
    background: "#f1f5f9",
    padding: "3px 8px",
    borderRadius: 4,
    wordBreak: "break-all",
  },
};
