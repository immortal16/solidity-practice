const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

const BN = hre.ethers.BigNumber;
const toBN = (num) => BN.from(num);

describe("Verify", function(){
   
    let shareholder
    let endpoint

    let ReputationRouter
    let reputationRouterAddress
    let reputationRouter

    it('Deployment of ReputationRouter', async function(){
        let signers = await hre.ethers.getSigners();
        shareholder = signers[0]
        endpoint = signers[1]

        const { deploymentSystem } = require("../scripts/deployment/System/deploymentSystem.js")
        let addresses = await deploymentSystem()
        reputationRouterAddress = addresses.reputationRouterAddress

        ReputationRouter = await hre.ethers.getContractFactory("ReputationRouter");
        reputationRouter = await ReputationRouter.attach(reputationRouterAddress)
    })

    it('Sign and verify addIoC', async function(){

        let addIoCFunction = "addIoC(bytes32,bytes)"
        let addIoCFunctionBytes = ethers.utils.toUtf8Bytes(addIoCFunction)          // bytes representation of string "addIoC(bytes32,bytes)"
        let addIoCFunctionBytesHash = ethers.utils.keccak256(addIoCFunctionBytes)   // hash of bytes representation of string "addIoC(bytes32,bytes)"
        let addIoCFunctionSelector = addIoCFunctionBytesHash.substring(0,10)        // first 4 bytes of hash
        let endpointAddress = endpoint.address
        let addIoCSelector = addIoCFunctionSelector // 0xeee20731
        let iocHash = "0xf79a63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7962c527ae"
        let extraData = "0x";

        console.log(endpointAddress)
        console.log(addIoCSelector)
        console.log(iocHash)
        console.log(extraData)

        message = endpointAddress + addIoCSelector.slice(2) + iocHash.slice(2) + extraData.slice(2)
        console.log("\nmessage:")
        console.log(message)

        let messageHashFromLocalCode = ethers.utils.keccak256(message)
        console.log("messageHashFromLocalCode:")
        console.log(messageHashFromLocalCode)

        let messageHashFromContract = await reputationRouter.getMessageHash(
            endpointAddress, 
            addIoCSelector,
            iocHash,
            extraData
        )
        console.log("messageHashFromContract:")
        console.log(messageHashFromContract)
       
        let signature = await shareholder.signMessage(ethers.utils.arrayify(messageHashFromLocalCode))
        console.log("\nsignature")
        console.log(signature)
        
        let result = await reputationRouter.verify(
            endpointAddress,
            addIoCSelector,
            iocHash,
            extraData,
            signature
        )
        console.log(result)
    })

    it('Sign and verify reportIoC', async function(){

        let reportIoCFunction = "reportIoC(bytes32,bytes32,bytes)"
        let reportIoCFunctionBytes = ethers.utils.toUtf8Bytes(reportIoCFunction)          // bytes representation of string "reportIoC(bytes32,bytes)"
        let reportIoCFunctionBytesHash = ethers.utils.keccak256(reportIoCFunctionBytes)   // hash of bytes representation of string "reportIoC(bytes32,bytes)"
        let reportIoCFunctionSelector = reportIoCFunctionBytesHash.substring(0,10)        // first 4 bytes of hash
        let endpointAddress = endpoint.address
        let reportIoCSelector = reportIoCFunctionSelector
        let iocHash = "0xf79a63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7962c527ae"
        let extraData = "0x6e9a63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7962c527ad";

        console.log(endpointAddress)
        console.log(reportIoCSelector)
        console.log(iocHash)
        console.log(extraData)

        message = endpointAddress + reportIoCSelector.slice(2) + iocHash.slice(2) + extraData.slice(2)
        console.log("\nmessage:")
        console.log(message)

        let messageHashFromLocalCode = ethers.utils.keccak256(message)
        console.log("messageHashFromLocalCode:")
        console.log(messageHashFromLocalCode)

        let messageHashFromContract = await reputationRouter.getMessageHash(
            endpointAddress, 
            reportIoCSelector,
            iocHash,
            extraData
        )
        console.log("messageHashFromContract:")
        console.log(messageHashFromContract)
       
        let signature = await shareholder.signMessage(ethers.utils.arrayify(messageHashFromLocalCode))
        console.log("\nsignature")
        console.log(signature)
        
        let result = await reputationRouter.verify(
            endpointAddress,
            reportIoCSelector,
            iocHash,
            extraData,
            signature
        )
        console.log(result)
    })

    it('Sign and verify mintIoC', async function(){

        let mintIoCFunction = "mintIoC(bytes32,string,bytes)"
        let mintIoCFunctionBytes = ethers.utils.toUtf8Bytes(mintIoCFunction)          // bytes representation of string "mintIoC(bytes32,bytes)"
        let mintIoCFunctionBytesHash = ethers.utils.keccak256(mintIoCFunctionBytes)   // hash of bytes representation of string "mintIoC(bytes32,bytes)"
        let mintIoCFunctionSelector = mintIoCFunctionBytesHash.substring(0,10)        // first 4 bytes of hash
        let endpointAddress = endpoint.address
        let mintIoCSelector = mintIoCFunctionSelector
        let iocHash = "0xf79a63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7962c527ae"
        let extraData = "0x6e9a63dcec80ed75c60383a7be0a0ee7962cad";

        console.log(endpointAddress)
        console.log(mintIoCSelector)
        console.log(iocHash)
        console.log(extraData)

        message = endpointAddress + mintIoCSelector.slice(2) + iocHash.slice(2) + extraData.slice(2)
        console.log("\nmessage:")
        console.log(message)

        let messageHashFromLocalCode = ethers.utils.keccak256(message)
        console.log("messageHashFromLocalCode:")
        console.log(messageHashFromLocalCode)

        let messageHashFromContract = await reputationRouter.getMessageHash(
            endpointAddress, 
            mintIoCSelector,
            iocHash,
            extraData
        )
        console.log("messageHashFromContract:")
        console.log(messageHashFromContract)
       
        let signature = await shareholder.signMessage(ethers.utils.arrayify(messageHashFromLocalCode))
        console.log("\nsignature")
        console.log(signature)
        
        let result = await reputationRouter.verify(
            endpointAddress,
            mintIoCSelector,
            iocHash,
            extraData,
            signature
        )
        console.log(result)
            

    })
})