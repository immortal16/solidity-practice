const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

const CometAddress = '0xc3d688B66703497DAA19211EEdff47f25384cdc3';
const cometAbi = require("../artifacts/contracts/comet/CometInterface.sol/CometInterface.json").abi;

const USDCaddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const erc20Abi = require("../artifacts/contracts/openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol/IERC20Upgradeable.json").abi;

const USDCwhaleAddress = '0x7713974908be4bed47172370115e8b1219f4a5f0';

let owner, user1, user2;
let Vault, USDC, Comet;

const amountFromWhale = ethers.utils.parseUnits('1000000', 6);
const amount1 = ethers.utils.parseUnits('10000', 6);
const amount2 = ethers.utils.parseUnits('100000', 6);

const withdrawAmount = ethers.utils.parseUnits('1000', 6);

describe("Vault Contract", () => {
  let vaultBalanceUSDC1;
  let vaultTotalSupply1;
  let vaultBalanceUSDC2;
  let vaultTotalSupply2;

  let lastVaultBalanceUSDC;

  before(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];

    whale = await ethers.getImpersonatedSigner(USDCwhaleAddress);
    
    user1 = signers[1];
    user2 = signers[2];

    const VaultFactory = await ethers.getContractFactory("Vault");
    const contract = await upgrades.deployProxy(VaultFactory, [USDCaddress, CometAddress]);;
    Vault = await contract.deployed();

    USDC = await ethers.getContractAt(erc20Abi, USDCaddress, owner);
    await USDC.connect(whale).transfer(user1.address, amountFromWhale);
    await USDC.connect(whale).transfer(user2.address, amountFromWhale);

    Comet = await ethers.getContractAt(cometAbi, CometAddress, owner);
  })

  it("deployed", async () => {
    expect(await Vault.USDCaddress()).to.equal(USDCaddress) &&
    expect(await Vault.cometAddress()).to.equal(CometAddress) &&
    expect(await Vault.paused()).to.be.false &&
    expect(await Vault.owner()).to.be.equal(owner.address) &&
    expect(await Vault.totalSupply()).to.equal(0);
  })

  describe("Deposit", () => {

    describe("User1", () => {
      it("USDC balance of user decreases", async () => {
        const user1BalanceUSDC = await USDC.balanceOf(user1.address);

        await USDC.connect(user1).approve(Vault.address, amount1);
        await Vault.connect(user1).deposit(amount1);

        const balance = await USDC.balanceOf(user1.address);

        expect(balance).to.equal(parseInt(user1BalanceUSDC) - parseInt(amount1));
      })

      it("USDC balance of vault increases", async () => {
        vaultBalanceUSDC1 = await USDC.balanceOf(Vault.address);

        expect(vaultBalanceUSDC1).to.equal(amount1);
      })

      it("Vault total supply increases & corresponding user gets shares", async () => {
        vaultTotalSupply1 = await Vault.totalSupply();

        expect(vaultTotalSupply1).to.equal(amount1) &&
        expect(await Vault.balanceOf(user1.address)).to.equal(amount1);
      })
    
    })

    describe("User2", () => {

      it("USDC balance of user decreases", async () => {
        const user2BalanceUSDC = await USDC.balanceOf(user2.address);

        await USDC.connect(user2).approve(Vault.address, amount2);
        await Vault.connect(user2).deposit(amount2);

        const balance = await USDC.balanceOf(user2.address);
        expect(balance).to.equal(parseInt(user2BalanceUSDC) - parseInt(amount2));
      })

      it("USDC balance of vault increases", async () => {
        vaultBalanceUSDC2 = await USDC.balanceOf(Vault.address);

        expect(vaultBalanceUSDC2).to.equal(parseInt(vaultBalanceUSDC1) + parseInt(amount2));
      })

      it("Vault total supply increases & corresponding user gets shares", async () => {
        vaultTotalSupply2 = await Vault.totalSupply();

        expect(vaultTotalSupply2).to.equal(parseInt(vaultTotalSupply1) + parseInt(amount2)) &&
        expect(await Vault.balanceOf(user2.address)).to.equal(amount2);
      })

      it("Bigger deposit grants bigger shares", async () => {
        const shares1 = await Vault.balanceOf(user1.address);
        const shares2 = await Vault.balanceOf(user2.address);
        expect(shares2 > shares1).to.be.true;
      })

    })

    describe("Paused", () => {

      it("Can not deposit when paused", async () => {
        await USDC.connect(user2).approve(Vault.address, amount2);
        await Vault.pause();

        await expect(Vault.connect(user2).deposit(amount2)).to.be.revertedWith("Pausable: paused");
      })
      
    })

  })    

  describe("Withdraw", () => {
    let userShares;

    it("USDC balance of user increases", async () => {
      await Vault.unpause();
      userShares = await Vault.balanceOf(user2.address)

      const user2BalanceUSDC = await USDC.balanceOf(user2.address);
      await Vault.connect(user2).withdraw(withdrawAmount);
      const balance = await USDC.balanceOf(user2.address);

      expect(balance).to.equal(parseInt(user2BalanceUSDC) + parseInt(withdrawAmount));
    })

    it("USDC balance of vault decreases", async () => {
      const vaultBalanceUSDC = await USDC.balanceOf(Vault.address);

      expect(vaultBalanceUSDC).to.equal(parseInt(vaultBalanceUSDC2) - parseInt(withdrawAmount));
    })

    it("Vault total supply decreases & corresponding user looses shares", async () => {
      const vaultTotalSupply = await Vault.totalSupply();

      expect(vaultTotalSupply).to.equal(parseInt(vaultTotalSupply2) - parseInt(withdrawAmount));
      expect(await Vault.balanceOf(user2.address)).to.equal(parseInt(userShares) - parseInt(withdrawAmount));
    })

    describe("Paused", () => {

      it("Can not withdraw when paused", async () => {
        await Vault.pause();

        await expect(Vault.connect(user2).withdraw(withdrawAmount)).to.be.revertedWith("Pausable: paused");
      })
      
    })

  })
      
  describe("Vault closed & supplying DeFi", () => {

    it("Vault USDC balance supplied to Compound", async () => {
      lastVaultBalanceUSDC = await USDC.balanceOf(Vault.address);
      await Vault.supplyCompound();

      expect(await USDC.balanceOf(Vault.address)).to.equal(0) &&
      expect(await Comet.balanceOf(Vault.address)).to.equal(parseInt(lastVaultBalanceUSDC) - 1);
    })

    it("After year", async () => {
      await ethers.provider.send('evm_increaseTime', [365 * 24 * 60 * 60]);
      await ethers.provider.send('evm_mine');

      expect(await USDC.balanceOf(Vault.address)).to.equal(0) &&
      expect(await Comet.balanceOf(Vault.address) > lastVaultBalanceUSDC).to.be.true;
    })

    describe("Vault USDC balance increased in DeFi", () => {
      it("USDC balance of vault increased", async () => {
        await Vault.withdrawCompound();
        const newVaultBalance = await USDC.balanceOf(Vault.address);

        expect(lastVaultBalanceUSDC < newVaultBalance).to.be.true;
      })

      it("User withdraws more then supplied", async () => {
        await Vault.unpause();
        
        await Vault.connect(user1).withdraw(amount1);
        const balanceAfter = await USDC.balanceOf(user1.address);

        expect(balanceAfter > amountFromWhale).to.be.true;
      })
    
    })

  })
})


