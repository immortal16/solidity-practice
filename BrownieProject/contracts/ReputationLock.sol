// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./ReputationRouter.sol";
import "./ReputationToken.sol";

contract ReputationLock {
    
    /**
     * @dev address of reputation router
     */
    ReputationRouter public reputationRouter;

    /**
     * @dev return the total reputation token released
     */
    uint256 public totalReputationReleased;

    /**
     * @dev iocHash => LockPosition
     */
    mapping(bytes32 => ReputationLockPosition) public reputationLockPosition;

    struct ReputationLockPosition {
        uint256 minReportsRequired;         // [minReportsRequired] = amount reports
        uint256 minReputationPerIoC;        // [minReputationForIoC] = REPT
        uint256 reputationForIoC;           // [reputationForIoC] = REPT
        uint256 reportsReceived;            // [reportsReceived] = amount reports
        uint256 reputationReleasedForIoC;   // [reputationReleasedForIoC] = REPT
        address[] endpoints;                // array of endpoints that reported the IoC
        mapping(address => uint256) endpointId; // id of endpoint in array `endpoints`
        mapping(address => uint256) reputationReleased; // reputation released by endpoint
    }

    modifier onlyShareholder() {
        require(msg.sender == reputationRouter.shareholder(), "ReputationLock: msg.sender is not shareholder");
        _;
    }

    modifier onlyReputationRouter() {
        require(msg.sender == address(reputationRouter), "ReputationLock: msg.sender is not reputation router");
        _;
    }

    event AddIoC(address indexed endpointCreator, bytes32 indexed iocHash, uint256 minReportsRequired, uint256 minReputationForIoC, uint256 reputationForIoC);
    
    event ReportIoC(address indexed endpointReporter, bytes32 indexed iocHash, uint256 reportsReceived);

    /***** SHAREHOLDER FUNCTIONS *****/

    function initialize(address reputationRouter_) public {
        require(address(reputationRouter) == address(0), "ReputationLock: initialized");
        reputationRouter = ReputationRouter(reputationRouter_);
        require(msg.sender == reputationRouter.shareholder() || msg.sender == reputationRouter_, "ReputationLock: invalid reputation router address");
        totalReputationReleased = 0;
    }

    /***** REPUTATION ROUTER FUNCTIONS *****/

    function addIoC(bytes32 iocHash, address endpointCreator) public onlyReputationRouter {
        ReputationLockPosition storage position = reputationLockPosition[iocHash];
        position.minReportsRequired = reputationRouter.minReportsRequired();
        position.minReputationPerIoC = reputationRouter.minReputationPerIoC();
        position.reputationForIoC = reputationRouter.reputationPerIoC();
        position.endpointId[endpointCreator] = position.reportsReceived;
        position.endpoints.push(endpointCreator);
        position.reportsReceived++;
        emit AddIoC(endpointCreator, iocHash, position.minReportsRequired, position.minReputationPerIoC, position.reputationForIoC);
    }

    function reportIoC(bytes32 iocHash, address endpointReporter) public onlyReputationRouter {
        ReputationLockPosition storage position = reputationLockPosition[iocHash];
        position.endpointId[endpointReporter] = position.reportsReceived;
        position.endpoints.push(endpointReporter);
        position.reportsReceived++;
        emit ReportIoC(endpointReporter, iocHash, position.reportsReceived);
    }

    function release(bytes32 iocHash, address endpoint) public onlyReputationRouter {
        ReputationLockPosition storage position = reputationLockPosition[iocHash];
        require(position.reportsReceived >= position.minReportsRequired, "ReputationLock: not reached minimal reports required");
        require(position.reputationReleased[endpoint] == 0,  "ReputationLock: reward is released by this endpoint");
        uint256 endpointId = position.endpointId[endpoint];
        ReputationToken reputation = ReputationToken(reputationRouter.reputationToken());
        uint256 reputationAmount;
        if (endpointId < reputationRouter.getDistributionLength()) {
            (uint256 distribution, uint256 distributionSum) = reputationRouter.getDistribution(endpointId);
            reputationAmount = distribution * position.reputationForIoC / distributionSum;
        } else {
            reputationAmount = position.minReputationPerIoC;
        }
        reputation.transfer(endpoint, reputationAmount);
        position.reputationReleased[endpoint] += reputationAmount;
        position.reputationReleasedForIoC += reputationAmount;
        totalReputationReleased += reputationAmount;
    }

    /***** VIEW FUNCTIONS *****/

    // function getLockPosition(bytes32 iocHash) public view returns () {
    //     return reputationLockPosition[iocHash];
    // }

    function getLockPositionAmountReports(bytes32 iocHash) public view returns (uint256 minReportsRequired, uint256 reportsReceived) {
        ReputationLockPosition storage position = reputationLockPosition[iocHash];
        return (position.minReportsRequired, position.reportsReceived);
    }

    function getLockPositionEndpointsLength(bytes32 iocHash) public view returns (uint256) {
        return reputationLockPosition[iocHash].endpoints.length;
    }

    function getLockPositionEndpoint(bytes32 iocHash, uint256 endpointId) public view returns (address) {
        require(endpointId < getLockPositionEndpointsLength(iocHash), "ReputationLock: endpointId >= endpoints length");
        return reputationLockPosition[iocHash].endpoints[endpointId];
    }

    function getLockPositionEndpointId(bytes32 iocHash, address endpoint) public view returns (uint256) {
        ReputationLockPosition storage position = reputationLockPosition[iocHash];
        uint256 endpointId = reputationLockPosition[iocHash].endpointId[endpoint];
        require(position.endpoints[endpointId] == endpoint, "ReputationLock: not existing endpoint for iocHash");
        return endpointId;
    }

    function getLockPositionReleased(bytes32 iocHash, address endpoint) public view returns (uint256) {

    }
    
}
