// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./OFTCoreUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

interface ERC20MintAndBurn is IERC20 {
    function burnFrom(address account, uint256 amount) external;

    function mint(address to, uint256 amount) external;
}

abstract contract BaseProxyOFT is OFTCoreUpgradeable {
    using SafeERC20 for ERC20MintAndBurn;
    using SafeERC20 for IERC20;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.Bytes32Set;

    struct LaneDetail {
        uint16 srcEid;
        address srcToken;
        address dstToken;
    }

    address public override token;
    uint256 public override circulatingSupply;
    bool public paused;

    EnumerableSetUpgradeable.Bytes32Set private _laneHash;
    mapping(bytes32 => LaneDetail) private _laneDetail;

    address public timelock;

    enum VERSION {
        UNKNOWN,
        MINT_AND_BURN,
        LOCK_AND_RELEASE
    }

    /////////////////////////////////////////////////
    // Errors
    /////////////////////////////////////////////////
    // errors in modifiers
    error ZeroAddressNotAllowed();
    error ZeroValueNotAllowed();
    error Paused();

    error LaneExisted();
    error LaneNotExist();
    error OwnerIsNotSender();

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

    modifier notPaused() {
        if (paused) {
            revert Paused();
        }
        _;
    }

    /////////////////////////////////////////////////
    // Constructor & Initializer
    /////////////////////////////////////////////////
    constructor() {
        _disableInitializers();
    }

    function initialize(address _lzEndpoint, address admin) public initializer {
        __OFTCoreUpgradeable_init(_lzEndpoint, admin);
    }

    /////////////////////////////////////////////////
    // Token Mapping functions
    /////////////////////////////////////////////////
    function addTokenMapping(
        uint16 srcEid,
        address srcToken,
        address dstToken
    )
        public
        ensureNonzeroValue(srcEid)
        ensureNonzeroAddress(srcToken)
        ensureNonzeroAddress(dstToken)
        onlyAdmin
    {
        bytes32 laneHash = keccak256(abi.encode(srcEid, srcToken));
        if (_laneHash.contains(laneHash)) {
            revert LaneExisted();
        }
        _laneHash.add(laneHash);
        _laneDetail[laneHash] = LaneDetail({
            srcEid: srcEid,
            srcToken: srcToken,
            dstToken: dstToken
        });
    }

    function updateTokenMapping(
        uint16 srcEid,
        address srcToken,
        address dstToken
    )
        public
        ensureNonzeroValue(srcEid)
        ensureNonzeroAddress(srcToken)
        ensureNonzeroAddress(dstToken)
        onlyAdmin
    {
        bytes32 laneHash = keccak256(abi.encode(srcEid, srcToken));
        if (!_laneHash.contains(laneHash)) {
            revert LaneNotExist();
        }
        _laneDetail[laneHash] = LaneDetail({
            srcEid: srcEid,
            srcToken: srcToken,
            dstToken: dstToken
        });
    }

    function removeTokenMapping(
        uint16 srcEid,
        address srcToken
    )
        public
        ensureNonzeroValue(srcEid)
        ensureNonzeroAddress(srcToken)
        onlyAdmin
    {
        bytes32 laneHash = keccak256(abi.encode(srcEid, srcToken));
        if (!_laneHash.contains(laneHash)) {
            revert LaneNotExist();
        }
        _laneHash.remove(laneHash);
        delete _laneDetail[laneHash];
    }

    function getAllLane() public view returns (LaneDetail[] memory) {
        uint256 length = _laneHash.length();
        LaneDetail[] memory laneDetails = new LaneDetail[](length);
        for (uint256 i; i < length; ++i) {
            laneDetails[i] = _laneDetail[_laneHash.at(i)];
        }
        return laneDetails;
    }

    function laneExist(
        uint16 srcEid,
        address srcToken
    ) public view returns (bool) {
        return _laneHash.contains(keccak256(abi.encode(srcEid, srcToken)));
    }

    function tokenMapping(
        uint16 srcEid,
        address srcToken
    ) public view returns (LaneDetail memory) {
        bytes32 laneHash = keccak256(abi.encode(srcEid, srcToken));
        if (!_laneHash.contains(laneHash)) {
            revert LaneNotExist();
        }
        return _laneDetail[laneHash];
    }

    /////////////////////////////////////////////////
    // Admin functions
    /////////////////////////////////////////////////
    function pause() external onlyAdmin {
        paused = true;
    }

    function unPause() external onlyAdmin {
        paused = false;
    }

    function setTimelock(
        address _timelock
    ) external ensureNonzeroAddress(_timelock) onlyAdmin {
        timelock = _timelock;
    }

    /////////////////////////////////////////////////
    // View function
    /////////////////////////////////////////////////
    function version() external pure virtual returns (VERSION) {
        return VERSION.UNKNOWN;
    }
}
