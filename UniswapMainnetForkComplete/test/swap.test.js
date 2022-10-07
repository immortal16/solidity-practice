const { legos } = require('@studydefi/money-legos');
const { expect } = require("chai");
const { ethers } = require("hardhat");
const UNISWAP = require('@uniswap/sdk');

describe("Swap", function () {

    let user;
    let userAddress;
    let uniswapV2;

    const uniswapV2Address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    
    it('Attaching', async function() {
        const signers = await ethers.getSigners();
        user = signers[0];
        userAddress = user.address;
        const uniswapV2Router02Abi = require("../artifacts/contracts/IUniswapV2Router02.sol/IUniswapV2Router02.json").abi
       
        uniswapV2 = await ethers.getContractAt(uniswapV2Router02Abi, uniswapV2Address, user);
        const WETH_address = await uniswapV2.WETH();
   
        expect(WETH_address).to.equal('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');

    })  

    it('Swap', async function() {
        const chainId = UNISWAP.ChainId.MAINNET;
        const provider = ethers.provider;

        const daiAbi = legos.erc20.dai.abi;
        const daiContract = new ethers.Contract(daiAddress, daiAbi, provider);
        const dai = new UNISWAP.Token(chainId, daiAddress, 18, 'DAI', 'DAI');

        const weth = UNISWAP.WETH[chainId];

        const pair = await UNISWAP.Fetcher.fetchPairData(dai, weth, provider);
        const route = new UNISWAP.Route([pair], weth);

        let balanceBeforeETH = await provider.getBalance(userAddress);
        balanceBeforeETH = ethers.utils.formatEther(balanceBeforeETH);
        console.log(`ETH balance before swap : ${balanceBeforeETH} ETH`);

        let balanceBeforeDAI = await daiContract.balanceOf(userAddress);
        balanceBeforeDAI = ethers.utils.formatUnits(balanceBeforeDAI, 18);
        console.log(`DAI balance before swap : ${balanceBeforeDAI} DAI`);

        const amountIn = ethers.utils.parseEther("10");
        const trade = new UNISWAP.Trade(route, new UNISWAP.TokenAmount(weth, amountIn), UNISWAP.TradeType.EXACT_INPUT);

        const slippageTolerance = new UNISWAP.Percent('5', '100');
        const amountOutMin = `0x${trade.minimumAmountOut(slippageTolerance).raw.toString(16)}`;
        const path = [weth.address, daiAddress];
        const deadline = Math.floor(Date.now() / 1000) + 20*60;
        const gas = await provider.getGasPrice();

        await uniswapV2.swapExactETHForTokens(
            amountOutMin,
            path,
            userAddress,
            deadline,
            {value: amountIn, gasPrice: gas}
        );

        let balanceAfterETH = await provider.getBalance(userAddress);
        balanceAfterETH = ethers.utils.formatEther(balanceAfterETH);
        console.log(`ETH balance after swap : ${balanceAfterETH} ETH`);

        let balanceAfterDAI = await daiContract.balanceOf(userAddress);
        balanceAfterDAI = ethers.utils.formatUnits(balanceAfterDAI, 18);
        console.log(`DAI balance after swap : ${balanceAfterDAI} DAI`);

        expect(parseFloat(balanceAfterETH) < parseFloat(balanceBeforeETH)).to.be.true &&
        expect(parseFloat(balanceAfterDAI) > parseFloat(balanceBeforeDAI)).to.be.true;
    })
});
  