// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface Comptroller {
    function markets(address) external returns (bool, uint256);

    function getAssetsIn(address account) external view returns (address[] memory);

    function enterMarkets(address[] calldata)
        external
        returns (uint256[] memory);

    function exitMarket(address cToken)
        external
        returns (uint);

    function getAccountLiquidity(address)
        external
        view
        returns (uint256, uint256, uint256);
}