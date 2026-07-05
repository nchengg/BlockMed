// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Blockmediary Escrow
/// @notice Narrow documentary-escrow contract (TRD §4, AP-1): holds a stablecoin per deal
///         and enforces state transitions. It has no knowledge of trade documents, release
///         rules, or fiat values — document verification happens off-chain and an authorised
///         releaser records the verdict on-chain (AP-2).
/// @dev    The escrowed token MUST be a standard non-fee-on-transfer, non-rebasing ERC-20
///         (TR-3.2): payouts use the recorded deal amount, not balance deltas.
contract Escrow is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant RELEASER_ROLE = keccak256("RELEASER_ROLE");

    /// @dev Draft is the implicit zero-value state: an uncreated dealId is already Draft,
    ///      so `state[dealId] == Draft` doubles as the DealExists guard (TR-3.3).
    enum State {
        Draft,
        Agreed,
        Funded,
        ReleasePending,
        Released,
        Refunded
    }

    struct Deal {
        address buyer;
        address seller;
        uint256 amount; // token base units (USDC 6-decimals); no fiat, no fee math (AP-5)
    }

    IERC20 public immutable token;

    mapping(bytes32 => Deal) public deals;
    mapping(bytes32 => State) public state;

    event DealCreated(bytes32 indexed dealId, address buyer, address seller, uint256 amount);
    event Funded(bytes32 indexed dealId, uint256 amount);
    event VerdictRecorded(bytes32 indexed dealId);
    event Released(bytes32 indexed dealId, uint256 amount);
    event Refunded(bytes32 indexed dealId, uint256 amount);
    event StateChanged(bytes32 indexed dealId, State from, State to);

    error InvalidState(bytes32 dealId, State expected, State actual);
    error ZeroAmount();
    error DealExists(bytes32 dealId);
    error NotBuyer();
    error SameParty();
    error NotAuthorised();

    constructor(address token_, address admin, address releaser) {
        token = IERC20(token_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(RELEASER_ROLE, releaser);
    }

    /// @notice Register a deal. Caller-supplied dealId; uniqueness enforced by the Draft check.
    function createDeal(bytes32 dealId, address buyer, address seller, uint256 amount)
        external
        onlyRole(RELEASER_ROLE)
    {
        if (state[dealId] != State.Draft) revert DealExists(dealId);
        if (amount == 0) revert ZeroAmount();
        if (buyer == seller) revert SameParty();

        deals[dealId] = Deal({buyer: buyer, seller: seller, amount: amount});
        _transition(dealId, State.Draft, State.Agreed);
        emit DealCreated(dealId, buyer, seller, amount);
    }

    /// @notice Buyer locks the agreed amount into escrow.
    function deposit(bytes32 dealId) external whenNotPaused nonReentrant {
        _requireState(dealId, State.Agreed);
        Deal memory deal = deals[dealId];
        if (msg.sender != deal.buyer) revert NotBuyer();

        _transition(dealId, State.Agreed, State.Funded);
        emit Funded(dealId, deal.amount);
        token.safeTransferFrom(deal.buyer, address(this), deal.amount);
    }

    /// @notice Record the off-chain Compliant verdict, authorising settlement.
    /// @dev    Point of no return (AP-7): every off-chain gate (document rules, objection
    ///         window, disputes) must have passed before this is called, because from
    ///         ReleasePending anyone may trigger release.
    function recordVerdict(bytes32 dealId) external onlyRole(RELEASER_ROLE) {
        _requireState(dealId, State.Funded);
        _transition(dealId, State.Funded, State.ReleasePending);
        emit VerdictRecorded(dealId);
    }

    /// @notice Pay the recorded seller. Deliberately permissionless (TR-3.2-roles): a
    ///         compliant seller cannot be censored by withholding the releaser key.
    function release(bytes32 dealId) external whenNotPaused nonReentrant {
        _requireState(dealId, State.ReleasePending);
        Deal memory deal = deals[dealId];

        _transition(dealId, State.ReleasePending, State.Released);
        emit Released(dealId, deal.amount);
        token.safeTransfer(deal.seller, deal.amount);
    }

    /// @notice Return escrowed funds to the recorded buyer (escape hatch from Funded).
    function refund(bytes32 dealId) external whenNotPaused nonReentrant {
        if (!hasRole(RELEASER_ROLE, msg.sender) && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert NotAuthorised();
        }
        _requireState(dealId, State.Funded);
        Deal memory deal = deals[dealId];

        _transition(dealId, State.Funded, State.Refunded);
        emit Refunded(dealId, deal.amount);
        token.safeTransfer(deal.buyer, deal.amount);
    }

    /// @notice Emergency stop (TR-3.4): halts deposit, release, and refund — including an
    ///         in-flight permissionless release. Emergency control, not a routine gate.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _requireState(bytes32 dealId, State expected) private view {
        State actual = state[dealId];
        if (actual != expected) revert InvalidState(dealId, expected, actual);
    }

    function _transition(bytes32 dealId, State from, State to) private {
        state[dealId] = to;
        emit StateChanged(dealId, from, to);
    }
}
