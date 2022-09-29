// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyERC1155 is ERC1155, Ownable {

    uint8 public constant CHARACTER = 0;
    uint8 public constant ARMOUR = 1;
    uint8 public constant WEAPON = 2;
    uint8 public constant CHARACTER_EFFECT = 3;

    uint public constant MINT_PRICE = 0.001 ether;

    constructor() ERC1155("https://game.example/api/item/{id}.json") {}

    modifier characterExist {
        require(
            balanceOf(msg.sender, CHARACTER) == 1,
            "You should have a Character."
        );
      _;
   }

   modifier priceCheck {
        require(
            msg.value >= MINT_PRICE,
            "Not enough funds for minting item."
        );
      _;
   }

    function mintCharacter() public payable priceCheck {
        require(
            balanceOf(msg.sender, CHARACTER) == 0,
            "You already have a Character."
        );
        _mint(msg.sender, CHARACTER, 1, "");
    }

    function mintArmour() public payable characterExist priceCheck {
        require(
            balanceOf(msg.sender, ARMOUR) == 0,
            "You already have an Armour"
        );
        _mint(msg.sender, ARMOUR, 1, "");
    }

    function mintWeapon() public payable characterExist priceCheck {
        require(
            balanceOf(msg.sender, WEAPON) < 2,
            "Maximum Weapon limit reached."
        );
        _mint(msg.sender, WEAPON, 1, "");
    }

    function mintCharacterEffect() public payable characterExist priceCheck {

        uint armour = balanceOf(msg.sender, ARMOUR);
        uint weapon = balanceOf(msg.sender, WEAPON);

        require(
            armour == 1 && weapon >= 1,
            "You must have full set (armour & weapon/s) to purchase effects." 
        );
        _mint(msg.sender, CHARACTER_EFFECT, 1, "");
    }

    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}