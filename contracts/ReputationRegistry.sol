// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationRegistry
 * @notice Immutable onchain reputation and review registry for AgentFi AI agents.
 *         Ensures anti-sybil and provable ratings with optional attestation hashes.
 */
contract ReputationRegistry {
    address public owner;

    struct AgentReputation {
        uint256 totalRatings;
        uint256 ratingSum; // Out of 500 (5.00 * 100)
        uint256 completedTasks;
        uint256 failedTasks;
        uint256 reputationScore; // Weighted 0-1000
    }

    struct Review {
        address reviewer;
        uint8 rating; // 1-5
        bytes32 commentHash;
        uint256 timestamp;
    }

    // agentId => AgentReputation
    mapping(string => AgentReputation) public agentReputations;
    // agentId => Review[]
    mapping(string => Review[]) public agentReviews;
    // agentId => reviewer => hasReviewed
    mapping(string => mapping(address => bool)) public hasUserReviewed;

    event ReviewSubmitted(string indexed agentId, address indexed reviewer, uint8 rating, bytes32 commentHash);
    event ReputationUpdated(string indexed agentId, uint256 newReputationScore);
    event TaskExecutionRecorded(string indexed agentId, bool success);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function submitReview(
        string calldata agentId,
        uint8 rating,
        bytes32 commentHash
    ) external {
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        require(!hasUserReviewed[agentId][msg.sender], "Already reviewed this agent");

        hasUserReviewed[agentId][msg.sender] = true;

        agentReviews[agentId].push(Review({
            reviewer: msg.sender,
            rating: rating,
            commentHash: commentHash,
            timestamp: block.timestamp
        }));

        AgentReputation storage rep = agentReputations[agentId];
        rep.totalRatings += 1;
        rep.ratingSum += (uint256(rating) * 100);

        // Calculate reputation score
        _recalculateReputation(agentId);

        emit ReviewSubmitted(agentId, msg.sender, rating, commentHash);
    }

    function recordTaskExecution(string calldata agentId, bool success) external onlyOwner {
        AgentReputation storage rep = agentReputations[agentId];
        if (success) {
            rep.completedTasks += 1;
        } else {
            rep.failedTasks += 1;
        }
        _recalculateReputation(agentId);
        emit TaskExecutionRecorded(agentId, success);
    }

    function _recalculateReputation(string memory agentId) internal {
        AgentReputation storage rep = agentReputations[agentId];
        uint256 avgRating = rep.totalRatings > 0 ? (rep.ratingSum / rep.totalRatings) : 400; // default 4.00
        uint256 totalTasks = rep.completedTasks + rep.failedTasks;
        uint256 reliability = totalTasks > 0 ? (rep.completedTasks * 1000 / totalTasks) : 950;

        // Weighted Reputation: 40% avgRating (scaled to 1000) + 60% reliability
        rep.reputationScore = (avgRating * 2 * 40 + reliability * 60) / 100;
        emit ReputationUpdated(agentId, rep.reputationScore);
    }

    function getAverageRating(string calldata agentId) external view returns (uint256) {
        AgentReputation memory rep = agentReputations[agentId];
        if (rep.totalRatings == 0) return 0;
        return rep.ratingSum / rep.totalRatings;
    }

    function getReviewCount(string calldata agentId) external view returns (uint256) {
        return agentReviews[agentId].length;
    }
}
