const { expect } = require("chai")
const { ethers } = require("hardhat")

const WETHaddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const USDCaddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const cometAddress = '0xc3d688B66703497DAA19211EEdff47f25384cdc3';

let WETH;
let USDC;
let Comet;
let user;
let userAddress;

const amount = ethers.utils.parseEther('10');

const wethMantissa = 1e18;
const baseAssetMantissa = 1e6;

describe("Compound III Comet Interface", () => {
  before(async () => {
    const signers = await ethers.getSigners();
    user = signers[0];
    userAddress = user.address;

    const wethAbi = require("../artifacts/contracts/IWETH.sol/IWETH9.json").abi;
    const usdcAbi = require("../artifacts/contracts/IERC20.sol/ERC20.json").abi;
    const cometAbi = require("../artifacts/contracts/CometInterface.sol/CometInterface.json").abi;

    WETH = await ethers.getContractAt(wethAbi, WETHaddress, user);
    USDC = await ethers.getContractAt(usdcAbi, USDCaddress, user);
    Comet = await ethers.getContractAt(cometAbi, cometAddress, user);
  })

  it("WETH deposited", async () => {
    await WETH.deposit({ value: ethers.utils.parseEther('100') });
    const balance1 = await WETH.balanceOf(userAddress);
    const balance2 = await Comet.collateralBalanceOf(userAddress, WETHaddress);
    expect(parseFloat(ethers.utils.formatEther(balance1))).to.equal(100) && expect(balance2).to.equal(0);
  })

  it("Supplies collateral", async () => {
    await WETH.approve(cometAddress, amount);

    const balance1 = await WETH.balanceOf(userAddress);
    console.log('\tCurrent WETH balance:', + balance1.toString() / wethMantissa);

    console.log('\tSending initial supply to Compound...');
    await Comet.supply(WETHaddress, amount);

    const balance2 = await WETH.balanceOf(userAddress);
    console.log('\tCurrent WETH balance:', + balance2.toString() / wethMantissa);

    const collateralBalance = await Comet.collateralBalanceOf(userAddress, WETHaddress);
    console.log('\tCurrent WETH collateral balance:', + collateralBalance.toString() / wethMantissa);

    expect(parseFloat(ethers.utils.formatEther(balance1))).to.equal(100) &&
    expect(parseFloat(ethers.utils.formatEther(balance2))).to.equal(90) &&
    expect(parseFloat(ethers.utils.formatEther(collateralBalance))).to.equal(10);
  })

  it("Withdraws collateral", async () => {
    const balance1 = await WETH.balanceOf(userAddress);
    console.log('\tCurrent WETH balance:', + balance1.toString() / wethMantissa);

    console.log('\tWithdrawing collateral from Compound...');
    await Comet.withdraw(WETHaddress, ethers.utils.parseEther('10'));

    const balance2 = await WETH.balanceOf(userAddress);
    console.log('\tCurrent WETH balance:', + balance2.toString() / wethMantissa);

    collateralBalance = await Comet.collateralBalanceOf(userAddress, WETHaddress);
    console.log('\tCurrent WETH collateral balance:', + collateralBalance.toString() / wethMantissa);

    expect(parseFloat(ethers.utils.formatEther(balance1))).to.equal(90) &&
    expect(parseFloat(ethers.utils.formatEther(balance2))).to.equal(100) &&
    expect(parseFloat(ethers.utils.formatEther(collateralBalance))).to.equal(0);
  })

  it("Borrows the base asset", async () => {
    await WETH.approve(cometAddress, amount);
    await Comet.supply(WETHaddress, amount);

    const balance1 = await USDC.balanceOf(userAddress);
    console.log('\tCurrent USDC balance:', + balance1.toString() / baseAssetMantissa);

    const borrowSize = 1000;
    console.log('\tBorrow size:', borrowSize, ' USDC');

    console.log('\tExecuting USDC borrow from Compound...');
    await Comet.withdraw(USDCaddress, (borrowSize * baseAssetMantissa).toString());

    const balance2 = await USDC.balanceOf(userAddress);
    console.log('\tCurrent USDC balance:', + balance2.toString() / baseAssetMantissa);

    expect(parseFloat(ethers.utils.formatUnits(balance1, 6))).to.equal(0) &&
    expect(parseFloat(ethers.utils.formatUnits(balance2, 6))).to.equal(1000);
  });

  it("Partial repay the base asset", async () => {
    const balance1 = await USDC.balanceOf(userAddress);
    console.log('\tCurrent USDC balance:', + balance1.toString() / baseAssetMantissa);

    const repayAmount = 250;

    await USDC.approve(cometAddress, (repayAmount * baseAssetMantissa).toString());

    console.log('\tPartial repaying the open borrow...', repayAmount);
    await Comet.supply(USDCaddress, repayAmount * baseAssetMantissa);

    const balance2 = await USDC.balanceOf(userAddress);
    console.log('\tCurrent USDC balance:', + balance2.toString() / baseAssetMantissa);

    expect(parseFloat(ethers.utils.formatUnits(balance1, 6))).to.equal(1000) &&
    expect(parseFloat(ethers.utils.formatUnits(balance2, 6))).to.equal(750);
  });

  it("Fully repay the base asset", async () => {
    const balance1 = await USDC.balanceOf(userAddress);
    console.log('\tCurrent USDC balance:', + balance1.toString() / baseAssetMantissa);

    const repayAmount = 750;

    await USDC.approve(cometAddress, (repayAmount * baseAssetMantissa).toString());

    console.log('\tPartial repaying the open borrow...', repayAmount);
    await Comet.supply(USDCaddress, repayAmount * baseAssetMantissa);

    const balance2 = await USDC.balanceOf(userAddress);
    console.log('\tCurrent USDC balance:', + balance2.toString() / baseAssetMantissa);

    expect(parseFloat(ethers.utils.formatUnits(balance1, 6))).to.equal(750) &&
    expect(parseFloat(ethers.utils.formatUnits(balance2, 6))).to.equal(0);
  })
})
