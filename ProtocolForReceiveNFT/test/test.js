const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Protocol For Receive NFT", function () {

  let alice;
  let bob;
  let secret;

  let verifierContract;
  let nftContract;
  let protocolContract;

  beforeEach(async () => {
    [alice, bob, secret] = await ethers.getSigners();

    const VerifierFactory = await ethers.getContractFactory("VerifySignature");
    const contract1 = await VerifierFactory.deploy();
    verifierContract = await contract1.deployed();

    const ProtocolFactory = await ethers.getContractFactory("Protocol");
    const contract2 = await ProtocolFactory.deploy(verifierContract.address);
    protocolContract = await contract2.deployed();

    const NFTFactory = await ethers.getContractFactory("AliceNFT");
    const contract3 = await NFTFactory.deploy(protocolContract.address);
    nftContract = await contract3.deployed();
  });

  describe("NFT Contract", function () {
    it("deployed", async function () {
      expect(await nftContract.symbol()).to.be.equal('ANFT') &&
      expect(await nftContract.name()).to.be.equal('Alice NFT') &&
      expect(await nftContract.NFTProtocolContractAddress()).to.be.equal(protocolContract.address);
    });

    it("minting & protocol approved", async function () {
      await nftContract.safeMint('t');
      expect(await nftContract.ownerOf(1)).to.be.equal(alice.address) &&
      expect(await nftContract.isApprovedForAll(alice.address, protocolContract.address)).to.be.true;
    });
  });

  describe("Verify Contract", function () {
    it("verifies correctly", async function () {
      const amount = 999;
      const message = "Hello";
      const nonce = 123;
      const to = bob.address;

      const hash = await verifierContract.getMessageHash(to, amount, message, nonce);
      const sig = await alice.signMessage(ethers.utils.arrayify(hash));

      expect(await verifierContract.verify(alice.address, to, amount, message, nonce, sig)).to.be.true &&
      expect(await verifierContract.verify(alice.address, to, amount + 1, message, nonce, sig)).to.be.false;
    });
  });

  describe("Protocol Contract", function () {
    it("deployed", async function () {
      expect(await protocolContract.verifySignatureContract()).to.be.equal(verifierContract.address);
    });

    it("nft deposited", async function () {
      await nftContract.safeMint('t');

      await protocolContract.depositNFT(nftContract.address, 1, secret.address);

      expect(await protocolContract.nftId()).to.be.equal(1) &&
      expect(await protocolContract.nftContract()).to.be.equal(nftContract.address) &&
      expect(await nftContract.ownerOf(1)).to.be.equal(protocolContract.address);
    });

    it("withdraw reverts if nft is not deposited", async function () {
      const amount = 999;
      const message = "Hello";
      const nonce = 123;
      const to = bob.address;

      const hash = await verifierContract.getMessageHash(to, amount, message, nonce);
      const sig = await alice.signMessage(ethers.utils.arrayify(hash));

      const ethHash = await verifierContract.getEthSignedMessageHash(hash);

      await expect(protocolContract.withdrawNFT(ethHash, sig)).to.be.revertedWith("Requested nft is not available yet.");
    });

    it("nft withdrawed with correct signature", async function () {
      await nftContract.safeMint('t');

      await protocolContract.depositNFT(nftContract.address, 1, secret.address);

      const amount = 999;
      const message = "Hello";
      const nonce = 123;
      const to = bob.address;

      const hash = await verifierContract.getMessageHash(to, amount, message, nonce);
      const ethHash = await verifierContract.getEthSignedMessageHash(hash);
      const sig = await secret.signMessage(ethers.utils.arrayify(hash));

      await protocolContract.connect(bob).withdrawNFT(ethHash, sig);

      expect(await nftContract.ownerOf(1)).to.be.equal(bob.address);

    });

    it("withdraw reverts with incorrect signature", async function () {
      await nftContract.safeMint('t');

      await protocolContract.depositNFT(nftContract.address, 1, secret.address);

      const amount = 999;
      const message = "Hello";
      const nonce = 123;
      const to = bob.address;

      const hash = await verifierContract.getMessageHash(to, amount, message, nonce);
      const ethHash = await verifierContract.getEthSignedMessageHash(hash);
      const sig = await bob.signMessage(ethers.utils.arrayify(hash));

      await expect(protocolContract.connect(bob).withdrawNFT(ethHash, sig)).to.be.revertedWith("Invalid signature, transfer can not be proceeded.");
    });

  });
});