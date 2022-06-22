pragma solidity ^0.8.11;

import "./access/AccessControl.sol";
import "./utils/Arrays.sol";
import "./SafeMintData.sol";

contract SafeMint is AccessControl, SafeMintData {
    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "sender doesn't have admin role"
        );
        _;
    }

    /// @dev 构造函数
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /**
     * @dev 提交项目
     * @param name 项目名称
     * @param projectContract 项目合约地址
     * @param startTime 开始铸造的时间
     * @param endTime 结束铸造的时间
     * @param ipfsAddress ipfs中存储的json信息地址
     */
    function saveProject(
        string calldata name,
        address projectContract,
        uint256 startTime,
        uint256 endTime,
        string calldata ipfsAddress
    ) public payable {
        // 验证项目收费
        require(msg.value >= projectPrice, "low price");
        // 验证用户只能提交一次
        require(
            !user[msg.sender] && msg.sender == tx.origin,
            "user aleardy saved"
        );
        // 一个项目地址只能提交一次
        require(
            !contractAddress[projectContract],
            "contractAddress aleardy saved"
        );
        // 验证项目名称
        require(!projectName(name), "name aleardy used");

        // 项目结构体
        Project memory _project = Project({
            name: name,
            owner: msg.sender,
            projectContract: projectContract,
            createTime: block.timestamp,
            startTime: startTime,
            endTime: endTime,
            ipfsAddress: ipfsAddress,
            projectFee: msg.value,
            status: Status.pending
        });

        // 推入项目数组
        projectArr.push(_project);
        // 项目ID
        uint256 _projectId = pendingArr.length;
        // 记录项目ID
        projectId[keccak256(abi.encodePacked(name))] = _projectId;
        // 推入处理中数组
        pendingArr.push(_projectId);
        // 记录项目收费
        feeRecord[_projectId] = FeeRecord({
            auditTime: 0,
            auditor: address(0),
            value: msg.value
        });
        emit SaveProject(
            name,
            msg.sender,
            projectContract,
            startTime,
            endTime,
            msg.value,
            ipfsAddress,
            _projectId
        );
    }

    /**
     * @dev 审计项目
     * @param name 项目名称
     * @param comments 审计备注
     * @param status 结果状态
     */
    function audit(
        string calldata name,
        string calldata comments,
        Status status
    ) public payable {
        // 确认审计员身份
        require(
            hasRole(AUDITOR_ROLE, msg.sender),
            "sender doesn't have auditor role"
        );
        // 项目ID
        uint256 _projectId = projectId[keccak256(abi.encodePacked(name))];
        // 确认ID有效
        require(_projectId > 0, "project not exist");
        require(
            projectArr[_projectId - 1].status == Status.pending,
            "Status not pending"
        );
        if (feeRecord[_projectId].auditTime == 0) {
            // 验证审计收费
            require(msg.value >= auditPrice, "low price");
            feeRecord[_projectId].auditTime = block.timestamp;
            feeRecord[_projectId].auditor = msg.sender;
            feeRecord[_projectId].value += msg.value;
        } else {
            require(
                feeRecord[_projectId].auditor == msg.sender,
                "auditor error!"
            );
        }
        // 确认状态输入正确
        require(
            status == Status.passed ||
                status == Status.reject ||
                status == Status.locked,
            "Status error!"
        );
        // 推入审计记录
        auditRecord[_projectId].push(
            Audit({
                projectId: _projectId,
                auditor: msg.sender,
                auditTime: block.timestamp,
                comments: comments,
                auditFee: msg.value,
                status: status
            })
        );
        // 从pending数组中移除项目ID
        Arrays.removeByValue(pendingArr, _projectId);
        // 如果状态为通过
        if (status == Status.passed) {
            // 推入通过数组
            passedArr.push(_projectId);
        }
        // 如果状态为驳回
        if (status == Status.reject) {
            // 推入驳回数组
            rejectArr.push(_projectId);
        }
        // 如果状态为锁定
        if (status == Status.locked) {
            // 推入锁定数组
            lockedArr.push(_projectId);
        }
        // 修改项目状态
        projectArr[_projectId - 1].status = status;
        // 触发事件
        emit AuditProject(name, msg.sender, msg.value, comments, status);
    }

    /**
     * @dev 挑战项目
     * @param name 项目名称
     * @param comments 审计备注
     */
    function challenge(string calldata name, string calldata comments)
        public
        payable
    {
        // 验证审计收费
        require(msg.value >= challengePrice, "low price");
        // 项目ID
        uint256 _projectId = projectId[keccak256(abi.encodePacked(name))];
        // 确认ID有效
        require(_projectId > 0, "project not exist");
        // 确认项目审核时间
        require(
            feeRecord[_projectId].auditTime + duration > block.timestamp,
            "expired!"
        );
        // 确认项目状态
        require(
            projectArr[_projectId - 1].status == Status.passed,
            "Status error!"
        );
        // 推入挑战记录数组
        challengeRecord[_projectId].push(
            Challenge({
                projectId: _projectId,
                challenger: msg.sender,
                time: block.timestamp,
                challengeFee: msg.value,
                comments: comments
            })
        );
        // 修改状态
        projectArr[_projectId - 1].status = Status.challenge;
        // 推入挑战数组
        challengeArr.push(_projectId);
        emit ChallengeProject(name, msg.sender, msg.value, comments);
    }

    /**
     * @dev 仲裁项目
     * @param name 项目名称
     * @param status 仲裁结果
     */
    function Arbitrate(string calldata name, Status status) public {
        // 确认仲裁员身份
        require(
            hasRole(ARBITRATOR_ROLE, msg.sender),
            "sender doesn't have arbitrator role"
        );
        // 确认仲裁结果
        require(
            status == Status.passed || status == Status.locked,
            "Status error!"
        );
        // 项目ID
        uint256 _projectId = projectId[keccak256(abi.encodePacked(name))];
        // 确认项目ID有效
        require(_projectId > 0, "project not exist");
        // 确认项目状态为仲裁中
        require(
            projectArr[_projectId - 1].status == Status.challenge,
            "Status error!"
        );
        // 从挑战的数组中移除项目ID
        Arrays.removeByValue(challengeArr, _projectId);
        // 如果状态为通过
        if (status == Status.passed) {
            // 挑战押金
            uint256 _challengeFee;
            // 循环累计挑战押金
            for (uint256 i; i < challengeRecord[_projectId].length; ++i) {
                _challengeFee += challengeRecord[_projectId][i].challengeFee;
                challengeRecord[_projectId][i].challengeFee = 0;
            }
            // 将挑战押金记录到审核费用
            feeRecord[_projectId].value += _challengeFee;
            // 推入通过数组
            passedArr.push(_projectId);
        }
        // 如果状态为锁定
        if (status == Status.locked) {
            // 从通过的数组中移除项目ID
            Arrays.removeByValue(passedArr, _projectId);
            // 挑战记录数组长度
            uint256 chellengeLength = challengeRecord[_projectId].length;
            // 挑战奖励 = 审计押金总和 * 1e18 / 挑战记录长度
            uint256 chellengeReward = (feeRecord[_projectId].value * 1e18) /
                chellengeLength;
            // 循环挑战记录数组
            for (uint256 i; i < chellengeLength; ++i) {
                // 为每个挑战记录增加审计奖金
                challengeRecord[_projectId][i].challengeFee +=
                    chellengeReward /
                    1e18;
            }
            feeRecord[_projectId].value = 0;
            // 推入锁定数组
            lockedArr.push(_projectId);
        }
        // 修改项目状态
        projectArr[_projectId - 1].status = status;
        emit ArbitrateProject(name, msg.sender, status);
    }

    /**
     * @dev 修改
     * @param name 项目名称
     * @param startTime 开始铸造的时间
     * @param endTime 结束铸造的时间
     * @param ipfsAddress ipfs中存储的json信息地址
     */
    function editProject(
        string calldata name,
        uint256 startTime,
        uint256 endTime,
        string calldata ipfsAddress
    ) public {
        // 项目ID
        uint256 _projectId = projectId[keccak256(abi.encodePacked(name))];
        // 确认ID有效
        require(_projectId > 0, "project not exist");

        // 项目结构体
        Project storage _project = projectArr[_projectId - 1];
        // 确认调用者身份
        require(_project.owner == msg.sender, "caller is not project owner");
        // 确认状态输入正确
        require(_project.status == Status.reject, "Status error!");
        // 修改信息
        _project.startTime = startTime;
        _project.endTime = endTime;
        _project.ipfsAddress = ipfsAddress;
        // 修改状态
        _project.status = Status.pending;
        // 从驳回的数组中移除项目ID
        Arrays.removeByValue(rejectArr, _projectId);
        // 推入到处理中数组
        pendingArr.push(_projectId);
        emit EditProject(name, startTime, endTime, ipfsAddress);
    }

    function claimAuditReward(uint256 _projectId) public {
        // 确认项目ID
        require(
            _projectId > 0 && _projectId < projectArr.length,
            "project id error"
        );
        // 确认项目审核时间
        require(
            feeRecord[_projectId].auditTime + duration < block.timestamp,
            "auditTime < duration!"
        );
        // 确认项目状态必须为通过或者锁定状态
        require(
            projectArr[_projectId - 1].status == Status.passed ||
                projectArr[_projectId - 1].status == Status.locked,
            "Starus error"
        );
        require(feeRecord[_projectId].auditor == msg.sender, "auditor error!");
        uint256 value = feeRecord[_projectId].value;
        if (value > 0) {
            payable(msg.sender).transfer(value);
        }
    }

    function claimChellengeReward(uint256 _projectId) public {
        // 确认项目ID
        require(
            _projectId > 0 && _projectId < projectArr.length,
            "project id error"
        );
        // 确认项目审核时间
        require(
            feeRecord[_projectId].auditTime + duration < block.timestamp,
            "auditTime < duration!"
        );
        // 确认项目状态必须为锁定状态
        require(
            projectArr[_projectId - 1].status == Status.locked,
            "Starus error"
        );
        // 挑战费用
        uint256 challengeFee;
        // 循环所有挑战
        for (uint256 i = 0; i < challengeRecord[_projectId].length; i++) {
            // 如果挑战者是当前用户,并且费用>0
            if (challengeRecord[_projectId][i].challenger == msg.sender) {
                challengeFee += challengeRecord[_projectId][i].challengeFee;
            }
        }
        if (challengeFee > 0) {
            payable(msg.sender).transfer(challengeFee);
        }
    }

    /// @dev 管理员设置价格
    function adminSetProjectPrice(uint256 _price) public onlyAdmin {
        projectPrice = _price;
    }

    /// @dev 管理员设置审计押金
    function adminSetAuditPrice(uint256 _price) public onlyAdmin {
        auditPrice = _price;
    }

    /// @dev 管理员设置挑战价格
    function adminSetChellengePrice(uint256 _price) public onlyAdmin {
        challengePrice = _price;
    }

    /// @dev 管理员设置挑战时长
    function adminSetDuration(uint256 _duration) public onlyAdmin {
        duration = _duration;
    }

    function adminWithdraw(address payable to) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "sender doesn't have admin role"
        );
        to.transfer(address(this).balance);
    }

    /// @dev 返回项目名称是否存在
    function projectName(string calldata name) public view returns (bool) {
        return projectId[keccak256(abi.encodePacked(name))] > 0;
    }

    /**
     * @dev 根据开始索引和长度数量,返回制定数组
     * @param arr 指定的数组
     * @param start 开始索引
     * @param limit 返回数组长度
     */
    function getArrs(
        uint256[] memory arr,
        uint256 start,
        uint256 limit
    ) private view returns (Project[] memory) {
        // 数组长度赋值
        uint256 length = arr.length;
        // 如果开始的索引加返回的长度超过了数组的长度,则返回的长度等于数组长度减去开始索引
        uint256 _limit = start + limit <= length ? limit : length - start;
        // 返回的项目数组
        Project[] memory _projects = new Project[](_limit);
        // 开始的索引累加变量
        uint256 _index = start;
        // 用修改后的返回长度循环
        for (uint256 i = 0; i < _limit; ++i) {
            // 将项目信息赋值到新数组
            _projects[i] = projectArr[arr[_index]];
            // 索引累加
            _index++;
        }
        // 返回数组
        return _projects;
    }

    /// @dev 返回通过的数组
    function getPassed(uint256 start, uint256 limit)
        public
        view
        returns (Project[] memory)
    {
        return getArrs(passedArr, start, limit);
    }

    /// @dev 返回处理中的数组
    function getPending(uint256 start, uint256 limit)
        public
        view
        returns (Project[] memory)
    {
        return getArrs(pendingArr, start, limit);
    }

    /// @dev 返回驳回的数组
    function getReject(uint256 start, uint256 limit)
        public
        view
        returns (Project[] memory)
    {
        return getArrs(rejectArr, start, limit);
    }

    /// @dev 返回锁定的数组
    function getLocked(uint256 start, uint256 limit)
        public
        view
        returns (Project[] memory)
    {
        return getArrs(lockedArr, start, limit);
    }

    /// @dev 返回挑战中的数组
    function getChallenge(uint256 start, uint256 limit)
        public
        view
        returns (Project[] memory)
    {
        return getArrs(challengeArr, start, limit);
    }
}
