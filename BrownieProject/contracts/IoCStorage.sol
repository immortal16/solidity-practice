// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ReputationRouter.sol";

/**
 * @author Vakhtanh Chikhladze
 * @dev Storage, that store Indicator of Comprometations (IoCs) on Solidity compatible blockchains
 */
contract IoCStorage {

    /**
     * @dev address of reputation router
     */
    ReputationRouter public reputationRouter;

    /**
     * @dev array of ioc hashes
     */
    bytes32[] public iocHashes;

    /**
     * @dev iocHash => ioc info
     */
    mapping(bytes32 => IoCInfo) public iocInfo;

    /**
     * @dev iocHash => endpointAddress => reportHash
     */
    mapping(bytes32 => mapping (address => bytes32)) public reports;

    struct IoCInfo {
        string iocData;
        address iocCreator;
        address[] reporters;
    }

    modifier onlyReputationRouter() {
        require(msg.sender == address(reputationRouter), "IoCStorage: msg.sender is not reputationRouter");
        _;
    }
    
    event AddIoC(address indexed endpoint, bytes32 indexed iocHash);
    
    event ReportIoC(address indexed endpoint, bytes32 indexed iocHash, bytes32 indexed reportHash);

    event MintIoC(address indexed endpoint, bytes32 indexed iocHash, string ioc);

    function initialize(address reputationRouter_) public {
        require(address(reputationRouter) == address(0), "IoCStorage: initialized");
        reputationRouter = ReputationRouter(reputationRouter_);
        require(msg.sender == reputationRouter.shareholder() || msg.sender == reputationRouter_, "ReputationLock: invalid reputation router address");
    }
 
    function addIoC(bytes32 iocHash, address endpoint) public onlyReputationRouter {
        IoCInfo storage _iocInfo = iocInfo[iocHash];
        require(_iocInfo.iocCreator == address(0), "IoCStorage: ioc exist");
        _iocInfo.iocCreator = endpoint;
        iocHashes.push(iocHash);
        emit AddIoC(endpoint, iocHash);
    }

    function reportIoC(bytes32 iocHash, address endpoint, bytes32 reportHash) public onlyReputationRouter {
        require(reports[iocHash][endpoint] == bytes32(0), "IoCStorage: ioc already reported");
        IoCInfo storage _iocInfo = iocInfo[iocHash];
        require(_iocInfo.iocCreator != endpoint, "IoCStorage: ioc cant be reported by ioc creator");
        reports[iocHash][endpoint] = reportHash;
        _iocInfo.reporters.push(endpoint);
        emit ReportIoC(endpoint, iocHash, reportHash);
    }

    function mintIoC(bytes32 iocHash, address endpoint, string memory iocData) public onlyReputationRouter {
        IoCInfo storage _iocInfo = iocInfo[iocHash];
        require(bytes(iocData).length > 0, "IoCStorage: ioc data cannot be empty string");
        require(_iocInfo.iocCreator == endpoint, "IoCStorage: endpoint is not iocCreator");
        require(bytes(_iocInfo.iocData).length == 0, "IoCStorage: ioc already minted");
        _iocInfo.iocData = iocData;
        emit MintIoC(endpoint, iocHash, iocData);
    }

    /***** VIEW FUNCTIONS *****/

    /**
     * @dev returns length of array `iocHashes`
     */
    function getIoCHashesLength() public view returns (uint256) {
        return iocHashes.length;
    }

    /**
     * @dev returns ioc by provided `iocHashId`
     * @param iocHashId - id of ioc. The value from 0 to length of array `iocHashes`
     */
    function getIoCHash(uint256 iocHashId) public view returns (bytes32) {
        return iocHashes[iocHashId];
    }

    /**
     * @dev return ioc info
     */
    function getIoCInfo(bytes32 iocHash) public view returns (string memory iocData, address iocCreator, address[] memory reporters) {
        IoCInfo memory _iocInfo = iocInfo[iocHash];
        return (_iocInfo.iocData, _iocInfo.iocCreator, _iocInfo.reporters);
    }

    function getIoCReporter(bytes32 iocHash, uint256 reporterId) public view returns (address reporter) {
        IoCInfo memory _iocInfo = iocInfo[iocHash];
        uint256 reportsLength = _iocInfo.reporters.length;
        require(reporterId < reportsLength, "IoCStorage: read unexisted reporter");
        return _iocInfo.reporters[reporterId];
    }

}