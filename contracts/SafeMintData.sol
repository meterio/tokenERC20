pragma solidity ^0.8.11;

import "./ISafeMint.sol";

contract SafeMintData is ISafeMint {
    /// @dev 用户地址=>布尔值,一个用户只能提交一个项目
    mapping(address => bool) public user;
    /// @dev 项目合约地址=>布尔值,一个项目地址只能提交一次
    mapping(address => bool) public contractAddress;
    /// @dev 项目名称hash=>项目ID,用项目名称找到项目ID
    mapping(bytes32 => uint256) public projectId;
    /// @dev 项目ID=>审计信息数组,审计记录
    mapping(uint256 => Audit[]) public auditRecord;
    /// @dev 项目ID=>挑战信息数组,挑战记录
    mapping(uint256 => Challenge[]) public challengeRecord;
    /// @dev 项目ID=>项目收费(提交收费+审计押金)
    mapping(uint256 => FeeRecord) public feeRecord;

    /// @dev 通过的数组
    uint256[] public passedArr;
    /// @dev 处理中的数组
    uint256[] public pendingArr;
    /// @dev 驳回的数组
    uint256[] public rejectArr;
    /// @dev 锁定的数组
    uint256[] public lockedArr;
    /// @dev 挑战的数组
    uint256[] public challengeArr;
    /// @dev 项目的数组
    Project[] public projectArr;
    /// @dev 提交项目的价格
    uint256 public projectPrice;
    /// @dev 审计押金
    uint256 public auditPrice;
    /// @dev 挑战押金
    uint256 public challengePrice;
    /// @dev 挑战时长
    uint256 public duration;

    // Auditor 常量
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    // Arbitrator 常量
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");
}
