const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const myTokenContractFactory = await hre.ethers.getContractFactory("MyERC20");
  const myTokenContract = await myTokenContractFactory.deploy(10000);
  await myTokenContract.deployed();

  console.log("myTokenContract deployed to:", myTokenContract.address);
  console.log("myTokenContract owner address:", owner.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

