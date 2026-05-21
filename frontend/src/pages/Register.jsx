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

  if (user) { navigate("/"); return null; }

  async function handleRegister(e) {
    e.preventDefault();
    if (!contract || !account) return;
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.registerUser(name, email, role);
      await tx.wait();
      await refreshUser();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.sub}>Join the LOR ecosystem</p>
        </div>

        {!account && <div className="message" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>Connect your wallet to register.</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { value: ROLES.STUDENT, label: "Student", icon: "M12 14l9-5-9-5-9 5 9 5z", sub: "Request recommendations", color: "#6366f1" },
                { value: ROLES.PROFESSOR, label: "Professor", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", sub: "Approve & submit LORs", color: "#8b5cf6" },
              ].map(r => (
                <button type="button" key={r.value} onClick={() => setRole(r.value)} style={{
                  ...styles.roleBtn,
                  background: role === r.value ? "white" : "transparent",
                  borderColor: role === r.value ? r.color : "#e7e5e4",
                  boxShadow: role === r.value ? `0 4px 20px ${r.color}20` : "none",
                  transform: role === r.value ? "translateY(-2px)" : "none",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={role === r.value ? r.color : "#a8a29e"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={r.icon} />
                  </svg>
                  <span style={{ fontWeight: 700, fontSize: 14, color: role === r.value ? r.color : "#57534e" }}>{r.label}</span>
                  <span style={{ fontSize: 11, color: role === r.value ? r.color : "#a8a29e", opacity: role === r.value ? 1 : 0.7 }}>{r.sub}</span>
                </button>
              ))}
            </div>
          </div>
          {error && <div className="message message-error">{error}</div>}
          <button type="submit" disabled={loading || !account} className="btn btn-primary" style={{ width: "100%", padding: "13px", fontSize: 15, marginTop: 8 }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 460,
    margin: "0 auto",
    padding: "60px 24px",
  },
  card: {
    padding: 40,
  },
  header: {
    textAlign: "center",
    marginBottom: 32,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: "linear-gradient(135deg, #eef2ff, #ede9fe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6366f1",
    margin: "0 auto 16px",
  },
  title: {
    margin: "0 0 4px",
    fontSize: 22,
    fontWeight: 800,
    color: "#1c1917",
    letterSpacing: "-0.04em",
  },
  sub: {
    margin: 0,
    fontSize: 14,
    color: "#a8a29e",
  },
  roleBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "20px 16px",
    border: "2px solid #e7e5e4",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.3s",
  },
};
