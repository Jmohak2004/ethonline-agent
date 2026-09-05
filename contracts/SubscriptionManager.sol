// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SubscriptionManager
 * @notice Manages onchain subscription states, renewals, expirations, and cancellations.
 */
contract SubscriptionManager {
    address public owner;

    struct Subscription {
        address subscriber;
        string agentId;
        uint256 startTime;
        uint256 expiryTime;
        uint256 ratePerMonth;
        bool isActive;
        bool autoRenew;
    }

    // subscriptionId => Subscription
    mapping(bytes32 => Subscription) public subscriptions;
    // subscriber => subscriptionIds
    mapping(address => bytes32[]) public userSubscriptions;

    event SubscriptionCreated(bytes32 indexed subId, address indexed subscriber, string agentId, uint256 expiryTime);
    event SubscriptionRenewed(bytes32 indexed subId, uint256 newExpiryTime);
    event SubscriptionCancelled(bytes32 indexed subId, address indexed subscriber);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createSubscription(
        address subscriber,
        string calldata agentId,
        uint256 durationSeconds,
        uint256 ratePerMonth,
        bool autoRenew
    ) external returns (bytes32) {
        bytes32 subId = keccak256(abi.encodePacked(subscriber, agentId, block.timestamp));
        uint256 expiry = block.timestamp + durationSeconds;

        subscriptions[subId] = Subscription({
            subscriber: subscriber,
            agentId: agentId,
            startTime: block.timestamp,
            expiryTime: expiry,
            ratePerMonth: ratePerMonth,
            isActive: true,
            autoRenew: autoRenew
        });

        userSubscriptions[subscriber].push(subId);
        emit SubscriptionCreated(subId, subscriber, agentId, expiry);
        return subId;
    }

    function renewSubscription(bytes32 subId, uint256 additionalSeconds) external {
        Subscription storage sub = subscriptions[subId];
        require(sub.isActive, "Subscription not active");
        
        if (block.timestamp > sub.expiryTime) {
            sub.expiryTime = block.timestamp + additionalSeconds;
        } else {
            sub.expiryTime += additionalSeconds;
        }

        emit SubscriptionRenewed(subId, sub.expiryTime);
    }

    function cancelSubscription(bytes32 subId) external {
        Subscription storage sub = subscriptions[subId];
        require(sub.subscriber == msg.sender || msg.sender == owner, "Unauthorized");
        sub.isActive = false;
        sub.autoRenew = false;
        emit SubscriptionCancelled(subId, sub.subscriber);
    }

    function isSubscriptionValid(bytes32 subId) external view returns (bool) {
        Subscription memory sub = subscriptions[subId];
        return sub.isActive && block.timestamp <= sub.expiryTime;
    }

    function getUserSubscriptions(address subscriber) external view returns (bytes32[] memory) {
        return userSubscriptions[subscriber];
    }
}
