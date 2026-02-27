require("@nomiclabs/hardhat-ethers");

const PRIVATE_KEY = "0xed818858f8318193993a85ae96e68b29a63f43bf4b52d4dccdb4387ae58d6dad";
const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/ldCuHwbmM4UxFicU-gLME";

module.exports = {
  solidity: "0.8.20",

  networks: {
    sepolia: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY]
    }
  }
};