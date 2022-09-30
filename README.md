# solidity-practice

### task 1

- Truffle / Hardhat - find out how to create project structure, compile simple contracts, deploy them to the testnet. Hardhat is preferred. 
- Open zeppelin - a good library with smart contracts. Review example of token contracts, documentation and howtos. 
- Implement ERC20 over OpenZeppelin reference contract.
- Implement ERC721 over OpenZeppelin reference contract.
- Implement ERC1155 over OpenZeppelin reference contract.
- Implement migration script and deploy both tokens to Goerli testnet.
- Write tests for all contracts.

### task 2

- ERC20 Upgradeable (simple token).
- Deploy this token into testnet (Goerli).
- Do some testing within this token contract (some transfers).
- Update ERC20 contract (add mint + burn features + blacklisted addresses + ACL Role who's able to add addresses to blacklist). Mint function to be available for ACL MINTER_ROLE only).
- Upgrade existing contract in testnet (Goerli).
- Make sure upgrade is done correctly.
- Add Pausability feature into ERC20 contract (see OZ).
- Upgrade existing token contract with new one with pausability feature.
- Make sure upgrade is done correctly.
