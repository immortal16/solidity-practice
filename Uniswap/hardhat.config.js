require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config();

module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `${process.env.INFURA_GOERLI_ENDPOINT}`,
      accounts: [`0x${process.env.GOERLI_PRIVATE_KEY}`],
    } 
  }
};