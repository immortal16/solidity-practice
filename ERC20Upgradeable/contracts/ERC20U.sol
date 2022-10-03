// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "./contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./contracts-upgradeable/proxy/utils/Initializable.sol";
import "./contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./contracts-upgradeable/security/PausableUpgradeable.sol";

contract MyTokenUV1 is 
    Initializable,
    ERC20Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{

    uint32 public constant maxSupply = 100000 * 10 ** 3;
    uint24 public constant initialSupply = 10000 * 10 ** 3;

    function initialize()
        reinitializer(1)
        public
    {
        __ERC20_init("MyTokenU", "MTKU");
        __Ownable_init();
        __UUPSUpgradeable_init();

        _mint(msg.sender, initialSupply);
    }

    function decimals() 
        public
        pure
        override
        returns (uint8)
    {
        return 3;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    function version()
        external
        pure
        virtual
        returns (string memory)
    {
        return "v1";
    }
}

contract MyTokenUV2 is
    MyTokenUV1,
    AccessControlUpgradeable
{

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BKLIST_ROLE = keccak256("BKLIST_ROLE");

    event tokensMinted(address indexed minter, uint24 amount, string comment);
    event tokensBurned(address indexed from, uint24 amount, string comment);
    event blackListIneraction(address indexed admin, address blacklisted, string comment);

    mapping (address => bool) blackList;

    function initializeV2() 
        reinitializer(2)
        public
        onlyOwner
    {
        __AccessControl_init_unchained();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address to, uint24 amount)
        external
        onlyRole(MINTER_ROLE)
    {
        require(
            totalSupply() + amount * 10 ** decimals() <= maxSupply,
            "Impossible, excessing maximum supply."
        );
        _mint(to, amount * 10 ** decimals());
        emit tokensMinted(msg.sender, amount, "Additional supply minted.");
    }

    function burn(uint24 amount)
        external 
    {
        _burn(msg.sender, amount * 10 ** decimals());
        emit tokensBurned(msg.sender, amount, "Tokens burned.");
    }

    function toBlackList(address candidate, bool state)
        external
        onlyRole(BKLIST_ROLE)
    {
        blackList[candidate] = state;
        if (state) {
            emit blackListIneraction(msg.sender, candidate, "Added to blacklist.");
        } else {
            emit blackListIneraction(msg.sender, candidate, "Removed from blackist.");
        }
    }

    function isBlackListed(address candidate)
        external
        view
        returns (bool)
    {
        return blackList[candidate];
    }

    function version()
        external
        pure
        virtual
        override
        returns (string memory)
    {
        return "v2";
    }
}

contract MyTokenUV3 is
    MyTokenUV2,
    PausableUpgradeable
{

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    event pauseInteraction(address indexed pauser, string comment);

    function initializeV3()
        reinitializer(3)
        public
        onlyOwner
    {
        __Pausable_init_unchained();
    }

    function pause()
        external
        onlyRole(PAUSER_ROLE)
    {
        _pause();
        emit pauseInteraction(msg.sender, "Paused.");
    }

    function unpause()
        external
        onlyRole(PAUSER_ROLE)
    {
        _unpause();
        emit pauseInteraction(msg.sender, "Unpaused.");
    }

    function pausedStr()
        external
        view
        whenPaused
        returns(string memory)
    {
        return "Paused.";
    }

    function unpausedStr()
        external
        view
        whenNotPaused
        returns(string memory)
    {
        return "Unpaused.";
    }

    function version()
        external
        pure
        virtual
        override
        returns (string memory)
    {
        return "v3";
    }
}