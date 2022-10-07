require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const {
  INFURA_KEY, 
  MNEMONIC,
  ETHERSCAN_API_KEY,
  COINMARKETCAP_API_KEY
  } = process.env;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { 
        version: "0.8.17", 
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
