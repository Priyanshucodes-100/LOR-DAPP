import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

export default function Home() {
  const { account, user } = useWeb3();

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.glow1} />
        <div style={styles.glow2} />
        <div style={styles.heroContent}>
          <div style={styles.badge}>Decentralized &bull; Trustless &bull; Permanent</div>
          <h1 style={styles.title}>
            Letter of Recommendation
            <br />
            <span style={styles.gradient}>on the Blockchain</span>
          </h1>
          <p style={styles.text}>
            Tamper-proof recommendation letters powered by Ethereum.
            Seekers request, sponsors approve, anyone verifies.
          </p>
          {!account ? (
            <p style={styles.hint}>Connect your wallet to get started</p>
          ) : !user ? (
            <Link to="/register" style={styles.cta}>Get Started</Link>
          ) : (
            <Link
              to={user.role === 1 ? "/seeker" : user.role === 2 ? "/sponsor" : "/admin"}
              style={styles.cta}
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      <div className="page-container">
        <div style={styles.grid}>
          {[
            { icon: "M12 6v6l4 2", title: "Role-Based Access", desc: "Distinct permissions for Seekers, Sponsors, and Admins with full on-chain enforcement." },
            { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", title: "Multi-Sponsor", desc: "Seekers can request letters from any sponsor. Track every request in real-time." },
            { icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", title: "On-Chain Verify", desc: "Anyone can verify a recommendation's authenticity using its ID or QR code." },
          ].map((f, i) => (
            <div className="card" key={i} style={styles.featureCard}>
              <div style={styles.iconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    position: "relative",
    background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)",
    padding: "100px 24px",
    textAlign: "center",
    overflow: "hidden",
  },
  glow1: {
    position: "absolute",
    top: "-30%",
    left: "-10%",
    width: "60%",
    height: "80%",
    background: "radial-gradient(ellipse, rgba(99,102,241,0.15), transparent 70%)",
    pointerEvents: "none",
  },
  glow2: {
    position: "absolute",
    bottom: "-30%",
    right: "-10%",
    width: "60%",
    height: "80%",
    background: "radial-gradient(ellipse, rgba(139,92,246,0.12), transparent 70%)",
    pointerEvents: "none",
  },
  heroContent: {
    maxWidth: 700,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  badge: {
    display: "inline-block",
    background: "rgba(99,102,241,0.15)",
    color: "#a5b4fc",
    padding: "7px 18px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 28,
    letterSpacing: "0.05em",
    border: "1px solid rgba(99,102,241,0.2)",
  },
  title: {
    fontSize: 48,
    fontWeight: 900,
    color: "white",
    margin: "0 0 20px",
    lineHeight: 1.15,
    letterSpacing: "-0.04em",
  },
  gradient: {
    background: "linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  text: {
    fontSize: 17,
    color: "#a8a29e",
    lineHeight: 1.7,
    margin: "0 auto 40px",
    maxWidth: 520,
  },
  hint: {
    fontSize: 14,
    color: "#57534e",
  },
  cta: {
    display: "inline-flex",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    padding: "16px 40px",
    borderRadius: 12,
    textDecoration: "none",
    fontSize: 16,
    fontWeight: 700,
    transition: "all 0.3s",
    boxShadow: "0 8px 30px rgba(99,102,241,0.35)",
    letterSpacing: "-0.02em",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
    marginTop: -48,
    position: "relative",
    zIndex: 2,
  },
  featureCard: {
    padding: 32,
    textAlign: "left",
    cursor: "default",
    background: "rgba(255,255,255,0.95)",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #eef2ff, #ede9fe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6366f1",
    marginBottom: 18,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1c1917",
    margin: "0 0 8px",
    letterSpacing: "-0.03em",
  },
  featureDesc: {
    fontSize: 14,
    color: "#78716c",
    lineHeight: 1.7,
    margin: 0,
  },
};
