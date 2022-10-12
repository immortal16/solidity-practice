const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

const BN = hre.ethers.BigNumber;
const toBN = (num) => BN.from(num);

describe("Verify", function(){
   
    let shareholder
    let endpoint1
    let endpoint2

    let shareholderAddress
    let endpoint1Address
    let endpoint2Address

    let ReputationRouter
    let reputationRouterAddress
    let reputationRouter

    it('Deployment of ReputationRouter', async function(){
        let signers = await hre.ethers.getSigners();
        shareholder = signers[0]
        endpoint1 = signers[1]
        endpoint2 = signers[2]

        shareholderAddress = shareholder.address
        endpoint1Address = endpoint1.address
        endpoint2Address = endpoint2.address

        const { deploymentSystem } = require("../scripts/deployment/System/deploymentSystem.js")
        let addresses = await deploymentSystem()
        reputationRouterAddress = addresses.reputationRouterAddress

        ReputationRouter = await hre.ethers.getContractFactory("ReputationRouter");
        reputationRouter = await ReputationRouter.attach(reputationRouterAddress)
    })

    it('Endpoint1 addIoC', async function(){
        reputationRouter = reputationRouter.connect(endpoint1)

        let iocHash = "0xf79a63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7962c527ae"
        let messageHashFromContract = await reputationRouter.getMessageHash(
            endpoint1Address, 
            "0xeee20731",
            iocHash,
            "0x"
        )

        console.log("endpoint1Address: " + endpoint1Address)
        console.log("addIoCSelector: " +  "0xeee20731")
        console.log("iocHash: " + iocHash)
        console.log("extraData: " + "0x")
        
        let shareholderSignature = await shareholder.signMessage(ethers.utils.arrayify(messageHashFromContract))
        console.log("shareholderSignature:")
        console.log(shareholderSignature)
        addIoC_tx = await reputationRouter.addIoC(iocHash, shareholderSignature)
        console.log(addIoC_tx)

    })

    it('Endpoint2 reportIoC', async function(){
        reputationRouter = reputationRouter.connect(endpoint2)

        let iocHash = "0xf79a63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7962c527ae"
        let reportHash = "0xbb122222eda583b3e855125ea4a3d96c325051a41eb05a0666d4e777118b0bd4"
        let messageHashFromContract = await reputationRouter.getMessageHash(
            endpoint2Address, 
            "0xeb6bfde9",
            iocHash,
            reportHash
        )
        
        let shareholderSignature = await shareholder.signMessage(ethers.utils.arrayify(messageHashFromContract))
        await reputationRouter.reportIoC(iocHash, reportHash, shareholderSignature)
    })

    it('Endpoint1 mintIoC', async function(){
        reputationRouter = reputationRouter.connect(endpoint1)

        let iocHash = "0xf79a63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7962c527ae"
        let iocData = "{ioc:91}"
        let iocDataHex = ethers.utils.toUtf8Bytes(iocData) // Uint8Array(8) [123, 105, 111,  99, 58,  57,  49, 125]
        let iocDataHexString = "0x" + Buffer.from(iocDataHex).toString('hex')   //0x7b696f633a39317d
        
        // 0x 7b | 69 | 6f | 63 | 3a | 39 | 31 | 7d
        //    {    i    o    c    :    9    1    }
        console.log(iocDataHex)
        console.log(iocDataHexString)
        let messageHashFromContract = await reputationRouter.getMessageHash(
            endpoint1Address, 
            "0xcecac20b",
            iocHash,
            iocDataHexString
        )
        
        let shareholderSignature = await shareholder.signMessage(ethers.utils.arrayify(messageHashFromContract))
        await reputationRouter.mintIoC(iocHash, iocData, shareholderSignature)
    })
})