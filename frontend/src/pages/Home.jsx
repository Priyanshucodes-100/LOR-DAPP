import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

export default function Home() {
  const { account, user } = useWeb3();

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Letter of Recommendation DApp</h1>
        <p style={styles.subtitle}>
          Decentralized, tamper-proof recommendation letters on the Ethereum
          blockchain. Students can request LORs from professors, professors can
          approve and submit letters, and anyone can verify authenticity.
        </p>

        {!account ? (
          <p style={styles.cta}>Connect your wallet to get started.</p>
        ) : !user ? (
          <Link to="/register" style={styles.btn}>
            Register Now
          </Link>
        ) : (
          <div>
            {user.role === 1 && (
              <Link to="/student" style={styles.btn}>
                Go to Dashboard
              </Link>
            )}
            {user.role === 2 && (
              <Link to="/professor" style={styles.btn}>
                Go to Dashboard
              </Link>
            )}
            {user.role === 3 && (
              <Link to="/admin" style={styles.btn}>
                Go to Admin Panel
              </Link>
            )}
          </div>
        )}
      </section>

      <section style={styles.features}>
        <div style={styles.card}>
          <h3>Role-Based Access</h3>
          <p>Register as a Student or Professor with distinct permissions.</p>
        </div>
        <div style={styles.card}>
          <h3>Multi-Recommender</h3>
          <p>Request recommendations from multiple professors at once.</p>
        </div>
        <div style={styles.card}>
          <h3>On-Chain Verification</h3>
          <p>Verify any recommendation's authenticity using its ID.</p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "40px 24px",
  },
  hero: {
    textAlign: "center",
    padding: "60px 0",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0f172a",
    margin: "0 0 16px",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    maxWidth: 600,
    margin: "0 auto 32px",
    lineHeight: 1.6,
  },
  cta: {
    fontSize: 14,
    color: "#94a3b8",
  },
  btn: {
    display: "inline-block",
    background: "#3b82f6",
    color: "#fff",
    padding: "12px 32px",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 16,
    fontWeight: 600,
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
    marginTop: 40,
  },
  card: {
    background: "#f8fafc",
    padding: 24,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
};
