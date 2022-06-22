pragma solidity ^0.8.11;

interface ISafeMint {
    /// @dev 状态枚举类型
    enum Status {
        pending, // 处理中
        passed, // 通过
        reject, // 驳回
        challenge, // 挑战
        locked // 锁定
    }
    /// @dev 项目信息
    struct Project {
        string name; // 项目名称(唯一)
        address owner; // 项目创建者
        uint256 createTime; // 创建时间
        address projectContract; // 项目合约地址
        uint256 startTime; // 开始铸造的时间
        uint256 endTime; // 结束铸造的时间
        string ipfsAddress; // ipfs中存储的json信息地址
        uint256 projectFee; // 项目提交费
        Status status; // 状态
    }

    /// @dev 审计信息
    struct Audit {
        uint256 projectId; // 项目id索引
        address auditor; // 审计员
        uint256 auditTime; // 审计时间
        string comments; // 审计备注
        uint256 auditFee; // 审计押金
        Status status; // 状态
    }

    /// @dev 挑战信息
    struct Challenge {
        uint256 projectId; // 项目id索引
        address challenger; // 挑战者
        uint256 time; // 挑战时间
        string comments; // 原因备注
        uint256 challengeFee; // 审计押金
    }

    /// @dev 项目收费记录
    struct FeeRecord {
        uint256 auditTime; // 审计时间
        address auditor; // 审计员
        uint256 value; // 收费数量
    }

    /// @dev 提交项目
    event SaveProject(
        string indexed name,
        address indexed owner,
        address indexed projectContract,
        uint256 startTime,
        uint256 endTime,
        uint256 projectPrice,
        string ipfsAddress,
        uint256 projectId
    );

    /// @dev 审计项目
    event AuditProject(
        string indexed name,
        address indexed auditor,
        uint256 auditPrice,
        string comments,
        Status status
    );

    /// @dev 挑战项目
    event ChallengeProject(
        string indexed name,
        address indexed challenger,
        uint256 challengePrice,
        string comments
    );

    event ArbitrateProject(
        string indexed name,
        address indexed arbitrator,
        Status status
    );

    event EditProject(
        string indexed name,
        uint256 startTime,
        uint256 endTime,
        string ipfsAddress
    );
}
