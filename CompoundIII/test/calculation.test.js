const { expect } = require("chai")
const { ethers } = require("hardhat")

const WETHaddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const UNIaddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
const WBTCaddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

const USDCaddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDCwhaleAddress = '0x7713974908be4bed47172370115e8b1219f4a5f0';

const cometAddress = '0xc3d688B66703497DAA19211EEdff47f25384cdc3';

let WETH;
let UNI;
let WBTC;

let USDC;
let Comet;

let user;
let userAddress;

const chainlinkAbi = require("../artifacts/contracts/AggregatorV3Interface.sol/AggregatorV3Interface.json").abi;


describe("Compound III Comet Interface", () => {
  before(async () => {
    const signers = await ethers.getSigners();
    user = signers[0];
    userAddress = user.address;

    const wethAbi = require("../artifacts/contracts/IWETH.sol/IWETH9.json").abi;
    const erc20Abi = require("../artifacts/contracts/IERC20.sol/ERC20.json").abi;
    const cometAbi = require("../artifacts/contracts/CometInterface.sol/CometInterface.json").abi;

    WETH = await ethers.getContractAt(wethAbi, WETHaddress, user);
    UNI = await ethers.getContractAt(erc20Abi, WETHaddress, user);
    WBTC = await ethers.getContractAt(erc20Abi, WETHaddress, user);

    USDC = await ethers.getContractAt(erc20Abi, USDCaddress, user);

    Comet = await ethers.getContractAt(cometAbi, cometAddress, user);
  })

  it("protocol params & assets price", async () => {
    let wethPriceFeed;
    let uniPriceFeed;
    let wbtcPriceFeed;

    await Comet.getAssetInfoByAddress(WETHaddress).then((data) => {
        wethPriceFeed = data[2];
        const wethFactor = data[4];
        console.log('WETH Price Feed:', wethPriceFeed);
        console.log('WETH factor:', wethFactor / 1e18, '\n');
    });
    await Comet.getAssetInfoByAddress(UNIaddress).then((data) => {
        uniPriceFeed = data[2];
        const uniFactor = data[4];
        console.log('UNI Price Feed:', uniPriceFeed);
        console.log('UNI factor:', uniFactor / 1e18, '\n');
    });
    await Comet.getAssetInfoByAddress(WBTCaddress).then((data) => {
        wbtcPriceFeed = data[2];
        const wbtcFactor = data[4];
        console.log('WBTC Price Feed:', wbtcPriceFeed);
        console.log('WBTC factor:', wbtcFactor / 1e18, '\n');
    });

    const PriceFeedWETH = await ethers.getContractAt(chainlinkAbi, wethPriceFeed, user);
    const PriceFeedUNI = await ethers.getContractAt(chainlinkAbi, uniPriceFeed, user);
    const PriceFeedWBTC = await ethers.getContractAt(chainlinkAbi, wbtcPriceFeed, user);

    await PriceFeedWETH.latestRoundData().then((data) => {
        const price = data[1];
        console.log('WETH Price:', price / 1e8, 'USDC');
    })

    await PriceFeedUNI.latestRoundData().then((data) => {
        const price = data[1];
        console.log('UNI Price:', price / 1e8, 'USDC');
    })

    await PriceFeedWBTC.latestRoundData().then((data) => {
        const price = data[1];
        console.log('WBTC Price:', price / 1e8, 'USDC');
    })

    const seconds_per_year = 60 * 60 * 24 * 365;
    const utilization = await Comet.getUtilization();

    const supplyRate = await Comet.getSupplyRate(utilization);
    const borrowRate = await Comet.getBorrowRate(utilization);

    console.log('\nCompound Supply APR:', 100 * seconds_per_year * supplyRate / 1e18);
    console.log('\nCompound Borrow APR:', 100 * seconds_per_year * borrowRate / 1e18);
  })

  it("calculation data proof (WETH case) borrow", async () => {
    let wethFactor;
    let price;

    const amount = ethers.utils.parseEther('10');

    await WETH.deposit({ value: ethers.utils.parseEther('100') });
    await WETH.approve(cometAddress, amount);

    await Comet.supply(WETHaddress, amount);

    const seconds_per_year = 60 * 60 * 24 * 365;
    const utilization = await Comet.getUtilization();
    const borrowRate = await Comet.getBorrowRate(utilization);
    console.log('Calculation borrow APR: 3.746899335096 %');
    console.log('Actual borrow APR:', 100 * seconds_per_year * borrowRate / 1e18, '%');

    const collBalance = await Comet.collateralBalanceOf(userAddress, WETHaddress);
    console.log('\nCalculation collateral balance, WETH: 10');
    console.log('Actual collateral balance, WETH:', collBalance.toString() / 1e18);

    console.log('\nCalculation borrow collateral factor: 0.825');
    await Comet.getAssetInfoByAddress(WETHaddress).then((data) => {
        wethPriceFeed = data[2];
        wethFactor = data[4];
        console.log('Actual borrow collateral factor:', wethFactor / 1e18);
    });

    console.log('\nCalculation collateral asset price, USDC: 1336.48099707')
    const PriceFeedWETH = await ethers.getContractAt(chainlinkAbi, wethPriceFeed, user);

    await PriceFeedWETH.latestRoundData().then((data) => {
        price = data[1];
        console.log('Actual collateral asset price, USDC:', price / 1e8);
    })

    console.log('\nCalculation liquidity, USDC: 11025.9682')
    const liquidity = price * wethFactor * collBalance / 1e44;
    console.log('Actual liquidity, USDC:', liquidity);

    const borrowSize = 5000;
    await Comet.withdraw(USDCaddress, (borrowSize * 1e6).toString());

    await ethers.provider.send('evm_increaseTime', [365 * 24 * 60 * 60]);
    await ethers.provider.send('evm_mine');

    console.log('\nCalculation borrow balance, USDC: 5187.344967');
    const borrBalance = await Comet.borrowBalanceOf(userAddress);
    console.log('Actual borrow balance, USDC:', borrBalance.toString() / 1e6);
  })

  it("calculation data proof supply", async () => {
    user = await ethers.getImpersonatedSigner(USDCwhaleAddress);
    userAddress = user.address;

    const supplyAmount = ethers.utils.parseUnits('10000', 6);

    await USDC.connect(user).approve(cometAddress, supplyAmount);

    await Comet.connect(user).supply(USDCaddress, supplyAmount);

    const seconds_per_year = 60 * 60 * 24 * 365;
    const utilization = await Comet.getUtilization();
    const supplyRate = await Comet.getSupplyRate(utilization);
    console.log('Calculation supply APR: 2.086406528 %');
    console.log('Actual supply APR:', 100 * seconds_per_year * supplyRate / 1e18, '%');

    await ethers.provider.send('evm_increaseTime', [365 * 24 * 60 * 60]);
    await ethers.provider.send('evm_mine');

    console.log('\nCalculation base balance, USDC: 10208.64065');
    const baseBalance = await Comet.connect(user).balanceOf(userAddress);
    console.log('Actual base balance, USDC:', baseBalance.toString() / 1e6);
  })
})
