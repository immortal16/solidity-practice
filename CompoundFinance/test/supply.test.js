const { expect } = require("chai")
const { ethers } = require("hardhat")

const USDCaddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const USDCwhaleAddress = '0x7713974908be4bed47172370115e8b1219f4a5f0';
const cUSDCaddress = '0x39AA39c021dfbaE8faC545936693aC917d5E7563';

let USDCcontract;
let cUSDCcontract;
let user;
let userAddress;

describe("Compound Protocol", () => {
  before(async () => {
    user = await ethers.getImpersonatedSigner(USDCwhaleAddress);
    userAddress = user.address;

    const USDCabi = require('../artifacts/contracts/IERC20.sol/IERC20.json').abi;
    USDCcontract = await ethers.getContractAt(USDCabi, USDCaddress, user);

    const cUSDCabi = require('./cERC20.abi.json');
    cUSDCcontract = await ethers.getContractAt(cUSDCabi, cUSDCaddress, user);
  })

  it("account impersonated & contracts attached", async () => {
    const balance1 = await USDCcontract.balanceOf(userAddress);
    const balance2 = await cUSDCcontract.balanceOf(userAddress);
    expect(balance1 > 0).to.be.true && expect(balance2).to.equal(0);
  })

  it("supply compound protocol and get cTokens", async () => {
    let balanceBeforeUSDC = await USDCcontract.balanceOf(userAddress);
    balanceBeforeUSDC = ethers.utils.formatUnits(balanceBeforeUSDC, 6);
    console.log(`USDC balance before supply : ${balanceBeforeUSDC} USDC`);

    let balanceBeforecUSDC = await cUSDCcontract.balanceOf(userAddress);
    balanceBeforecUSDC = ethers.utils.formatUnits(balanceBeforecUSDC, 8);
    console.log(`cUSDC balance before supply : ${balanceBeforecUSDC} cUSDC`);

    const amount = ethers.utils.parseUnits('10000000', 6);
    await USDCcontract.approve(cUSDCcontract.address, amount);

    await cUSDCcontract.mint(amount);

    let balanceAfterUSDC = await USDCcontract.balanceOf(userAddress);
    balanceAfterUSDC = ethers.utils.formatUnits(balanceAfterUSDC, 6);
    console.log(`USDC balance after supply : ${balanceAfterUSDC} USDC`);

    let balanceAftercUSDC = await cUSDCcontract.balanceOf(userAddress);
    balanceAftercUSDC = ethers.utils.formatUnits(balanceAftercUSDC, 8);
    console.log(`cUSDC balance after supply : ${balanceAftercUSDC} cUSDC`);

    expect(parseFloat(balanceAfterUSDC) < parseFloat(balanceBeforeUSDC)).to.be.true &&
    expect(parseFloat(balanceAftercUSDC) > parseFloat(balanceBeforecUSDC)).to.be.true;
  })

  it("redeem cTokens and get underlying asset", async () => {
    let balanceBeforeUSDC = await USDCcontract.balanceOf(userAddress);
    balanceBeforeUSDC = ethers.utils.formatUnits(balanceBeforeUSDC, 6);
    console.log(`USDC balance before redeem : ${balanceBeforeUSDC} USDC`);

    let balanceBeforecUSDC = await cUSDCcontract.balanceOf(userAddress);
    balanceBeforecUSDC = ethers.utils.formatUnits(balanceBeforecUSDC, 8);
    console.log(`cUSDC balance before redeem : ${balanceBeforecUSDC} cUSDC`);

    const cTokenBalance = cUSDCcontract.balanceOf(userAddress);
    await cUSDCcontract.redeem(cTokenBalance);

    let balanceAfterUSDC = await USDCcontract.balanceOf(userAddress);
    balanceAfterUSDC = ethers.utils.formatUnits(balanceAfterUSDC, 6);
    console.log(`USDC balance after redeem : ${balanceAfterUSDC} USDC`);

    let balanceAftercUSDC = await cUSDCcontract.balanceOf(userAddress);
    balanceAftercUSDC = ethers.utils.formatUnits(balanceAftercUSDC, 8);
    console.log(`cUSDC balance after redeem : ${balanceAftercUSDC} cUSDC`);

    expect(parseFloat(balanceBeforeUSDC) < parseFloat(balanceAfterUSDC)).to.be.true &&
    expect(parseFloat(balanceAftercUSDC)).to.equal(0);
  })

  it("accumulating interest", async () => {
    let balanceBeforeUSDC = await USDCcontract.balanceOf(userAddress);
    balanceBeforeUSDC = ethers.utils.formatUnits(balanceBeforeUSDC, 6);

    const amount = ethers.utils.parseUnits('10000000', 6);

    await USDCcontract.approve(cUSDCcontract.address, amount);
    await cUSDCcontract.mint(amount);

    const cTokenBalance = cUSDCcontract.balanceOf(userAddress);
    await cUSDCcontract.redeem(cTokenBalance);

    let balanceAfterUSDC = await USDCcontract.balanceOf(userAddress);
    balanceAfterUSDC = ethers.utils.formatUnits(balanceAfterUSDC, 6);

    expect(parseFloat(balanceBeforeUSDC) < parseFloat(balanceAfterUSDC)).to.be.true;
  }) 
})