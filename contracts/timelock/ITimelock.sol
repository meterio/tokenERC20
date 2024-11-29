// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITimelock {
    /** @notice Event emitted when a new time-lock agreement is created
     * @param agreementId ID of the created agreement
     * @param beneficiary Address of the beneficiary
     * @param asset Address of the asset
     * @param amount  amount
     * @param timestamp Timestamp when the assets entered timelock
     */
    event AgreementCreated(
        uint256 indexed agreementId,
        address indexed beneficiary,
        address indexed asset,
        uint256 amount,
        uint256 timestamp
    );

    /** @notice Event emitted when a time-lock agreement is claimed
     * @param agreementId ID of the claimed agreement
     * @param beneficiary Beneficiary of the claimed agreement
     * @param asset Address of the asset
     * @param amount amount
     * @param beneficiary Address of the beneficiary
     */
    event AgreementClaimed(
        uint256 indexed agreementId,
        address indexed beneficiary,
        address indexed asset,
        uint256 amount,
        address sender
    );

    /** @notice Event emitted when a time-lock agreement is frozen or unfrozen
     * @param agreementId ID of the affected agreement
     * @param value Indicates whether the agreement is frozen (true) or unfrozen (false)
     */
    event AgreementFrozen(uint256 agreementId, bool value);

    /** @notice Event emitted when the entire TimeLock contract is frozen or unfrozen
     * @param value Indicates whether the contract is frozen (true) or unfrozen (false)
     */
    event TimeLockFrozen(bool value);

    /**
     * @dev Emitted during rescueAgreement()
     * @param agreementId The rescued agreement Id
     * @param asset The adress of the asset token
     * @param to the actual to address that receive the funds
     * @param originalBeneficiary The address of the recipient
     * @param amount The amount being rescued
     **/
    event AgreementRescued(
        uint256 indexed agreementId,
        address indexed asset,
        address originalBeneficiary,
        uint256 amount,
        address indexed to
    );

    struct Agreement {
        bool isFrozen;
        address asset;
        address beneficiary;
        uint48 timestamp;
        uint256 amount;
    }

    struct UserAgreement {
        bool isFrozen;
        address asset;
        address beneficiary;
        uint48 timestamp;
        uint256 id;
        uint256 amount;
    }

    struct AssetLimiterConfig {
        address asset;
        uint256 capacity;
        bool isEnabled;
    }

    function createAgreement(
        address asset,
        address beneficiary,
        uint256 amount
    ) external returns (uint256);

    function consumeValue(address asset, uint256 amount) external;
    function consumeValuePreview(
        address asset,
        uint256 amount
    ) external view returns (bool);
}
