// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyERC20 is ERC20, Ownable {

    event Mint(address indexed owner, uint24 amount, string comment);
    event Burn(address indexed from, uint24 amount, string comment);

    uint32 public constant maxSupply = 100000 * 10 ** 3;

    constructor(uint24 initialSupply) ERC20("MyToken", "MTK") {
        require(
            initialSupply * 10 ** decimals() <= maxSupply, 
            "Impossible, excessing maximum supply."
        );
        _mint(msg.sender, initialSupply * 10 ** decimals());
        emit Mint(msg.sender, initialSupply, "Initial supply minted.");
    }

    function decimals() public view virtual override returns (uint8) {
        return 3;
    }

    function mint(address to, uint24 amount) public onlyOwner {
        require(
            totalSupply() + amount * 10 ** decimals() <= maxSupply,
            "Impossible, excessing maximum supply."
        );
        _mint(to, amount * 10 ** decimals());
        emit Mint(owner(), amount, "Additional supply minted.");
    }

    function burn(uint24 amount) public {
        _burn(msg.sender, amount * 10 ** decimals());
        emit Burn(msg.sender, amount, "Tokens burned.");
    }
}

