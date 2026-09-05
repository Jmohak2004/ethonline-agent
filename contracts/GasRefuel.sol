// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GasRefuel
 * @notice Protocol gas station that auto-refuels embedded user wallets when their
 *         native balance drops below minimum threshold, ensuring invisible gas UX.
 *         Includes per-user daily limits, cooldown periods, and authorized relayer roles.
 */
contract GasRefuel {
    address public owner;
    address public relayer;

    // Refuel configuration
    uint256 public refuelAmount = 0.005 ether;       // Amount disbursed per refuel
    uint256 public minBalanceThreshold = 0.001 ether; // Only refuel if user balance < threshold
    uint256 public cooldownPeriod = 12 hours;        // Minimum time between refuels for a user
    uint256 public dailyLimitPerUser = 0.015 ether;   // Max total refuel per user in 24h

    // Tracking user refuels
    struct UserRefuelRecord {
        uint256 lastRefuelTimestamp;
        uint256 dailyRefuelAmount;
        uint256 windowStartTimestamp;
    }

    mapping(address => UserRefuelRecord) public userRecords;

    event UserRefueled(address indexed user, uint256 amount, uint256 timestamp);
    event TreasuryFunded(address indexed funder, uint256 amount);
    event ConfigUpdated(uint256 refuelAmount, uint256 threshold, uint256 cooldown);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer || msg.sender == owner, "Unauthorized relayer");
        _;
    }

    constructor(address _relayer) payable {
        owner = msg.sender;
        relayer = _relayer;
    }

    receive() external payable {
        emit TreasuryFunded(msg.sender, msg.value);
    }

    /**
     * @notice Auto-refuel a user wallet if balance is below threshold and cooldown passed.
     *         Called by AgentFi relayer / orchestrator before initiating transactions.
     */
    function refuelUser(address payable user) external onlyRelayer {
        require(address(this).balance >= refuelAmount, "Insufficient treasury balance");
        require(user.balance < minBalanceThreshold, "User balance above threshold");

        UserRefuelRecord storage record = userRecords[user];

        // Check 24-hour window reset
        if (block.timestamp > record.windowStartTimestamp + 24 hours) {
            record.windowStartTimestamp = block.timestamp;
            record.dailyRefuelAmount = 0;
        }

        // Check cooldown
        require(
            block.timestamp >= record.lastRefuelTimestamp + cooldownPeriod,
            "Cooldown period active"
        );

        // Check daily max limit
        require(
            record.dailyRefuelAmount + refuelAmount <= dailyLimitPerUser,
            "Daily refuel limit exceeded"
        );

        record.lastRefuelTimestamp = block.timestamp;
        record.dailyRefuelAmount += refuelAmount;

        (bool success, ) = user.call{value: refuelAmount}("");
        require(success, "Refuel transfer failed");

        emit UserRefueled(user, refuelAmount, block.timestamp);
    }

    /**
     * @notice Check if a user is eligible for an instant gas refuel.
     */
    function isEligibleForRefuel(address user) external view returns (bool, string memory) {
        if (address(this).balance < refuelAmount) {
            return (false, "Treasury empty");
        }
        if (user.balance >= minBalanceThreshold) {
            return (false, "Balance sufficient");
        }

        UserRefuelRecord memory record = userRecords[user];
        if (block.timestamp < record.lastRefuelTimestamp + cooldownPeriod) {
            return (false, "Cooldown active");
        }
        if (
            block.timestamp <= record.windowStartTimestamp + 24 hours &&
            record.dailyRefuelAmount + refuelAmount > dailyLimitPerUser
        ) {
            return (false, "Daily limit reached");
        }

        return (true, "Eligible");
    }

    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
    }

    function updateConfig(
        uint256 _refuelAmount,
        uint256 _minBalanceThreshold,
        uint256 _cooldownPeriod,
        uint256 _dailyLimitPerUser
    ) external onlyOwner {
        refuelAmount = _refuelAmount;
        minBalanceThreshold = _minBalanceThreshold;
        cooldownPeriod = _cooldownPeriod;
        dailyLimitPerUser = _dailyLimitPerUser;
        emit ConfigUpdated(_refuelAmount, _minBalanceThreshold, _cooldownPeriod);
    }

    function withdrawTreasury(address payable recipient, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Amount exceeds balance");
        recipient.transfer(amount);
    }
}
