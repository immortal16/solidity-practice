// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract TransparentProxyAdmin is ProxyAdmin {
    constructor() ProxyAdmin() {}
}