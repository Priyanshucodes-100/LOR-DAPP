import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

export default function Navbar() {
  const { account, user, connectWallet, loading } = useWeb3();
  const navigate = useNavigate();

  const roleName = {
    1: "Student",
    2: "Professor",
    3: "Admin",
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          LOR DApp
        </Link>

        <div style={styles.links}>
          <Link to="/verify" style={styles.link}>
            Verify
          </Link>

          {user && user.role === 1 && (
            <Link to="/student" style={styles.link}>
              Dashboard
            </Link>
          )}
          {user && user.role === 2 && (
            <Link to="/professor" style={styles.link}>
              Dashboard
            </Link>
          )}
          {user && user.role === 3 && (
            <Link to="/admin" style={styles.link}>
              Admin
            </Link>
          )}

          {!account ? (
            <button onClick={connectWallet} disabled={loading} style={styles.btn}>
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div style={styles.accountInfo}>
              <span style={styles.badge}>
                {user ? roleName[user.role] || "Unknown" : "No Role"}
              </span>
              <span style={styles.address}>
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "#1e293b",
    padding: "0 24px",
    color: "#fff",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: 60,
  },
  brand: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textDecoration: "none",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  link: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: 14,
  },
  btn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  accountInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    background: "#3b82f6",
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12,
  },
  address: {
    fontSize: 13,
    color: "#94a3b8",
  },
};
