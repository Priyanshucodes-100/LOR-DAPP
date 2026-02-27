import { ethers } from "ethers";
import abiFile from "./StudentRecommendation.json";

const contractAddress = "0x5579B66bD9d0BC4Ac790873A4753DEDB8EB8A500";

export async function getContract() {

  if (!window.ethereum) {
    alert("MetaMask not installed");
    return null;
  }

  // Request MetaMask connection
  await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  // Create provider and force network refresh
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  await provider.send("eth_chainId", []);

  const signer = provider.getSigner();

  const contract = new ethers.Contract(
    contractAddress,
    abiFile.abi,
    signer
  );

  return contract;
}