const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('myToken Contract', () => {
  let owner;
  let addr1;

  let contract;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const myTokenContractFactory = await ethers.getContractFactory("MyERC20");
    const myTokenContract = await myTokenContractFactory.deploy(10000);
    contract = await myTokenContract.deployed();
  });

  describe("Deployment test", function() {
    it("Total supply == value in constructor", async function () {
      const totalSupply = await contract.totalSupply();
      expect(totalSupply).to.equal(10000 * 10 ** 3);
    });

    it("Maximum supply == 100k tokens (state const)", async function () {
      const maxSupply = await contract.maxSupply();
      expect(maxSupply).to.equal(100000 * 10 ** 3);
    });

    it("Owner balance == initial supply", async function () {
      const balance = await contract.balanceOf(owner.address);
      expect(balance).to.equal(10000 * 10 ** 3);
    });
  });

  describe("Minting test", function() {
    it("Owner balance += minting amount", async function () {
      await contract.mint(owner.address, 1000);
      const balance = await contract.balanceOf(owner.address);
      expect(balance).to.equal(11000 * 10 ** 3);
    });

    it("Addr1 (not owner) balance += minting amount", async function () {
      await contract.mint(addr1.address, 1000);
      const balance = await contract.balanceOf(addr1.address);
      expect(balance).to.equal(1000 * 10 ** 3);
    });

    it("Total supply += minting amount", async function () {
      await contract.mint(addr1.address, 1000);
      const totalSupply = await contract.totalSupply();
      expect(totalSupply).to.equal(11000 * 10 ** 3);
    });

    it("Only owner can mint", async function () {
      await expect(contract.connect(addr1).mint(addr1.address, 1000)).to.be.revertedWith("Ownable: caller is not the owner")
    });
  });

  describe("Burning test", function() {
    it("Owner balance -= burning amount", async function () {
      await contract.burn(1000);
      const balance = await contract.balanceOf(owner.address);
      expect(balance).to.equal(9000 * 10 ** 3);
    });

    it("Addr1 balance -= burning amount", async function () {
      await contract.mint(addr1.address, 2000)
      await contract.connect(addr1).burn(1000);
      const balance = await contract.balanceOf(addr1.address);
      expect(balance).to.equal(1000 * 10 ** 3);
    });

    it("Total supply -= burning amount", async function () {
      await contract.burn(1000);
      const totalSupply = await contract.totalSupply();
      expect(totalSupply).to.equal(9000 * 10 ** 3);
    });
  });

  describe("Transfer test", function() {
    it("Sender balance -= amount", async function () {
      await contract.transfer(addr1.address, 1000 * 10 ** 3);
      const balance = await contract.balanceOf(owner.address);
      expect(balance).to.equal(9000 * 10 ** 3);
    });

    it("Receiver balance += amount", async function () {
      await contract.transfer(addr1.address, 1000 * 10 ** 3);
      const balance = await contract.balanceOf(addr1.address);
      expect(balance).to.equal(1000 * 10 ** 3);
    });

    it("Total supply before transfer == total supply after transfer", async function () {
      const totalSupplyBefore = await contract.totalSupply();
      await contract.transfer(addr1.address, 1000 * 10 ** 3);
      const totalSupplyAfter = await contract.totalSupply();
      expect(totalSupplyBefore).to.equal(totalSupplyAfter);
    });

    it("Can not transfer insufficient amount (balance = 0)", async function () {
      await expect(contract.connect(addr1).transfer(owner.address, 10000 * 10 ** 3)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Can not transfer insufficient amount (amount > balance)", async function () {
      await expect(contract.transfer(addr1.address, 100000 * 10 ** 3)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

  });

});