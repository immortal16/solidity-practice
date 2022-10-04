const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('myTokenUpgradeable Contract', () => {

    let erc20;
    let proxy;

    beforeEach(async () => {
        const ERC20U = await ethers.getContractFactory('MyTokenUV1');
        const implContract = await ERC20U.deploy();
        const implv1 = await implContract.deployed();

        const Proxy = await ethers.getContractFactory('ERC20Proxy');
        const proxyContract = await Proxy.deploy(implv1.address);
        proxy = await proxyContract.deployed();

        await implv1.initialize();
        erc20 = await ERC20U.attach(proxy.address);
    });

    describe("Deployment and upgrade test", function() {
        it("Proxy and v1 deployed", async function () {
            const version = await erc20.version();
            expect(version).to.equal('v1');
        });
        it("v2 deployed and proxy upgraded", async function () {
            const ERC20Uv2 = await ethers.getContractFactory('MyTokenUV2');
            const implContractv2 = await ERC20Uv2.deploy();
            const implv2 = await implContractv2.deployed();

            await implv2.initialize();

            proxy.upgradeTo(implv2.address);
            erc20v2 = await ERC20Uv2.attach(proxy.address);
            const version = await erc20v2.version();
            expect(version).to.equal('v2');
        });
        it("v3 deployed and proxy upgraded", async function () {
            const ERC20Uv2 = await ethers.getContractFactory('MyTokenUV2');
            const implContractv2 = await ERC20Uv2.deploy();
            const implv2 = await implContractv2.deployed();

            await implv2.initialize();

            proxy.upgradeTo(implv2.address);
            erc20v2 = await ERC20Uv2.attach(proxy.address);

            const ERC20Uv3 = await ethers.getContractFactory('MyTokenUV3');
            const implContractv3 = await ERC20Uv3.deploy();
            const implv3 = await implContractv3.deployed();

            await implv3.initialize();

            proxy.upgradeTo(implv3.address);
            erc20v3 = await ERC20Uv3.attach(proxy.address);

            const version = await erc20v3.version();
            expect(version).to.equal('v3');
        });
    });
});