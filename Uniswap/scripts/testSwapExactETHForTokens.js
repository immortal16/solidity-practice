const { legos } = require('@studydefi/money-legos');
const { ethers } = require('hardhat');
const UNISWAP = require('@uniswap/sdk');

require('dotenv').config();

const receiver = '0x06A759d79246e76F6C6E770E9A28c342ffDF7A84';

async function main() {
    const chainId = UNISWAP.ChainId.GÖRLI;
    const provider = ethers.getDefaultProvider('goerli');

    // Goerli DAI token
    const daiAddress = '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60';
    const daiAbi = legos.erc20.dai.abi;
    const daiContract = new ethers.Contract(daiAddress, daiAbi, provider);
    const dai = new UNISWAP.Token(chainId, daiAddress, 18, 'DAI', 'DAI');

    // Goerli Uniswap v2 Router 02 
    const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const routerAbi = legos.uniswapV2.router02.abi;
    const routerContract = new ethers.Contract(routerAddress, routerAbi, provider);

    const weth = UNISWAP.WETH[chainId];

    const pair = await UNISWAP.Fetcher.fetchPairData(dai, weth, provider);
    const route = new UNISWAP.Route([pair], weth);

    let balanceBeforeETH = await ethers.provider.getBalance(receiver);
    balanceBeforeETH = ethers.utils.formatEther(balanceBeforeETH);
    console.log(`Ether balance before swap : ${balanceBeforeETH} ETH`);

    let balanceBeforeDAI = await daiContract.balanceOf(receiver);
    balanceBeforeDAI = ethers.utils.formatUnits(balanceBeforeDAI, 18);
    console.log(`Dai balance before swap : ${balanceBeforeDAI} DAI`);

    const amountIn = ethers.utils.parseEther("0.001");
    const trade = new UNISWAP.Trade(route, new UNISWAP.TokenAmount(weth, amountIn), UNISWAP.TradeType.EXACT_INPUT);

    const slippageTolerance = new UNISWAP.Percent('5', '100');
    const amountOutMin = `0x${trade.minimumAmountOut(slippageTolerance).raw.toString(16)}`;
    const path = [weth.address, daiAddress];
    const deadline = Math.floor(Date.now() / 1000) + 20*60;
    const gas = await provider.getGasPrice();

    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const tx = await routerContract.connect(signer).swapExactETHForTokens(
      amountOutMin,
      path,
      receiver,
      deadline,
      {value: amountIn, gasPrice: gas}
    );
    
    console.log('Swap processing...')
    receipt = await tx.wait();
    console.log(`https://goerli.etherscan.io/tx/${receipt.transactionHash}`);

    let balanceAfterETH = await ethers.provider.getBalance(receiver);
    balanceAfterETH = ethers.utils.formatEther(balanceAfterETH);
    console.log(`Ether balance after swap : ${balanceAfterETH} ETH`);

    let balanceAfterDAI = await daiContract.balanceOf(receiver);
    balanceAfterDAI = ethers.utils.formatUnits(balanceAfterDAI, 18);
    console.log(`DAI balance after swap : ${balanceAfterDAI} DAI`);

    console.log(`${balanceBeforeETH - balanceAfterETH} ETH swapped for ${balanceAfterDAI - balanceBeforeDAI} DAI`);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });