const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('myToken Contract', () => {
  let owner;
  let addr1;

  let contract;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const myTokenContractFactory = await ethers.getContractFactory("MyERC1155");
    const myTokenContract = await myTokenContractFactory.deploy();
    contract = await myTokenContract.deployed();
  });

  describe("Deployment test", function() {
    it("Mint price == initialized (state const)", async function () {
      const mintPrice = await contract.MINT_PRICE();
      expect(mintPrice).to.equal(0.001 * 10 ** 18);
    });
  });

  describe("Character minting test", function() {
    it("Cannot mint character if already have one", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await expect(contract.mintCharacter({value: 0.001 * 10 ** 18})).to.be.revertedWith("You already have a Character.");
    });

    it("Cannot mint character if msg.value < mint price", async function () {
      await expect(contract.mintCharacter({value: 0.0001 * 10 ** 18})).to.be.revertedWith("Not enough funds for minting item.");
    });

    it("Mint character creates character and owner is correct", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      const count = await contract.balanceOf(owner.address, 0);
      expect(count).to.be.equal(1);
    });

  });

  describe("Armour minting test", function() {
    it("Cannot mint armour if dont have character", async function () {
      await expect(contract.mintArmour({value: 0.001 * 10 ** 18})).to.be.revertedWith("You should have a Character.");
    });

    it("Cannot mint armour if msg.value < mint price", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await expect(contract.mintArmour({value: 0.0001 * 10 ** 18})).to.be.revertedWith("Not enough funds for minting item.");
    });

    it("Cannot mint armour if already have one", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await contract.mintArmour({value: 0.001 * 10 ** 18});
      await expect(contract.mintArmour({value: 0.001 * 10 ** 18})).to.be.revertedWith("You already have an Armour");
    });

    it("Mint armour creates armour and owner is correct", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await contract.mintArmour({value: 0.001 * 10 ** 18});
      const count = await contract.balanceOf(owner.address, 1);
      expect(count).to.be.equal(1);
    });

  });

  describe("Weapon minting test", function() {
    it("Cannot mint weapon if dont have character", async function () {
      await expect(contract.mintWeapon({value: 0.001 * 10 ** 18})).to.be.revertedWith("You should have a Character.");
    });

    it("Cannot mint weapon if msg.value < mint price", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await expect(contract.mintWeapon({value: 0.0001 * 10 ** 18})).to.be.revertedWith("Not enough funds for minting item.");
    });

    it("Cannot mint weapon if already have two", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await contract.mintWeapon({value: 0.001 * 10 ** 18});
      await contract.mintWeapon({value: 0.001 * 10 ** 18});
      await expect(contract.mintWeapon({value: 0.001 * 10 ** 18})).to.be.revertedWith("Maximum Weapon limit reached.");
    });

    it("Mint weapon creates weapon and owner is correct", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await contract.mintWeapon({value: 0.001 * 10 ** 18});
      const count = await contract.balanceOf(owner.address, 2);
      expect(count).to.be.equal(1);
    });

  });

  describe("Character Effect minting test", function() {
    it("Cannot mint effect if dont have character", async function () {
      await expect(contract.mintCharacterEffect({value: 0.001 * 10 ** 18})).to.be.revertedWith("You should have a Character.");
    });

    it("Cannot mint effect if msg.value < mint price", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await contract.mintArmour({value: 0.001 * 10 ** 18});
      await contract.mintWeapon({value: 0.001 * 10 ** 18});
      await expect(contract.mintCharacterEffect({value: 0.0001 * 10 ** 18})).to.be.revertedWith("Not enough funds for minting item.");
    });

    it("Cannot mint effect if dont have weapon and have armour", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await contract.mintArmour({value: 0.001 * 10 ** 18});
      await expect(contract.mintCharacterEffect({value: 0.001 * 10 ** 18})).to.be.revertedWith("You must have full set (armour & weapon/s) to purchase effects." );
    });

    it("Cannot mint effect if dont have armour and have weapon", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await contract.mintWeapon({value: 0.001 * 10 ** 18});
      await expect(contract.mintCharacterEffect({value: 0.001 * 10 ** 18})).to.be.revertedWith("You must have full set (armour & weapon/s) to purchase effects." );
    });

    it("Mint effect creates effect and owner is correct", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await contract.mintArmour({value: 0.001 * 10 ** 18});
      await contract.mintWeapon({value: 0.001 * 10 ** 18});
      await contract.mintCharacterEffect({value: 0.001 * 10 ** 18});
      const count = await contract.balanceOf(owner.address, 3);
      expect(count).to.be.equal(1);
    });

  });

  describe("Withdraw test", function() {
    it("Only owner can withdraw", async function () {
      await expect(contract.connect(addr1).withdrawFunds()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Contract balance = 0 after withdraw", async function () {
      await contract.mintCharacter({value: 0.001 * 10 ** 18});
      await contract.withdrawFunds();
      const balance = await contract.provider.getBalance(contract.address);
      expect(balance).to.equal(0);
    });

    it("Owner balance before < owner balance after", async function () {
      const balanceBefore = await contract.provider.getBalance(owner.address);
      await contract.connect(addr1).mintCharacter({value: 0.001 * 10 ** 18});
      await contract.connect(owner).withdrawFunds();
      const balanceAfter = await contract.provider.getBalance(owner.address);
      expect(balanceBefore < balanceAfter).to.be.true;
    });
  });

});