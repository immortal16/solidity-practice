// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

interface IVerifySignature {
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        external
        pure
        returns (address);
}