// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./OFTCoreUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ProxyOFTV2 is OFTCoreUpgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.Bytes32Set;
    using SafeERC20 for IERC20;

    struct LaneDetail {
        uint16 srcChainId;
        address srcToken;
        address dstToken;
    }

    address public override token;
    uint256 public override circulatingSupply;
    bool public paused;

    EnumerableSetUpgradeable.Bytes32Set private _laneHash;
    mapping(bytes32 => LaneDetail) private _laneDetail;

    function initialize(address _lzEndpoint, address admin) public initializer {
        __OFTCoreUpgradeable_init(_lzEndpoint, admin);
    }

    function addTokenMapping(
        uint16 srcChainId,
        address srcToken,
        address dstToken
    ) public onlyAdmin {
        require(srcChainId > 0, "srcChainId!");
        require(srcToken != address(0), "srcToken!");
        require(dstToken != address(0), "dstToken!");
        bytes32 laneHash = keccak256(abi.encode(srcChainId, srcToken));
        require(!_laneHash.contains(laneHash), "lane exist!");
        _laneHash.add(laneHash);
        _laneDetail[laneHash] = LaneDetail({
            srcChainId: srcChainId,
            srcToken: srcToken,
            dstToken: dstToken
        });
    }

    function updateTokenMapping(
        uint16 srcChainId,
        address srcToken,
        address dstToken
    ) public onlyAdmin {
        require(srcChainId > 0, "srcChainId!");
        require(srcToken != address(0), "srcToken!");
        require(dstToken != address(0), "dstToken!");
        bytes32 laneHash = keccak256(abi.encode(srcChainId, srcToken));
        require(_laneHash.contains(laneHash), "lane not exist!");
        _laneDetail[laneHash] = LaneDetail({
            srcChainId: srcChainId,
            srcToken: srcToken,
            dstToken: dstToken
        });
    }

    function removeTokenMapping(
        uint16 srcChainId,
        address srcToken
    ) public onlyAdmin {
        require(srcChainId > 0, "srcChainId!");
        require(srcToken != address(0), "srcToken!");
        bytes32 laneHash = keccak256(abi.encode(srcChainId, srcToken));
        require(_laneHash.contains(laneHash), "lane not exist!");
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
        uint16 srcChainId,
        address srcToken
    ) public view returns (bool) {
        return _laneHash.contains(keccak256(abi.encode(srcChainId, srcToken)));
    }

    function tokenMapping(
        uint16 srcChainId,
        address srcToken
    ) public view returns (LaneDetail memory) {
        bytes32 laneHash = keccak256(abi.encode(srcChainId, srcToken));
        require(_laneHash.contains(laneHash), "lane not exist!");
        return _laneDetail[laneHash];
    }

    function _debitFrom(
        address _token,
        address _from,
        uint16,
        bytes memory,
        uint _amount
    ) internal virtual override returns (uint) {
        require(!paused, "paused!");
        require(_from == _msgSender(), "ProxyOFT: owner is not send caller");
        IERC20 token = IERC20(_token);
        uint before = token.balanceOf(address(this));
        token.safeTransferFrom(_from, address(this), _amount);
        return token.balanceOf(address(this)) - before;
    }

    function _creditTo(
        address _srcToken,
        uint16 _srcChainId,
        address _toAddress,
        uint _amount
    ) internal virtual override returns (uint) {
        LaneDetail memory detail = tokenMapping(_srcChainId, _srcToken);
        address dstToken = detail.dstToken;
        require(dstToken != address(0), "dstToken!");
        IERC20 token = IERC20(dstToken);
        uint before = token.balanceOf(_toAddress);
        token.safeTransfer(_toAddress, _amount);
        return token.balanceOf(_toAddress) - before;
    }

    function adminWithdraw(
        address token,
        address to,
        uint256 amount
    ) public onlyAdmin {
        IERC20(token).safeTransfer(to, amount);
    }

    function pause() external onlyAdmin {
        paused = true;
    }

    function unPause() external onlyAdmin {
        paused = false;
    }

    function version() public pure returns (bytes32) {
        return "2.0";
    }
}
