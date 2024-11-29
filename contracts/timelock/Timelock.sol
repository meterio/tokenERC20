// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./ITimelock.sol";
import "./RateLimiter.sol";

contract Timelock is
    ITimelock,
    AccessControlEnumerableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.UintSet;
    using RateLimiter for RateLimiter.TokenBucket;

    bytes32 public constant EMERGENCY_ADMIN = keccak256("EMERGENCY_ADMIN");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE"); // role for executing agreements
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE"); // role for creating agreements

    /// @notice user => agreements ids set
    mapping(address => EnumerableSet.UintSet) private _userAgreements;
    /// @notice ids => agreement
    mapping(uint256 => Agreement) public agreements;
    /// @notice asset => balances
    mapping(address => uint256) public balances;

    uint256 public agreementCount;
    bool public frozen;

    uint48 public maxDelay = 60 * 60 * 12; // default to 12 hours
    uint48 public limitWindow = 60 * 60 * 12; // default to be 12 hours

    mapping(address => RateLimiter.TokenBucket) rateLimiters; // asset => TokenBucket

    /////////////////////////////////////////////////
    // Events
    /////////////////////////////////////////////////
    event NewMaxDelay(uint48 oldValue, uint48 newValue);
    event NewAssetLimiter(
        address asset,
        uint256 oldRate,
        uint256 newRate,
        uint256 oldCapacity,
        uint256 newCapacity
    );

    event NewLimitWindow(uint48 oldWindow, uint48 newWindow);

    /////////////////////////////////////////////////
    // Errors
    /////////////////////////////////////////////////
    // errors in modifiers
    error ZeroAddressNotAllowed();
    error ZeroValueNotAllowed();
    error OnlyAdmin();
    error OnlyProposer();
    error OnlyExecutor();
    error OnlyEmergencyAdmin();

    // errors in timelock
    error OverThreshold();
    error NotEnoughBalance(
        address asset,
        uint256 balance,
        uint256 recordedBalance
    );
    error TimelockFrozen();
    error AgreementNotFrozen(uint256 agreementId);
    error NativeTransferFailed();
    error SenderIsNotBeneficiary(
        uint256 agreementId,
        address sender,
        address beneficiary
    );
    error AgreementIsFrozen(uint256 agreementId);
    error TimelockIsFrozen();

    /////////////////////////////////////////////////
    // Modifiers
    /////////////////////////////////////////////////
    modifier ensureNonzeroAddress(address address_) {
        if (address_ == address(0)) {
            revert ZeroAddressNotAllowed();
        }
        _;
    }

    modifier ensureNonzeroValue(uint256 value_) {
        if (value_ == 0) {
            revert ZeroValueNotAllowed();
        }
        _;
    }

    modifier onlyAdmin() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert OnlyAdmin();
        }
        _;
    }

    modifier onlyProposer() {
        if (!hasRole(PROPOSER_ROLE, msg.sender)) {
            revert OnlyProposer();
        }
        _;
    }

    modifier onlyExecutor() {
        if (!hasRole(EXECUTOR_ROLE, msg.sender)) {
            revert OnlyExecutor();
        }
        _;
    }

    modifier onlyEmergencyAdmin() {
        if (!hasRole(EMERGENCY_ADMIN, msg.sender)) {
            revert OnlyEmergencyAdmin();
        }
        _;
    }

    modifier notFrozen() {
        if (frozen) {
            revert TimelockIsFrozen();
        }
        _;
    }

    /////////////////////////////////////////////////
    // Constructor & Initializer
    /////////////////////////////////////////////////
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _admin,
        address _proposer,
        address _executor,
        uint48 _limitWindow
    )
        external
        ensureNonzeroAddress(_admin)
        ensureNonzeroValue(_limitWindow)
        initializer
    {
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(EMERGENCY_ADMIN, _admin);
        if (_proposer != address(0)) {
            _setupRole(PROPOSER_ROLE, _proposer);
        }
        if (_executor != address(0)) {
            _setupRole(EXECUTOR_ROLE, _executor);
        }

        emit NewMaxDelay(0, maxDelay);

        limitWindow = _limitWindow;
        emit NewLimitWindow(0, _limitWindow);
    }

    /////////////////////////////////////////////////
    // Utility
    /////////////////////////////////////////////////

    function _min(uint _a, uint _b) internal pure returns (uint) {
        return (_a < _b) ? _a : _b;
    }

    function _max(uint _a, uint _b) internal pure returns (uint) {
        return (_a >= _b) ? _a : _b;
    }

    /////////////////////////////////////////////////
    // Config functions
    /////////////////////////////////////////////////
    function setProposer(
        address proposer
    ) external ensureNonzeroAddress(proposer) onlyAdmin {
        _setupRole(PROPOSER_ROLE, proposer);
    }

    function setExecutor(
        address executor
    ) external ensureNonzeroAddress(executor) onlyAdmin {
        _setupRole(EXECUTOR_ROLE, executor);
    }

    function setMaxDelay(
        uint48 newMaxDelayInSeconds
    ) external ensureNonzeroValue(maxDelay) onlyAdmin {
        uint48 oldValue = maxDelay;
        maxDelay = newMaxDelayInSeconds;
        emit NewMaxDelay(oldValue, maxDelay);
    }

    function setLimitWindow(
        uint48 newWindow
    ) external ensureNonzeroValue(newWindow) onlyAdmin {
        uint48 oldWindow = limitWindow;
        limitWindow = newWindow;
        emit NewLimitWindow(oldWindow, newWindow);
    }

    function setAssetLimiter(
        AssetLimiterConfig[] memory configs
    ) external onlyAdmin {
        uint256 len = configs.length;
        for (uint256 i = 0; i < len; i++) {
            AssetLimiterConfig memory config = configs[i];
            if (config.capacity == 0) {
                revert ZeroValueNotAllowed();
            }
            uint256 newRate = config.capacity / limitWindow;
            RateLimiter.Config memory newConfig = RateLimiter.Config({
                capacity: config.capacity,
                rate: newRate,
                isEnabled: config.isEnabled
            });

            RateLimiter.TokenBucket storage oldLimiter = rateLimiters[
                config.asset
            ];
            uint256 oldRate = oldLimiter.rate;
            uint256 oldCapacity = oldLimiter.capacity;
            oldLimiter._setTokenBucketConfig(newConfig);
            emit NewAssetLimiter(
                config.asset,
                oldRate,
                newRate,
                oldCapacity,
                config.capacity
            );
        }
    }

    /////////////////////////////////////////////////
    // View functions
    /////////////////////////////////////////////////
    /**
     * @return consumeValuePreview check if timelock is needed; true means timelock needed; false means timelock not needed
     */
    function consumeValuePreview(
        address asset,
        uint256 amount
    ) public view returns (bool) {
        RateLimiter.TokenBucket memory limiter = _currentStateInternal(asset);
        return limiter.isEnabled && limiter.tokens < amount;
    }

    /**
     * @return isAgreementMature checks if agreement is ready for claim
     */
    function isAgreementMature(
        uint256 agreementId
    ) external view returns (bool) {
        Agreement memory agreement = agreements[agreementId];
        if (agreement.isFrozen) {
            return false; // frozen agreement never matures
        }
        if (agreement.timestamp + maxDelay <= uint48(block.timestamp)) {
            return true; // agreement only stays in timelock bounded by maxDelay
        }
        return consumeValuePreview(agreement.asset, agreement.amount);
    }

    /**
     * @return getMinWaitInSeconds gives the minimum wait time for agreement to mature
     */
    function getMinWaitInSeconds(
        uint256 agreementId
    ) external view returns (uint256) {
        Agreement memory agreement = agreements[agreementId];
        RateLimiter.TokenBucket memory limiter = rateLimiters[agreement.asset];
        if (!limiter.isEnabled) {
            return 0;
        }
        if (agreement.amount > limiter.capacity) {
            return maxDelay;
        }
        uint256 waitInBucket = limiter._getMinWaitInSeconds(agreement.amount);
        return _min(waitInBucket, maxDelay);
    }

    /// @notice Consumes value from the rate limiter bucket based on the token value given.
    /// @notice will revert if limiter bucket has not enough tokens
    function _consumeValueInternal(address asset, uint256 amount) internal {
        RateLimiter.TokenBucket storage limiter = rateLimiters[asset];
        if (!limiter.isEnabled) {
            return; // nothing done for disabled limiter
        }
        limiter._consume(amount, asset);
    }

    /**
     * consumes value from the rate limiter, if not enough tokens available, forcefully reset tokens to 0
     * @notice will never revert
     */
    function _forceConsumeValueInternal(
        address asset,
        uint256 amount
    ) internal {
        RateLimiter.TokenBucket storage limiter = rateLimiters[asset];
        if (!limiter.isEnabled) {
            return; // nothing done for disabled limiter
        }
        RateLimiter.TokenBucket memory bucket = _currentStateInternal(asset);

        if (bucket.tokens >= amount) {
            limiter._consume(amount, asset);
        } else {
            limiter._resetBucketState();
        }
    }

    function currentState(
        address asset
    ) external view returns (RateLimiter.TokenBucket memory) {
        return _currentStateInternal(asset);
    }

    /// @notice Gets the token bucket with its values for the block it was requested at.
    /// @return The token bucket.
    function _currentStateInternal(
        address asset
    ) internal view returns (RateLimiter.TokenBucket memory) {
        return rateLimiters[asset]._currentTokenBucketState();
    }

    function userAgreements(
        address user
    ) external view returns (Agreement[] memory) {
        uint256 agreementLength = _userAgreements[user].length();
        Agreement[] memory _agreements = new Agreement[](agreementLength);
        for (uint256 i; i < agreementLength; ++i) {
            _agreements[i] = agreements[_userAgreements[user].at(i)];
        }
        return _agreements;
    }

    /////////////////////////////////////////////////
    // Receive
    /////////////////////////////////////////////////
    receive() external payable {}

    /////////////////////////////////////////////////
    // Proposer functions
    /////////////////////////////////////////////////
    function consumeValue(
        address asset,
        uint256 amount
    ) external notFrozen ensureNonzeroValue(amount) onlyProposer {
        return _consumeValueInternal(asset, amount);
    }

    function createAgreement(
        address asset,
        address beneficiary,
        uint256 amount
    )
        external
        notFrozen
        ensureNonzeroAddress(beneficiary)
        ensureNonzeroValue(amount)
        onlyProposer
        nonReentrant
        returns (uint256)
    {
        uint256 balance;
        if (asset == address(0)) {
            balance = address(this).balance;
        } else {
            balance = IERC20(asset).balanceOf(address(this));
        }
        if (balance < balances[asset] + amount) {
            revert NotEnoughBalance(asset, balance, balances[asset] + amount);
        }
        balances[asset] = balance;

        uint256 agreementId = agreementCount++;
        uint48 timestamp = uint48(block.timestamp);
        agreements[agreementId] = Agreement({
            isFrozen: false,
            asset: asset,
            beneficiary: beneficiary,
            timestamp: timestamp,
            id: agreementId,
            amount: amount
        });
        _userAgreements[beneficiary].add(agreementId);

        emit AgreementCreated(
            agreementId,
            beneficiary,
            asset,
            amount,
            timestamp
        );
        return agreementId;
    }

    /////////////////////////////////////////////////
    // Claim (user functions)
    /////////////////////////////////////////////////
    function claim(
        uint256[] calldata agreementIds
    ) external notFrozen nonReentrant {
        uint256 len = agreementIds.length;
        for (uint256 i = 0; i < len; i++) {
            Agreement memory agreement = agreements[agreementIds[i]];

            // check beneficiary
            if (msg.sender != agreement.beneficiary) {
                revert SenderIsNotBeneficiary(
                    agreement.id,
                    msg.sender,
                    agreement.beneficiary
                );
            }

            // check frozen
            if (agreement.isFrozen) {
                revert AgreementIsFrozen(agreement.id);
            }

            // consume value
            if (agreement.timestamp + maxDelay <= uint48(block.timestamp)) {
                _forceConsumeValueInternal(agreement.asset, agreement.amount);
            } else {
                _consumeValueInternal(agreement.asset, agreement.amount);
            }

            // delete agreement
            _deleteAgreementInternal(agreement);

            // transfer & emit
            _transferAssetInternal(
                agreement.asset,
                agreement.beneficiary,
                agreement.amount
            );
            emit AgreementClaimed(
                agreement.id,
                agreement.beneficiary,
                agreement.asset,
                agreement.amount,
                msg.sender
            );
        }
    }

    function _deleteAgreementInternal(Agreement memory agreement) internal {
        delete agreements[agreement.id];
        _userAgreements[agreement.beneficiary].remove(agreement.id);
    }

    function _transferAssetInternal(
        address asset,
        address beneficiary,
        uint256 amount
    ) internal {
        if (asset == address(0)) {
            (bool sent, ) = beneficiary.call{gas: 5300, value: amount}("");
            if (!sent) {
                revert NativeTransferFailed();
            }
        } else {
            IERC20(asset).safeTransfer(beneficiary, amount);
        }
        balances[asset] -= amount;
    }

    /////////////////////////////////////////////////
    // Executor functions
    /////////////////////////////////////////////////
    function executeAgreement(
        uint256[] calldata agreementIds
    ) external notFrozen onlyExecutor nonReentrant {
        uint256 len = agreementIds.length;
        for (uint i = 0; i < len; i++) {
            Agreement memory agreement = agreements[agreementIds[i]];

            // check frozen
            if (agreement.isFrozen) {
                revert AgreementIsFrozen(agreement.id);
            }

            // consume value forcefully so it succeeds every time
            _forceConsumeValueInternal(agreement.asset, agreement.amount);

            // delete agreement
            _deleteAgreementInternal(agreement);

            // transfer & emit
            _transferAssetInternal(
                agreement.asset,
                agreement.beneficiary,
                agreement.amount
            );
            emit AgreementClaimed(
                agreement.id,
                agreement.asset,
                agreement.beneficiary,
                agreement.amount,
                msg.sender
            );
        }
    }

    /////////////////////////////////////////////////
    // Freeze functions
    /////////////////////////////////////////////////
    function freezeAgreement(uint256 agreementId) external onlyEmergencyAdmin {
        agreements[agreementId].isFrozen = true;
        emit AgreementFrozen(agreementId, true);
    }

    function unfreezeAgreement(uint256 agreementId) external onlyAdmin {
        agreements[agreementId].isFrozen = false;
        emit AgreementFrozen(agreementId, false);
    }

    function freeze() external notFrozen onlyEmergencyAdmin {
        frozen = true;
        emit TimeLockFrozen(true);
    }

    function unfreeze() external onlyAdmin {
        frozen = false;
        emit TimeLockFrozen(false);
    }

    /////////////////////////////////////////////////
    // Emergency admin functions
    /////////////////////////////////////////////////
    // rescueAgreement claims agreements and send funds to designated address
    function rescueAgreement(
        uint256[] calldata agreementIds,
        address to
    ) external ensureNonzeroAddress(to) onlyEmergencyAdmin nonReentrant {
        uint256 len = agreementIds.length;
        for (uint256 i = 0; i < len; i++) {
            Agreement memory agreement = agreements[agreementIds[i]];

            // check frozen
            if (!agreement.isFrozen) {
                revert AgreementNotFrozen(agreement.id);
            }

            // consume value forcefully
            _forceConsumeValueInternal(agreement.asset, agreement.amount);

            // delete agreement
            _deleteAgreementInternal(agreement);

            // transfer & emit
            _transferAssetInternal(agreement.asset, to, agreement.amount);
            emit AgreementRescued(
                agreement.id,
                agreement.asset,
                agreement.beneficiary,
                agreement.amount,
                to
            );
        }
    }
}
