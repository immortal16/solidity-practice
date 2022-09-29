const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const myTokenContractFactory = await hre.ethers.getContractFactory("MyERC721");
  const myTokenContract = await myTokenContractFactory.deploy();
  await myTokenContract.deployed();

  console.log("myNFTContract deployed to:", myTokenContract.address);
  console.log("myNFTContract owner address:", owner.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

