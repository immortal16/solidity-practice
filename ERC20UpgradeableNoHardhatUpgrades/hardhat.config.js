require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `${process.env.INFURA_GOERLI_ENDPOINT}`,
      accounts: [`0x${process.env.GOERLI_PRIVATE_KEY}`],
    } 
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`
  },
};