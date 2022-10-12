// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IReputationRouter {


    function addIoC(bytes32 iocHash, bytes memory shareholderSignature) external;

    function reportIoC(bytes32 iocHash, bytes32 reportHash, bytes memory shareholderSignature) external;

    function release(bytes32 iocHash) external;

    function mintIoC(bytes32 iocHash, string memory iocData, bytes memory shareholderSignature) external;

}