const hre = require("hardhat");

async function main() {
  console.log("Deploying LetterChain...");

  const LetterChain = await hre.ethers.getContractFactory("LetterChain");
  const contract = await LetterChain.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("LetterChain deployed to:", address);

  console.log("\nWaiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);

  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
  }

  console.log("\nDeployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
