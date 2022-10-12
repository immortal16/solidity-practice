const { expect } = require("chai")
const { ethers } = require("hardhat")

const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

describe("SwapV3", () => {
  let user;
  let userAddress;

  let wethContract;
  let daiContract;
  let swapRouterContract;

  before(async () => {
    const signers = await ethers.getSigners();
    user = signers[0];
    userAddress = user.address;

    const wethAbi = require("../artifacts/contracts/IWETH9.sol/IWETH9.json").abi;
    const daiAbi = require("../artifacts/contracts/IERC20.sol/IERC20.json").abi;
    const routerAbi = require("../artifacts/contracts/ISwapRouter.sol/ISwapRouter.json").abi;

    wethContract = await ethers.getContractAt(wethAbi, wethAddress, user);
    daiContract = await ethers.getContractAt(daiAbi, daiAddress, user);
    swapRouterContract = await ethers.getContractAt(routerAbi, swapRouterAddress, user);
  })

  it("swap exactInputSingle", async () => {
    const provider = ethers.provider;

    let balanceBeforeETH = await provider.getBalance(userAddress);
    balanceBeforeETH = ethers.utils.formatEther(balanceBeforeETH);
    console.log(`ETH balance before swap : ${balanceBeforeETH} ETH`);

    let balanceBeforeDAI = await daiContract.balanceOf(userAddress);
    balanceBeforeDAI = ethers.utils.formatUnits(balanceBeforeDAI, 18);
    console.log(`DAI balance before swap : ${balanceBeforeDAI} DAI`);

    const amountIn = ethers.utils.parseEther("10");

    await wethContract.deposit({ value: amountIn });
    await wethContract.approve(swapRouterAddress, amountIn);

    const params = {
      tokenIn: wethAddress,
      tokenOut: daiAddress,
      fee: 3000,
      recipient: userAddress,
      deadline: Math.floor(Date.now() / 1000) + 20*60,
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0
    };

    await swapRouterContract.exactInputSingle(params);

    let balanceAfterETH = await provider.getBalance(userAddress);
    balanceAfterETH = ethers.utils.formatEther(balanceAfterETH);
    console.log(`ETH balance after swap : ${balanceAfterETH} ETH`);

    let balanceAfterDAI = await daiContract.balanceOf(userAddress);
    balanceAfterDAI = ethers.utils.formatUnits(balanceAfterDAI, 18);
    console.log(`DAI balance after swap : ${balanceAfterDAI} DAI`);

    expect(parseFloat(balanceAfterETH) < parseFloat(balanceBeforeETH)).to.be.true &&
    expect(parseFloat(balanceAfterDAI) > parseFloat(balanceBeforeDAI)).to.be.true;
  })
})