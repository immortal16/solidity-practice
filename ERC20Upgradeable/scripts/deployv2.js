const { ethers, upgrades } = require("hardhat");

async function main() {
  const ContractV2 = await ethers.getContractFactory("MyTokenUV2");

  const contract = await upgrades.upgradeProxy("PASTE_PROXY_ADDRESS_HERE", ContractV2);
  await contract.deployed();

  console.log("Upgraded");
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

