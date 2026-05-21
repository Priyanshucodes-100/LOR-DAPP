const hre = require("hardhat");

async function main() {
  const [deployer, seeker, sponsor] = await hre.ethers.getSigners();
  const CONTRACT_ADDRESS = "0x4F1fab47e4182aFd3659dBA27cc62692108FB095";

  const LetterChain = await hre.ethers.getContractFactory("LetterChain");
  const contract = LetterChain.attach(CONTRACT_ADDRESS);

  console.log("Using contract at:", CONTRACT_ADDRESS);
  console.log("Admin (deployer):", deployer.address);
  console.log("Seeker account:", seeker.address);
  console.log("Sponsor account:", sponsor.address);

  const tx1 = await contract.connect(seeker).registerUser("Alice Seeker", "alice@test.com", 1);
  await tx1.wait();
  console.log("\nSeeker registered: Alice Seeker");

  const tx2 = await contract.connect(sponsor).registerUser("Dr. Bob Sponsor", "bob@test.com", 2);
  await tx2.wait();
  console.log("Sponsor registered: Dr. Bob Sponsor");

  const tx3 = await contract.connect(seeker).requestLetter(3, "Blockchain Course LOR");
  await tx3.wait();
  console.log("Letter #1 requested");

  const tx4 = await contract.connect(sponsor).approveLetter(1);
  await tx4.wait();
  console.log("Letter #1 approved");

  const tx5 = await contract.connect(sponsor).submitLetter(1, "QmTestIpfsHash123");
  await tx5.wait();
  console.log("Letter #1 submitted with IPFS hash");

  console.log("\n--- Test Data Ready ---");
  console.log("Contract Address:", CONTRACT_ADDRESS);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
