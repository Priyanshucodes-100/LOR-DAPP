import { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import contractABI from "../utils/LORSystem.json";
import { CONTRACT_ADDRESS, ROLES } from "../utils/constants";

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      setError("MetaMask is not installed");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );
      setAccount(accounts[0]);
      setContract(contractInstance);

      const isRegistered = await contractInstance.isUserRegistered(accounts[0]);
      if (isRegistered) {
        const userData = await contractInstance.getUserByAddress(accounts[0]);
        setUser({
          id: Number(userData.id),
          wallet: userData.wallet,
          name: userData.name,
          email: userData.email,
          role: Number(userData.role),
          isActive: userData.isActive,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser() {
    if (!contract || !account) return;
    try {
      const isRegistered = await contract.isUserRegistered(account);
      if (isRegistered) {
        const userData = await contract.getUserByAddress(account);
        setUser({
          id: Number(userData.id),
          wallet: userData.wallet,
          name: userData.name,
          email: userData.email,
          role: Number(userData.role),
          isActive: userData.isActive,
        });
      }
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setUser(null);
        } else {
          connectWallet();
        }
      });
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        contract,
        user,
        loading,
        error,
        connectWallet,
        refreshUser,
        ROLES,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return context;
}
