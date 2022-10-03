const { ethers, upgrades } = require("hardhat");

async function main() {
  const ContractV3 = await ethers.getContractFactory("MyTokenUV3");

  const contract = await upgrades.upgradeProxy("PASTE_PROXY_ADDRESS_HERE", ContractV3);
  await contract.deployed();

  console.log("Upgraded");
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

