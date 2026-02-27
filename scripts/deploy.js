const hre = require("hardhat");

async function main() {

    const StudentRecommendation = await hre.ethers.getContractFactory("StudentRecommendation");

    const contract = await StudentRecommendation.deploy();

    await contract.deployed();

    console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});