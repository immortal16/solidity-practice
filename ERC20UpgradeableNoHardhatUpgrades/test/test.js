const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('myTokenUpgradeable UUPS Contract', () => {

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

describe('myTokenUpgradeable Transparent Contract', () => {

    let owner;
    let addr1;
    let erc20;
    let proxy;
    let proxyAdmin;

    beforeEach(async () => {
        [owner, addr1] = await ethers.getSigners();

        const ProxyAdmin = await ethers.getContractFactory('TransparentProxyAdmin');
        const ProxyAdminContract = await ProxyAdmin.deploy();
        proxyAdmin = await ProxyAdminContract.deployed();

        const ERC20U = await ethers.getContractFactory('MyTokenUV1T');
        const implContract = await ERC20U.deploy();
        const implv1 = await implContract.deployed();

        const Proxy = await ethers.getContractFactory('TransparentProxy');
        // .\artifacts\contracts\ERC20UTransparent.sol\MyTokenUV1T.json -> https://abi.hashex.org/ -> initializeV1() -> 0x8129fc1c
        const proxyContract = await Proxy.deploy(implv1.address, proxyAdmin.address, "0x8129fc1c");
        proxy = await proxyContract.deployed();

        erc20 = await ERC20U.attach(proxy.address);
    });

    describe("Deployment and upgrade test", function() {
        it("Proxy and v1 deployed", async function () {
            const version = await erc20.connect(addr1).version();
            expect(version).to.equal('v1');
        });
        it("v2 deployed and proxy upgraded", async function () {
            const ERC20Uv2 = await ethers.getContractFactory('MyTokenUV2T');
            const implContractv2 = await ERC20Uv2.deploy();
            const implv2 = await implContractv2.deployed();
            
            // .\artifacts\contracts\ERC20UTransparent.sol\MyTokenUV2T.json -> https://abi.hashex.org/ -> initializeV2() -> 0x5cd8a76b
            await proxyAdmin.upgradeAndCall(proxy.address, implv2.address, "0x5cd8a76b");

            const erc20v2 = await ERC20Uv2.attach(proxy.address);

            const version = await erc20v2.connect(addr1).version();
            expect(version).to.equal('v2');
        });
        it("v3 deployed and proxy upgraded", async function () {
            const ERC20Uv2 = await ethers.getContractFactory('MyTokenUV2T');
            const implContractv2 = await ERC20Uv2.deploy();
            const implv2 = await implContractv2.deployed();

            // .\artifacts\contracts\ERC20UTransparent.sol\MyTokenUV2T.json -> https://abi.hashex.org/ -> initializeV2() -> 0x5cd8a76b
            await proxyAdmin.upgradeAndCall(proxy.address, implv2.address, "0x5cd8a76b");

            const ERC20Uv3 = await ethers.getContractFactory('MyTokenUV3T');
            const implContractv3 = await ERC20Uv3.deploy();
            const implv3 = await implContractv3.deployed();
            
            // .\artifacts\contracts\ERC20UTransparent.sol\MyTokenUV3T.json -> https://abi.hashex.org/ -> initializeV3() -> 0x38e454b1
            await proxyAdmin.upgradeAndCall(proxy.address, implv3.address, "0x38e454b1");

            const erc20v3 = await ERC20Uv3.attach(proxy.address);

            const version = await erc20v3.connect(addr1).version();
            expect(version).to.equal('v3');
        });
    });
});