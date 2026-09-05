// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentPayment
 * @notice Handles micro-payments and multi-currency (USDC, testnet ETH) splits
 *         for agent-to-agent and user-to-agent interactions.
 */
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract AgentPayment {
    address public owner;
    uint256 public platformFeeBps = 200; // 2%
    address public feeTreasury;

    event AgentPaymentExecuted(
        address indexed payer,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 fee,
        string serviceRef
    );

    constructor(address _feeTreasury) {
        owner = msg.sender;
        feeTreasury = _feeTreasury;
    }

    function payAgentERC20(
        address token,
        address developer,
        uint256 amount,
        string calldata serviceRef
    ) external {
        require(amount > 0, "Amount must be > 0");
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 devAmount = amount - fee;

        if (fee > 0) {
            require(IERC20(token).transferFrom(msg.sender, feeTreasury, fee), "Fee transfer failed");
        }
        require(IERC20(token).transferFrom(msg.sender, developer, devAmount), "Dev transfer failed");

        emit AgentPaymentExecuted(msg.sender, developer, token, amount, fee, serviceRef);
    }

    function payAgentNative(
        address payable developer,
        string calldata serviceRef
    ) external payable {
        require(msg.value > 0, "Value must be > 0");
        uint256 fee = (msg.value * platformFeeBps) / 10000;
        uint256 devAmount = msg.value - fee;

        if (fee > 0) {
            payable(feeTreasury).transfer(fee);
        }
        developer.transfer(devAmount);

        emit AgentPaymentExecuted(msg.sender, developer, address(0), msg.value, fee, serviceRef);
    }
}
