const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('myTokenUpgradeable Contract', () => {

    let contract;

    beforeEach(async () => {
        const Contract = await ethers.getContractFactory("MyTokenUV1");
        const contract_ = await upgrades.deployProxy(Contract, {initializer: 'initialize', kind: 'uups'});
        contract = await contract_.deployed();
    });

    describe("Deployment and upgrade test", function() {
        it("Proxy and v1 deployed", async function () {
            const version = await contract.version()
            expect(version).to.equal('v1');
        });
        it("v2 deployed and proxy upgraded", async function () {
            const Contractv2 = await ethers.getContractFactory("MyTokenUV2");
            const upgradedv2 = await upgrades.upgradeProxy(contract.address, Contractv2);
            const version = await upgradedv2.version()
            expect(version).to.equal('v2');
        });
        it("v3 deployed and proxy upgraded", async function () {
            const Contractv2 = await ethers.getContractFactory("MyTokenUV2");
            const Contractv3 = await ethers.getContractFactory("MyTokenUV3");
            await upgrades.upgradeProxy(contract.address, Contractv2);
            const upgradedv3 = await upgrades.upgradeProxy(contract.address, Contractv3);
            const version = await upgradedv3.version()
            expect(version).to.equal('v3');
        });
    });
});