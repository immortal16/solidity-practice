const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

const BN = hre.ethers.BigNumber;
const toBN = (num) => BN.from(num);

describe("Swap", function () {

    let user
    let userAddress

    let uniswapV2
    let uniswapV2Address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' // https://etherscan.io/address/0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
    let DAI_address = '0x6b175474e89094c44da98b954eedeac495271d0f' // https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f
    let WETH_address    // will be read from uniswapV2Router contract
    
    it('Attaching', async function(){
        let signers = await hre.ethers.getSigners();
        user = signers[0]
        userAddress = user.address
        console.log("User address: " + userAddress)
        let uniswapV2Router02Abi = require("../artifacts/contracts/IUniswapV2Router02.sol/IUniswapV2Router02.json").abi
       
        uniswapV2 = await ethers.getContractAt(uniswapV2Router02Abi, uniswapV2Address, user)
        WETH_address = await uniswapV2.WETH()
        console.log("WETH address: " + WETH_address)

    })  

    it('Swap', async function() {
        /**
        function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
            external
            payable
            returns (uint[] memory amounts);
         */

        let amountIn = toBN(1).mul(toBN(10).pow(toBN(18)))
        let amountOutMin = toBN(1).mul(toBN(10).pow(toBN(18)))
        let path = [WETH_address, DAI_address]
        let to = userAddress
        let deadline = Math.floor(Date.now() / 1000) + 20*60
        let tx = await uniswapV2.swapExactETHForTokens(amountOutMin, path, to, deadline, {value: amountIn})
        console.log(tx)

    })
    
    
});
  