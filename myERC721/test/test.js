const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('myToken Contract', () => {
  let owner;
  let addr1;

  let contract;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const myTokenContractFactory = await ethers.getContractFactory("MyERC721");
    const myTokenContract = await myTokenContractFactory.deploy();
    contract = await myTokenContract.deployed();
  });

  describe("Deployment test", function() {
    it("Max supply == initialized (state const)", async function () {
      const maxSupply = await contract.MAX_SUPPLY();
      expect(maxSupply).to.equal(100);
    });

    it("Mint price == initialized (state const)", async function () {
      const mintPrice = await contract.MINT_PRICE();
      expect(mintPrice).to.equal(0.001 * 10 ** 18);
    });

    it("Total supply == 0", async function () {
      const totalSupply = await contract.totalSupply();
      expect(totalSupply).to.equal(0);
    });

    it("Contract balance == 0", async function () {
      const balance = await contract.provider.getBalance(contract.address);
      expect(balance).to.equal(0);
    }); 
  });

  describe("Minting test", function() {
    it("Contract balance += minting price", async function () {
      await contract.safeMint(owner.address, "f", {value: 0.001 * 10 ** 18});
      const balance = await contract.provider.getBalance(contract.address);
      expect(balance).to.equal(0.001 * 10 ** 18);
    });

    it("Total supply += 1", async function () {
      await contract.safeMint(owner.address, "f", {value: 0.001 * 10 ** 18});
      const totalSupply = await contract.totalSupply();
      expect(totalSupply).to.equal(1);
    });

    it("address to is owner of minted NFT", async function () {
      await contract.safeMint(addr1.address, "f", {value: 0.001 * 10 ** 18});
      const address = await contract.ownerOf(1);
      expect(address).to.equal(addr1.address);
    });

    it("Can not mint when msg.value < mint price", async function () {
      await expect(contract.safeMint(addr1.address, "f", {value: 0.0001 * 10 ** 18})).to.be.revertedWith("Not enough funds for minting NFT.");
    });
  });

  describe("Withdraw test", function() {
    it("Only owner can withdraw", async function () {
      await expect(contract.connect(addr1).withdrawFunds()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Contract balance == 0 after withdraw", async function () {
      await contract.safeMint(owner.address, "f", {value: 0.001 * 10 ** 18});
      await contract.withdrawFunds();
      const balance = await contract.provider.getBalance(contract.address);
      expect(balance).to.equal(0);
    });

    it("Owner balance before withdraw < owner balance after withdraw", async function () {
      const balanceBefore = await contract.provider.getBalance(owner.address);
      await contract.connect(addr1).safeMint(addr1.address, "f", {value: 0.001 * 10 ** 18});
      await contract.connect(owner).withdrawFunds();
      const balanceAfter = await contract.provider.getBalance(owner.address);
      expect(balanceBefore < balanceAfter).to.be.true;
    });
  });

});