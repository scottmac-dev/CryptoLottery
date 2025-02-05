require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_URL,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    },
    defaultNetwork: {
      url: "http://127.0.0.1:8545"
    }, 
    local: {
      url: "http://127.0.0.1:8545"
    },  
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  }
}
