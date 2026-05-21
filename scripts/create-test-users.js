const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("LORSystem", "0xf9c858742478080D2e46c643fE19cB31a36861E9");

  console.log("Creating test data from:", deployer.address);

  const studentWallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
  const professorWallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);

  const tx1 = await contract.connect(deployer).registerUser("Test Student", "student@test.com", 1);
  await tx1.wait();
  console.log("Student registered");

  const tx2 = await contract.connect(deployer).registerUser("Test Professor", "prof@test.com", 2);
  await tx2.wait();
  console.log("Professor registered");

  console.log("\n--- IMPORT these private keys into MetaMask ---");
  console.log("Student private key:", studentWallet.privateKey);
  console.log("Professor private key:", professorWallet.privateKey);
}

main().catch(console.error);
