import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

export default function Register() {
  const { contract, account, user, refreshUser, ROLES } = useWeb3();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES.STUDENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (user) {
    navigate("/");
    return null;
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!contract || !account) return;
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.registerUser(name, email, role);
      await tx.wait();
      setSuccess(true);
      await refreshUser();
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successBox}>
          <h2>Registration Successful!</h2>
          <p>Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Register</h2>
        <p style={styles.subtitle}>
          Connect your wallet first, then register as a Student or Professor.
        </p>

        {!account && <p style={styles.warn}>Please connect your wallet.</p>}

        <form onSubmit={handleRegister}>
          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select
              style={styles.select}
              value={role}
              onChange={(e) => setRole(Number(e.target.value))}
            >
              <option value={ROLES.STUDENT}>Student</option>
              <option value={ROLES.PROFESSOR}>Professor</option>
            </select>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading || !account}
            style={styles.btn}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 480,
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
  warn: { color: "#ef4444", fontSize: 14, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { display: "block", marginBottom: 6, fontSize: 14, color: "#334155", fontWeight: 500 },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    fontSize: 14,
    background: "#fff",
    boxSizing: "border-box",
  },
  error: { color: "#ef4444", fontSize: 13, marginBottom: 12 },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  successBox: {
    textAlign: "center",
    padding: 40,
    background: "#f0fdf4",
    borderRadius: 12,
    border: "1px solid #bbf7d0",
    color: "#166534",
  },
};
