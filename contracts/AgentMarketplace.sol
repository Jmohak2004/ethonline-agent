// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentMarketplace
 * @notice Onchain registry and payment router for AI agents on AgentFi.
 *         Handles developer payouts, platform fee split, and agent metadata hashes.
 */
contract AgentMarketplace {
    address public owner;
    uint256 public platformFeeBps = 250; // 2.5% fee
    address public feeRecipient;

    enum PricingModel { FREE, ONE_TIME, SUBSCRIPTION, PAY_PER_USE }

    struct AgentListing {
        string agentId;
        string ensName;
        address developer;
        uint256 price; // In token decimals or wei
        PricingModel pricingModel;
        bool isActive;
        bytes32 manifestHash;
        uint256 totalSubscribers;
        uint256 totalRevenue;
    }

    // agentId => AgentListing
    mapping(string => AgentListing) public agents;
    string[] public agentIds;

    event AgentRegistered(string indexed agentId, string ensName, address indexed developer, uint256 price, PricingModel model);
    event AgentUpdated(string indexed agentId, uint256 newPrice, bool isActive);
    event AgentPurchased(string indexed agentId, address indexed buyer, uint256 amountPaid, uint256 platformFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _feeRecipient) {
        owner = msg.sender;
        feeRecipient = _feeRecipient;
    }

    function registerAgent(
        string calldata agentId,
        string calldata ensName,
        uint256 price,
        PricingModel model,
        bytes32 manifestHash
    ) external {
        require(agents[agentId].developer == address(0), "Agent already exists");
        require(bytes(agentId).length > 0, "Invalid agentId");

        agents[agentId] = AgentListing({
            agentId: agentId,
            ensName: ensName,
            developer: msg.sender,
            price: price,
            pricingModel: model,
            isActive: true,
            manifestHash: manifestHash,
            totalSubscribers: 0,
            totalRevenue: 0
        });

        agentIds.push(agentId);
        emit AgentRegistered(agentId, ensName, msg.sender, price, model);
    }

    function updateAgent(string calldata agentId, uint256 newPrice, bool isActive) external {
        AgentListing storage listing = agents[agentId];
        require(listing.developer == msg.sender || msg.sender == owner, "Unauthorized");
        listing.price = newPrice;
        listing.isActive = isActive;
        emit AgentUpdated(agentId, newPrice, isActive);
    }

    function recordPurchase(string calldata agentId, address buyer, uint256 amount) external payable {
        AgentListing storage listing = agents[agentId];
        require(listing.isActive, "Agent not active");
        
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 devPayout = amount - fee;

        listing.totalSubscribers += 1;
        listing.totalRevenue += amount;

        if (msg.value > 0) {
            require(msg.value == amount, "Incorrect ETH value");
            payable(feeRecipient).transfer(fee);
            payable(listing.developer).transfer(devPayout);
        }

        emit AgentPurchased(agentId, buyer, amount, fee);
    }

    function getAgentCount() external view returns (uint256) {
        return agentIds.length;
    }

    function setPlatformFee(uint256 _platformFeeBps) external onlyOwner {
        require(_platformFeeBps <= 1000, "Fee too high"); // max 10%
        platformFeeBps = _platformFeeBps;
    }
}
