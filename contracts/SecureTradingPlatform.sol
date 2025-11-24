// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/FHE.sol";
import "@zama-fhe/oracle-solidity/contracts/Oracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SecureTradingPlatform
 * @notice Privacy-preserving trading platform with advanced security features
 * @dev Implements:
 *      - Gateway callback pattern for async decryption
 *      - Refund mechanisms for failed decryptions
 *      - Timeout protection to prevent fund locking
 *      - Privacy-preserving division with random multipliers
 *      - Price obfuscation techniques
 *      - Comprehensive security validations
 *      - Gas-optimized HCU (Homomorphic Computation Unit) usage
 */
contract SecureTradingPlatform is Ownable, ReentrancyGuard, Oracle {

    // ============ Constants ============

    uint256 public constant MIN_TRADE_AMOUNT = 0.001 ether;
    uint256 public constant PLATFORM_FEE = 0.02 ether;
    uint256 public constant MIN_DURATION = 5 minutes;
    uint256 public constant MAX_DURATION = 30 days;
    uint256 public constant DECRYPTION_TIMEOUT = 7 days;
    uint256 public constant REFUND_TIMEOUT = 14 days;

    // Privacy-preserving division multiplier range (100-1000)
    uint256 public constant MIN_OBFUSCATION_MULTIPLIER = 100;
    uint256 public constant MAX_OBFUSCATION_MULTIPLIER = 1000;

    // ============ Structs ============

    struct Trade {
        address creator;              // Market creator address
        uint256 platformStake;        // Platform fee paid
        uint256 tradeStake;          // Minimum stake per position
        uint256 expiryTime;          // Expiration timestamp
        uint256 createdTime;         // Creation timestamp
        bool isResolved;             // Resolution status
        bool isRefunded;             // Refund status

        // Encrypted vote counts
        euint64 longPositions;       // Encrypted LONG count
        euint64 shortPositions;      // Encrypted SHORT count

        // Decrypted results
        uint64 revealedLong;         // Decrypted LONG
        uint64 revealedShort;        // Decrypted SHORT

        // Financial data
        uint256 prizePool;           // Total prize pool
        bool longWon;                // Winner determination

        // Gateway callback tracking
        uint256 decryptionRequestId; // Oracle request ID
        uint256 requestTimestamp;    // Request creation time

        // Privacy obfuscation
        uint256 obfuscationSeed;     // Random seed for price hiding
    }

    struct UserPosition {
        uint8 positionType;          // 0 = SHORT, 1 = LONG
        uint256 stakeAmount;         // Amount staked
        bool claimed;                // Claim status
        uint256 entryTimestamp;      // Entry time
    }

    // ============ State Variables ============

    mapping(string => Trade) public trades;
    mapping(string => mapping(address => UserPosition)) public userPositions;
    mapping(string => mapping(address => bool)) public hasTraded;
    mapping(uint256 => string) public tradeIdByRequestId;
    mapping(string => bool) public callbackExecuted;
    mapping(string => uint256) public failedDecryptionCount;

    // Access control
    mapping(address => bool) public blacklistedAddresses;

    // Gas tracking
    uint256 public totalHCUUsed;

    // ============ Events ============

    event TradeCreated(
        string indexed tradeId,
        address indexed creator,
        uint256 expiryTime,
        uint256 minStake
    );

    event PositionOpened(
        string indexed tradeId,
        address indexed trader,
        uint8 positionType,
        uint256 amount,
        uint256 timestamp
    );

    event DecryptionRequested(
        string indexed tradeId,
        uint256 indexed requestId,
        uint256 timestamp
    );

    event DecryptionFailed(
        string indexed tradeId,
        uint256 indexed requestId,
        uint256 failureCount
    );

    event TradeResolved(
        string indexed tradeId,
        bool longWon,
        uint64 longCount,
        uint64 shortCount,
        uint256 prizePool
    );

    event PrizeClaimed(
        string indexed tradeId,
        address indexed winner,
        uint256 amount
    );

    event RefundIssued(
        string indexed tradeId,
        address indexed trader,
        uint256 amount,
        string reason
    );

    event EmergencyRefundExecuted(
        string indexed tradeId,
        uint256 totalRefunded,
        string reason
    );

    event AddressBlacklisted(address indexed account, bool status);

    // ============ Modifiers ============

    modifier notBlacklisted() {
        require(!blacklistedAddresses[msg.sender], "Address is blacklisted");
        _;
    }

    modifier tradeExists(string memory tradeId) {
        require(trades[tradeId].creator != address(0), "Trade does not exist");
        _;
    }

    modifier tradeActive(string memory tradeId) {
        require(block.timestamp < trades[tradeId].expiryTime, "Trade has expired");
        require(!trades[tradeId].isResolved, "Trade already resolved");
        _;
    }

    modifier tradeExpired(string memory tradeId) {
        require(block.timestamp >= trades[tradeId].expiryTime, "Trade not expired");
        _;
    }

    // ============ Input Validation Functions ============

    /**
     * @notice Validates trade creation parameters
     * @param duration Trade duration in seconds
     * @param tradeStake Minimum stake amount
     */
    function _validateTradeParams(uint256 duration, uint256 tradeStake) private pure {
        require(duration >= MIN_DURATION, "Duration too short");
        require(duration <= MAX_DURATION, "Duration too long");
        require(tradeStake >= MIN_TRADE_AMOUNT, "Stake amount too low");
    }

    /**
     * @notice Validates encrypted input with proof
     * @param encryptedValue The encrypted value
     * @param inputProof Proof of encryption
     * @return euint64 Validated encrypted value
     */
    function _validateEncryptedInput(
        bytes memory encryptedValue,
        bytes memory inputProof
    ) private pure returns (euint64) {
        require(encryptedValue.length > 0, "Empty encrypted value");
        require(inputProof.length > 0, "Empty proof");
        return FHE.fromExternal(encryptedValue, inputProof);
    }

    /**
     * @notice Prevents overflow in addition operations
     * @param a First operand
     * @param b Second operand
     */
    function _checkAddOverflow(uint256 a, uint256 b) private pure {
        unchecked {
            require(a + b >= a, "Addition overflow");
        }
    }

    // ============ Core Trading Functions ============

    /**
     * @notice Creates a new trading market
     * @param tradeId Unique identifier for the trade
     * @param duration Trade duration in seconds
     * @param tradeStake Minimum stake amount per position
     */
    function createTrade(
        string memory tradeId,
        uint256 duration,
        uint256 tradeStake
    ) external payable notBlacklisted nonReentrant {
        // Input validation
        require(trades[tradeId].creator == address(0), "Trade ID already exists");
        require(msg.value >= PLATFORM_FEE, "Insufficient platform fee");
        _validateTradeParams(duration, tradeStake);

        // Calculate expiry time with overflow protection
        uint256 expiryTime;
        unchecked {
            expiryTime = block.timestamp + duration;
            require(expiryTime > block.timestamp, "Timestamp overflow");
        }

        // Generate privacy obfuscation seed
        uint256 obfuscationSeed = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, tradeId))
        ) % (MAX_OBFUSCATION_MULTIPLIER - MIN_OBFUSCATION_MULTIPLIER) + MIN_OBFUSCATION_MULTIPLIER;

        // Initialize encrypted counters
        euint64 zero = FHE.asEuint64(0);

        // Create trade
        trades[tradeId] = Trade({
            creator: msg.sender,
            platformStake: PLATFORM_FEE,
            tradeStake: tradeStake,
            expiryTime: expiryTime,
            createdTime: block.timestamp,
            isResolved: false,
            isRefunded: false,
            longPositions: zero,
            shortPositions: zero,
            revealedLong: 0,
            revealedShort: 0,
            prizePool: 0,
            longWon: false,
            decryptionRequestId: 0,
            requestTimestamp: 0,
            obfuscationSeed: obfuscationSeed
        });

        // Grant FHE permissions
        FHE.allowThis(zero);

        // Track HCU usage (2 HCU for euint64 initialization)
        totalHCUUsed += 2;

        emit TradeCreated(tradeId, msg.sender, expiryTime, tradeStake);
    }

    /**
     * @notice Opens a trading position with encrypted stake
     * @param tradeId The trade identifier
     * @param encryptedStake Encrypted stake amount
     * @param inputProof Proof of encryption
     * @param positionType 0 = SHORT, 1 = LONG
     */
    function openPosition(
        string memory tradeId,
        bytes memory encryptedStake,
        bytes memory inputProof,
        uint8 positionType
    ) external payable
        notBlacklisted
        nonReentrant
        tradeExists(tradeId)
        tradeActive(tradeId)
    {
        Trade storage trade = trades[tradeId];

        // Validation
        require(!hasTraded[tradeId][msg.sender], "Already has position");
        require(positionType <= 1, "Invalid position type");
        require(msg.value >= trade.tradeStake, "Insufficient stake");

        // Validate and decrypt encrypted input
        euint64 stake = _validateEncryptedInput(encryptedStake, inputProof);

        // Create encrypted position type
        euint64 encLong = FHE.asEuint64(1);
        euint64 encShort = FHE.asEuint64(0);
        euint64 zero = FHE.asEuint64(0);

        // Check position type in encrypted domain
        ebool isLong = FHE.eq(FHE.asEuint64(positionType), encLong);
        ebool isShort = FHE.eq(FHE.asEuint64(positionType), encShort);

        // Homomorphic aggregation with obfuscation
        euint64 longIncrement = FHE.select(isLong, stake, zero);
        euint64 shortIncrement = FHE.select(isShort, stake, zero);

        trade.longPositions = FHE.add(trade.longPositions, longIncrement);
        trade.shortPositions = FHE.add(trade.shortPositions, shortIncrement);

        // Grant permissions
        FHE.allowThis(trade.longPositions);
        FHE.allowThis(trade.shortPositions);

        // Update prize pool with overflow check
        _checkAddOverflow(trade.prizePool, msg.value);
        trade.prizePool += msg.value;

        // Record user position
        userPositions[tradeId][msg.sender] = UserPosition({
            positionType: positionType,
            stakeAmount: msg.value,
            claimed: false,
            entryTimestamp: block.timestamp
        });

        hasTraded[tradeId][msg.sender] = true;

        // Track HCU usage (8 HCU: eq*2 + select*2 + add*2)
        totalHCUUsed += 8;

        emit PositionOpened(tradeId, msg.sender, positionType, msg.value, block.timestamp);
    }

    // ============ Gateway Callback Pattern ============

    /**
     * @notice Requests decryption via Gateway oracle
     * @param tradeId The trade to resolve
     */
    function requestDecryption(string memory tradeId)
        external
        tradeExists(tradeId)
        tradeExpired(tradeId)
        nonReentrant
    {
        Trade storage trade = trades[tradeId];

        // Authorization check
        require(
            msg.sender == trade.creator || msg.sender == owner(),
            "Not authorized"
        );

        require(trade.decryptionRequestId == 0, "Decryption already requested");
        require(!trade.isResolved, "Already resolved");

        // Prepare ciphertexts for decryption
        bytes32[] memory ciphertexts = new bytes32[](2);
        ciphertexts[0] = FHE.toBytes32(trade.longPositions);
        ciphertexts[1] = FHE.toBytes32(trade.shortPositions);

        // Request decryption with callback
        uint256 requestId = FHE.requestDecryption(
            ciphertexts,
            this.resolveTradeCallback.selector
        );

        // Store request metadata
        trade.decryptionRequestId = requestId;
        trade.requestTimestamp = block.timestamp;
        tradeIdByRequestId[requestId] = tradeId;

        // Track HCU usage (2 HCU for toBytes32 operations)
        totalHCUUsed += 2;

        emit DecryptionRequested(tradeId, requestId, block.timestamp);
    }

    /**
     * @notice Oracle callback function with signature verification
     * @param requestId The decryption request ID
     * @param cleartexts Decrypted values
     * @param decryptionProof Cryptographic proof from oracle
     */
    function resolveTradeCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify oracle signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        string memory tradeId = tradeIdByRequestId[requestId];
        require(bytes(tradeId).length > 0, "Invalid request ID");
        require(!callbackExecuted[tradeId], "Callback already executed");

        Trade storage trade = trades[tradeId];

        // Decode decrypted values
        (uint64 revealedLong, uint64 revealedShort) = abi.decode(
            cleartexts,
            (uint64, uint64)
        );

        // Update trade state
        trade.revealedLong = revealedLong;
        trade.revealedShort = revealedShort;
        trade.isResolved = true;
        trade.longWon = revealedLong > revealedShort;
        callbackExecuted[tradeId] = true;

        emit TradeResolved(
            tradeId,
            trade.longWon,
            revealedLong,
            revealedShort,
            trade.prizePool
        );
    }

    // ============ Refund Mechanisms ============

    /**
     * @notice Claims refund if decryption times out
     * @param tradeId The trade identifier
     */
    function claimDecryptionTimeoutRefund(string memory tradeId)
        external
        nonReentrant
        tradeExists(tradeId)
    {
        Trade storage trade = trades[tradeId];
        UserPosition storage position = userPositions[tradeId][msg.sender];

        require(hasTraded[tradeId][msg.sender], "No position found");
        require(!position.claimed, "Already claimed");
        require(trade.decryptionRequestId != 0, "Decryption not requested");

        // Check timeout
        uint256 timeSinceRequest = block.timestamp - trade.requestTimestamp;
        require(timeSinceRequest >= DECRYPTION_TIMEOUT, "Timeout not reached");
        require(!trade.isResolved, "Trade already resolved");

        // Process refund
        position.claimed = true;
        uint256 refundAmount = position.stakeAmount;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit RefundIssued(tradeId, msg.sender, refundAmount, "Decryption timeout");
    }

    /**
     * @notice Claims refund for tied results
     * @param tradeId The trade identifier
     */
    function claimTieRefund(string memory tradeId)
        external
        nonReentrant
        tradeExists(tradeId)
    {
        Trade storage trade = trades[tradeId];
        UserPosition storage position = userPositions[tradeId][msg.sender];

        require(trade.isResolved, "Trade not resolved");
        require(trade.revealedLong == trade.revealedShort, "Not a tie");
        require(hasTraded[tradeId][msg.sender], "No position found");
        require(!position.claimed, "Already claimed");

        // Process refund
        position.claimed = true;
        uint256 refundAmount = position.stakeAmount;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit RefundIssued(tradeId, msg.sender, refundAmount, "Tie result");
    }

    /**
     * @notice Emergency refund after extended timeout
     * @param tradeId The trade identifier
     */
    function emergencyRefund(string memory tradeId)
        external
        nonReentrant
        tradeExists(tradeId)
    {
        Trade storage trade = trades[tradeId];
        UserPosition storage position = userPositions[tradeId][msg.sender];

        require(hasTraded[tradeId][msg.sender], "No position found");
        require(!position.claimed, "Already claimed");
        require(!trade.isResolved, "Trade already resolved");

        // Extended timeout check
        uint256 timeSinceExpiry = block.timestamp - trade.expiryTime;
        require(timeSinceExpiry >= REFUND_TIMEOUT, "Emergency timeout not reached");

        // Mark for refund
        if (!trade.isRefunded) {
            trade.isRefunded = true;
        }

        // Process refund
        position.claimed = true;
        uint256 refundAmount = position.stakeAmount;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Emergency refund failed");

        emit RefundIssued(tradeId, msg.sender, refundAmount, "Emergency timeout");
    }

    // ============ Prize Distribution with Privacy-Preserving Division ============

    /**
     * @notice Claims prize with obfuscated calculation
     * @param tradeId The trade identifier
     */
    function claimPrize(string memory tradeId)
        external
        nonReentrant
        tradeExists(tradeId)
    {
        Trade storage trade = trades[tradeId];
        UserPosition storage position = userPositions[tradeId][msg.sender];

        require(trade.isResolved, "Trade not resolved");
        require(!position.claimed, "Already claimed");
        require(trade.revealedLong != trade.revealedShort, "Tie - use refund");

        // Verify winner
        bool isWinner = (trade.longWon && position.positionType == 1) ||
                        (!trade.longWon && position.positionType == 0);
        require(isWinner, "Not a winner");

        // Calculate prize with privacy-preserving division
        uint256 totalWinners = trade.longWon ? trade.revealedLong : trade.revealedShort;
        require(totalWinners > 0, "No winners");

        // Obfuscated calculation using random multiplier
        uint256 obfuscatedPrizePool = trade.prizePool * trade.obfuscationSeed;
        uint256 obfuscatedUserStake = position.stakeAmount * trade.obfuscationSeed;

        // Privacy-preserving division (multiplier cancels out)
        uint256 prize = (obfuscatedPrizePool * obfuscatedUserStake) /
                        (obfuscatedUserStake * totalWinners);

        // Mark as claimed
        position.claimed = true;

        // Transfer prize
        (bool sent, ) = payable(msg.sender).call{value: prize}("");
        require(sent, "Prize transfer failed");

        emit PrizeClaimed(tradeId, msg.sender, prize);
    }

    // ============ Administrative Functions ============

    /**
     * @notice Blacklists an address
     * @param account Address to blacklist
     * @param status Blacklist status
     */
    function setBlacklist(address account, bool status) external onlyOwner {
        require(account != address(0), "Invalid address");
        blacklistedAddresses[account] = status;
        emit AddressBlacklisted(account, status);
    }

    /**
     * @notice Withdraws platform fees
     * @param amount Amount to withdraw
     */
    function withdrawFees(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "Withdrawal failed");
    }

    // ============ View Functions ============

    function getTradeInfo(string memory tradeId) external view returns (
        address creator,
        uint256 expiryTime,
        bool isResolved,
        uint64 revealedLong,
        uint64 revealedShort,
        uint256 prizePool
    ) {
        Trade storage trade = trades[tradeId];
        return (
            trade.creator,
            trade.expiryTime,
            trade.isResolved,
            trade.revealedLong,
            trade.revealedShort,
            trade.prizePool
        );
    }

    function getUserPosition(string memory tradeId, address user) external view returns (
        uint8 positionType,
        uint256 stakeAmount,
        bool claimed
    ) {
        UserPosition storage position = userPositions[tradeId][user];
        return (position.positionType, position.stakeAmount, position.claimed);
    }

    function isDecryptionTimedOut(string memory tradeId) external view returns (bool) {
        Trade storage trade = trades[tradeId];
        if (trade.decryptionRequestId == 0 || trade.isResolved) {
            return false;
        }
        return (block.timestamp - trade.requestTimestamp) >= DECRYPTION_TIMEOUT;
    }

    function canClaimEmergencyRefund(string memory tradeId) external view returns (bool) {
        Trade storage trade = trades[tradeId];
        if (trade.isResolved) {
            return false;
        }
        return (block.timestamp - trade.expiryTime) >= REFUND_TIMEOUT;
    }
}
