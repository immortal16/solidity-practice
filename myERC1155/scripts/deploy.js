const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const myTokenContractFactory = await hre.ethers.getContractFactory("MyERC1155");
  const myTokenContract = await myTokenContractFactory.deploy();
  await myTokenContract.deployed();

  console.log("myBothContract deployed to:", myTokenContract.address);
  console.log("myBothContract owner address:", owner.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

