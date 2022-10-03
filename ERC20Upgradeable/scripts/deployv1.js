const { ethers, upgrades } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  const Contract = await ethers.getContractFactory("MyTokenUV1");
  const contract = await upgrades.deployProxy(Contract, {initializer: 'initialize', kind: 'uups'});
  await contract.deployed();

  console.log("Proxy deployed to:", contract.address);
  console.log("Owner address:", owner.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

