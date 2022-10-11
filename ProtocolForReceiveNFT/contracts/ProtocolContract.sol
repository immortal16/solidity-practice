// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "./openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./interfaces/IVerifySignature.sol";
import "./interfaces/IERC721.sol";

contract Protocol is IERC721Receiver {

    address public verifySignatureContract;
    address public nftContract;
    address private signer;
    uint8 public nftId;

    event Deposit(uint8 tokenId);
    event Withdraw(uint8 tokenId);

    constructor(address _verifySignatureContractAddress) {
        verifySignatureContract = _verifySignatureContractAddress;
    }

    function transfer(address to, uint256 tokenId) private {
        IERC721(nftContract).safeTransferFrom(address(this), to, tokenId);
    }

    function depositNFT(address _nftContractAddress, uint8 id, address _signer) external {
        signer = _signer;
        nftId = id;
        nftContract = _nftContractAddress;

        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), id);
        emit Deposit(id);
    }

    function withdrawNFT(bytes32 _ethSignedMessageHash, bytes memory _signature) external {
        require(nftId != 0 && IERC721(nftContract).ownerOf(nftId) == address(this), "Requested nft is not available yet.");
        address _signer = IVerifySignature(verifySignatureContract).recoverSigner(_ethSignedMessageHash, _signature);
        require(_signer == signer, "Invalid signature, transfer can not be proceeded.");
        
        transfer(msg.sender, nftId);
        emit Withdraw(nftId);
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}