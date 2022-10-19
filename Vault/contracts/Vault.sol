// SPDX-License-Identifier: UNLICENSED

import "./Ownable.sol";
import "./Pausable.sol";
import "./CometInterface.sol";
import "./IERC20.sol";

pragma solidity 0.8.15;

contract Vault is Pausable, Ownable {

    address public constant USDCaddress = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant cometAddress = 0xc3d688B66703497DAA19211EEdff47f25384cdc3;

    ERC20 private constant token = ERC20(USDCaddress);
    CometInterface private constant comet = CometInterface(cometAddress);

    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    function _mint(address _to, uint _shares) private {
        totalSupply += _shares;
        balanceOf[_to] += _shares;
    }

    function _burn(address _from, uint _shares) private {
        totalSupply -= _shares;
        balanceOf[_from] -= _shares;
    }

    function deposit(uint _amount) external whenNotPaused {
        uint shares;
        if (totalSupply == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply) / token.balanceOf(address(this));
        }

        _mint(msg.sender, shares);
        token.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint _shares) external whenNotPaused {
        uint amount = (_shares * token.balanceOf(address(this))) / totalSupply;
        _burn(msg.sender, _shares);
        token.transfer(msg.sender, amount);
    }

    function supplyCompound() external whenPaused onlyOwner {
        uint balance = token.balanceOf(address(this));
        token.approve(cometAddress, balance);
        comet.supply(USDCaddress, balance);
    }

    function withdrawCompound() external whenPaused onlyOwner {
        uint balanceWithInterest = comet.balanceOf(address(this));
        comet.withdraw(USDCaddress, balanceWithInterest);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}