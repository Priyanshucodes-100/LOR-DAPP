import { Navigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

export default function ProtectedRoute({ children, requiredRole }) {
  const { account, user } = useWeb3();

  if (!account) {
    return (
      <div style={styles.wrapper}>
        <p>Please connect your wallet to access this page.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.wrapper}>
        <p>Please register first.</p>
      </div>
    );
  }

  if (requiredRole !== undefined && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 300,
    color: "#64748b",
    fontSize: 16,
  },
};
