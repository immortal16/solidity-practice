// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/IReputationRouter.sol";
import "./ReputationToken.sol";
import "./ReputationLock.sol";
import "./IoCStorage.sol";
import "./IoC.sol";

contract ReputationRouter is IReputationRouter {

    /**
     * @dev address of shareholder
     */
    address public shareholder;
    
    /**
     * @dev address of reputation token
     */
    ReputationToken public reputationToken;

    /**
     * @dev address of reputation lock smart contract
     */
    ReputationLock public reputationLock;

    /**
     * @dev address of ioc storage
     */
    IoCStorage public iocStorage;

    /**
     * @dev address of ioc storage
     */
    IoC public ioc;

    /**
     * @dev amount of Reputation token per IoC 
     */
    uint256 public reputationPerIoC;

     /**
     * @dev minimal amount of Reputation token per reporting IoC 
     */
    uint256 public minReputationPerIoC;

    /**
     * @dev distribution of reward 
        Example: distribution = [50, 25, 13, 12]. The sum in this array equal 50+25+13+12 = 100
        This may be defined by first will earn 50/100 of reward, second will earn 25/100 of reward,
        third will earn 13/100 of reward, fourth will earn 12/100 of reward. 
     */
    uint256[] public distribution;

    /**
     * @dev sum of elements in array `distribution`
     */
    uint256 public distributionSum;

    uint256 public minReportsRequired;

    modifier onlyShareholder {
        require(msg.sender == shareholder, "ReputationRouter: msg.sender is not shareholder");
        _;
    }   

    /***** SHAREHOLDER FUNCTIONS *****/

    function initialize(
        address reputationToken_, 
        address reputationLock_,
        address iocStorage_,
        address ioc_,
        uint256 totalSupplyCap_
    ) public {
        require(
            address(reputationToken) == address(0) && 
            address(reputationLock) == address(0) && 
            address(iocStorage) == address(0) && 
            address(ioc) == address(0), 
            "ReputationRouter: initialized"
        );

        shareholder = msg.sender;

        reputationToken = ReputationToken(reputationToken_);
        reputationLock = ReputationLock(reputationLock_);
        iocStorage = IoCStorage(iocStorage_);
        ioc = IoC(ioc_);

        reputationToken.initialize(address(this), totalSupplyCap_);
        reputationLock.initialize(address(this));
        iocStorage.initialize(address(this));
        ioc.initialize(address(this));

        reputationToken.mint(address(reputationLock), totalSupplyCap_);
        uint256 reputationPerIoC_ = 1e18; 
        uint256 minReputationPerIoC_ = 1e15;
        uint256[] memory distribution_ = new uint256[](4);
        distribution_[0] = 50;
        distribution_[1] = 25;
        distribution_[2] = 13;
        distribution_[3] = 12;
        uint256 minReportsRequired_ = 4;
        setParams(reputationPerIoC_, minReputationPerIoC_, distribution_, minReportsRequired_);
    }

    function setParams(
        uint256 reputationPerIoC_,
        uint256 minReputationPerIoC_,
        uint256[] memory distribution_,
        uint256 minReportsRequired_
    ) public {
        setReputationPerIoC(reputationPerIoC_);
        setMinReputationPerIoC(minReputationPerIoC_);
        setDistribution(distribution_);
        setMinReportsRequired(minReportsRequired_);
    }

    function setReputationPerIoC(uint256 reputationPerIoC_) public onlyShareholder {
        reputationPerIoC = reputationPerIoC_;
    }

    function setMinReputationPerIoC(uint256 minReputationPerIoC_) public onlyShareholder {
        minReputationPerIoC = minReputationPerIoC_;
    }

    function setDistribution(uint256[] memory distribution_) public onlyShareholder {
        uint256 distribution_Length = distribution_.length;
        uint256 _distributionSum = 0;
        for(uint256 i = 0; i < distribution_Length;){
            _distributionSum += distribution_[i];
            unchecked { ++i; }
        }
        distribution = distribution_;
        distributionSum = _distributionSum;
    }

    function setMinReportsRequired(uint256 minReportsRequired_) public onlyShareholder {
        minReportsRequired = minReportsRequired_;
    }

    function transferShareholder(address newShareholder) public onlyShareholder {
        shareholder = newShareholder;
    }

    /***** ENDPOINT FUNCTIONS *****/

    /**
     * @dev adds Indicator of Comprometation hash to storage.
     * @param iocHash - 32 bytes of Indicator of Comprometation
     * @param shareholderSignature - 65 bytes of signature
     */
    function addIoC(bytes32 iocHash, bytes memory shareholderSignature) public override {
        require(
            verify(
                msg.sender, // endpoint adder address: 20 bytes 
                IReputationRouter.addIoC.selector, // addIoC selector: 0xeee20731
                iocHash,    // iocHash: any 32 bytes
                bytes(""),  // extraData: 0x
                shareholderSignature // signature: 65 bytes
            ),
            "ReputationRouter: addIoC invalid signature"
        );
        iocStorage.addIoC(iocHash, msg.sender);
        reputationLock.addIoC(iocHash, msg.sender);
    }

    function reportIoC(bytes32 iocHash, bytes32 reportHash, bytes memory shareholderSignature) public override {
        require(
            verify(
                msg.sender, // endpoint reporter address
                IReputationRouter.reportIoC.selector, // reportIoC selector: 0xeb6bfde9
                iocHash, // ioc hash: any 32 bytes
                abi.encodePacked(reportHash), // extraData is report hash: any 32 bytes
                shareholderSignature // signature: 65 bytes
            ),
            "ReputationRouter: reportIoC invalid signature"
        );
        iocStorage.reportIoC(iocHash, msg.sender, reportHash);
        reputationLock.reportIoC(iocHash, msg.sender);

    }
    
    function release(bytes32 iocHash) public override {
        reputationLock.release(iocHash, msg.sender);
    }

    function mintIoC(bytes32 iocHash, string memory iocData, bytes memory shareholderSignature) public override {
        require(
            verify(
                msg.sender, // endpoint addrer address
                IReputationRouter.mintIoC.selector,  // mintIoC selector: 0xcecac20b
                iocHash, // ioc hash: any 32 bytes
                bytes(iocData), // extraData is ioc data: any bytes
                shareholderSignature // signature: 65 bytes
            ),
            "ReputationRouter: mintIoC invalid signature"
        );
        (uint256 positionMinReportsRequired, uint256 positionReportsReceived) = reputationLock.getLockPositionAmountReports(iocHash);
        require(positionMinReportsRequired <= positionReportsReceived, "ReputationRouter: not enogh reports");
        iocStorage.mintIoC(iocHash, msg.sender, iocData);
        ioc.mint(iocHash, msg.sender);
    }

    /***** VERIFY SIGNATURE FUNCTIONS *****/

    /**
     * @dev verification of sign
     * @param endpoint address of endpoint (20 bytes)
     * @param selector function selector to be signed to call (4 bytes)
     * @param iocHash hash of ioc in database (32 bytes)
     * @param extraData any additional data (>= 0 bytes)
     * @param signature sign of shareholder (65 bytes)
     */
    function verify(address endpoint, bytes4 selector, bytes32 iocHash, bytes memory extraData, bytes memory signature) public view returns (bool) {
        bytes32 endpointHash = getMessageHash(endpoint, selector, iocHash, extraData);
        bytes32 ethSignedEndpointHash = getEthSignedMessageHash(endpointHash);
        address signer = recoverSigner(ethSignedEndpointHash, signature);
        return signer == shareholder ? true : false;
    }

    function getMessageHash(address endpoint, bytes4 selector, bytes32 iocHash, bytes memory extraData) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(endpoint, selector, iocHash, extraData));
    }

    function getEthSignedMessageHash(bytes32 messageHash) public pure returns (bytes32){
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    }

    function getMessageHashWithEthSign(address endpoint, bytes4 selector, bytes32 iocHash, bytes memory extraData) public pure returns (bytes32) {
        bytes32 messageHash = getMessageHash(endpoint, selector, iocHash, extraData);
        bytes32 ethSignedMessage = getEthSignedMessageHash(messageHash);
        return ethSignedMessage;
    }

    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) public pure returns (address) {
        require(signature.length == 65, "invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(signature, 32))
            // second 32 bytes
            s := mload(add(signature, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(signature, 96)))
        }
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    /**
     * @dev return length of array `distribution`
     */
    function getDistributionLength() public view returns (uint256) {
        return distribution.length;
    }

    function getDistributionArray() public view returns (uint256[] memory) {
        return distribution;
    }
    
    /**
     * @dev return numerator and deniminator of distribution.
     */
    function getDistribution(uint256 order) public view returns (uint256 numerator, uint256 denominator) {
        uint256 distributionLength = getDistributionLength();
        if (order < distributionLength) {
            return (distribution[order], distributionSum);
        } else {
            return (0, distributionSum);
        }
    }

}