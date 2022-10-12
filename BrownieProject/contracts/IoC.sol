// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./utils/ERC721.sol";
import "./ReputationRouter.sol";

/**
 * @dev Indicator of Comprometations collection
 */
contract IoC is ERC721 {

    ReputationRouter public reputationRouter;

    /**
     * @dev tokenId => iocHash
     */
    mapping(uint256 => bytes32) public iocHash;
 
    modifier onlyReputationRouter() {
        require(msg.sender == address(reputationRouter), "IoC: msg.sender is not reputationRouter");
        _;
    }

    function initialize(address reputationRouter_) public {
        require(address(reputationRouter) == address(0), "IoC: initialized");
        reputationRouter = ReputationRouter(reputationRouter_);
        require(msg.sender == reputationRouter.shareholder() || msg.sender == reputationRouter_, "IoC: invalid reputation router address");
    }

    function mint(bytes32 iocHash_, address to) public onlyReputationRouter {
        uint256 tokenId = totalSupply();
        iocHash[tokenId] = iocHash_;
        _mint(to, tokenId);
    }

    function getIoCStorage() public view returns(address) {
        return address(reputationRouter.iocStorage());
    }

}
