const hre = require("hardhat");

async function main() {
  const [deployer, student, professor] = await hre.ethers.getSigners();

  const LORSystem = await hre.ethers.getContractFactory("LORSystem");
  const contract = await LORSystem.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);
  console.log("Admin (deployer):", deployer.address);
  console.log("Student account:", student.address);
  console.log("Professor account:", professor.address);

  const tx1 = await contract.connect(student).registerUser("Alice Student", "alice@test.com", 1);
  await tx1.wait();
  console.log("\nStudent registered: Alice Student");

  const tx2 = await contract.connect(professor).registerUser("Dr. Bob Professor", "bob@test.com", 2);
  await tx2.wait();
  console.log("Professor registered: Dr. Bob Professor");

  const tx3 = await contract.connect(student).requestRecommendation(3, "Blockchain Course LOR");
  await tx3.wait();
  console.log("Recommendation #1 requested");

  const tx4 = await contract.connect(professor).approveRecommendation(1);
  await tx4.wait();
  console.log("Recommendation #1 approved");

  const tx5 = await contract.connect(professor).submitRecommendation(1, "QmTestIpfsHash123");
  await tx5.wait();
  console.log("Recommendation #1 submitted with IPFS hash");

  console.log("\n--- Test Data Ready ---");
  console.log("Contract Address:", address);
  console.log("Student (import in MetaMask):", student.privateKey);
  console.log("Professor (import in MetaMask):", professor.privateKey);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
