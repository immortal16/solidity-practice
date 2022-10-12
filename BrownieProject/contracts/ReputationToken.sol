// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./utils/ERC20.sol";
import "./ReputationRouter.sol";

contract ReputationToken is ERC20 {

    ReputationRouter public reputationRouter;

    uint256 public totalSupplyCap;

    modifier onlyReputationRouter() {
        require(msg.sender == address(reputationRouter), "Reputation: msg.sender is not reputationRouter");
        _;
    }

    function initialize(address reputationRouter_, uint256 totalSupplyCap_) public {
        __ERC20_init("Reputation Token", "REPT", 18);
        require(address(reputationRouter) == address(0), "ReputationToken: initialized");
        reputationRouter = ReputationRouter(reputationRouter_);
        require(msg.sender == reputationRouter.shareholder() || msg.sender == reputationRouter_, "ReputationToken: invalid reputation router address");
        require(totalSupplyCap_ > 0, "ReputationToken: total supply cap is zero");
        totalSupplyCap = totalSupplyCap_;
    }

    function mint(address account, uint256 amount) public onlyReputationRouter {
        require(totalSupply() + amount <= totalSupplyCap, "ReputationToken: total supply will exceed total supply cap");
        _mint(account, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function burnAll() public {
        uint256 amount = balanceOf(msg.sender);
        _burn(msg.sender, amount);
    }

}
