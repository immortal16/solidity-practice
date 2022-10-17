require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const {
  INFURA_KEY, 
  MNEMONIC,
  } = process.env;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { 
        version: "0.8.15", 
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
        blockNumber: 15696486
      },
      allowUnlimitedContractSize: false,
      timeout: 9999999999,
      blockGasLimit: 1_000_000_000,
      gas: 1_500_000,
      gasPrice: 20_000_000_000,
      accounts: {mnemonic: MNEMONIC}
    },
  }
};
