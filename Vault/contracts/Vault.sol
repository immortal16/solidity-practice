// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "./openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "./openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "./comet/CometInterface.sol";

contract Vault is Initializable, ERC20Upgradeable, PausableUpgradeable, OwnableUpgradeable {

    using SafeERC20Upgradeable for IERC20Upgradeable;

    address public USDCaddress;
    address public cometAddress;

    IERC20Upgradeable private token;
    CometInterface private comet;

    event Mint(address indexed user, uint256 amount, string comment);
    event Burn(address indexed user, uint256 amount, string comment);

    function initialize(address _usdc, address _comet)
        reinitializer(1)
        public 
    {
        USDCaddress = _usdc;
        cometAddress = _comet;
        token = IERC20Upgradeable(USDCaddress);
        comet = CometInterface(cometAddress);
        __ERC20_init("Vault Share", "VS");
        __Pausable_init_unchained();
        __Ownable_init_unchained();
    }

    function deposit(uint256 _amount) external whenNotPaused {
        uint256 shares;
        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply()) / token.balanceOf(address(this));
        }

        _mint(msg.sender, shares);
        emit Mint(msg.sender, shares, "Shares minted.");
        token.safeTransferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint256 _shares) external whenNotPaused {
        uint256 amount = (_shares * token.balanceOf(address(this))) / totalSupply();
        _burn(msg.sender, _shares);
        emit Burn(msg.sender, _shares, "Shares burned.");
        token.safeTransfer(msg.sender, amount);
    }

    function supplyCompound() external whenPaused onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.safeApprove(cometAddress, balance);
        comet.supply(USDCaddress, balance);
    }

    function withdrawCompound() external whenPaused onlyOwner {
        uint256 balanceWithInterest = comet.balanceOf(address(this));
        comet.withdraw(USDCaddress, balanceWithInterest);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}