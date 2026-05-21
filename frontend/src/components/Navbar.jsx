import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

export default function Navbar() {
  const { account, user, connectWallet, loading } = useWeb3();

  const roleName = { 1: "Seeker", 2: "Sponsor", 3: "Admin" };
  const roleColors = { 1: "#6366f1", 2: "#8b5cf6", 3: "#ef4444" };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <div style={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <span style={styles.logoText}>LetterChain</span>
        </Link>

        <div style={styles.links}>
          <Link to="/verify" style={styles.link}>Verify</Link>
          {user?.role === 1 && <Link to="/seeker" style={styles.link}>Dashboard</Link>}
          {user?.role === 2 && <Link to="/sponsor" style={styles.link}>Dashboard</Link>}
          {user?.role === 3 && <Link to="/admin" style={styles.link}>Admin</Link>}

          {!account ? (
            <button onClick={connectWallet} disabled={loading} style={styles.btn}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={styles.spinner} /> Connecting
                </span>
              ) : (
                "Connect Wallet"
              )}
            </button>
          ) : (
            <div style={styles.accountInfo}>
              {user && (
                <span style={{ ...styles.roleBadge, background: roleColors[user.role] || "#78716c" }}>
                  {roleName[user.role]}
                </span>
              )}
              <div style={styles.addressWrap}>
                <div style={styles.dot} />
                <span style={styles.address}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(20px) saturate(180%)",
    borderBottom: "1px solid rgba(255,255,255,0.3)",
    padding: "0 24px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: 68,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 800,
    color: "#1c1917",
    letterSpacing: "-0.05em",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  link: {
    color: "#78716c",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    padding: "8px 14px",
    borderRadius: 8,
    transition: "all 0.2s",
  },
  btn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    padding: "10px 22px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.3s",
    marginLeft: 8,
    boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
  },
  accountInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.9)",
    padding: "6px 12px 6px 6px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  roleBadge: {
    padding: "4px 10px",
    borderRadius: 7,
    color: "white",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  addressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 6px rgba(16,185,129,0.5)",
  },
  address: {
    fontSize: 12,
    color: "#57534e",
    fontWeight: 500,
  },
  spinner: {
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
};
