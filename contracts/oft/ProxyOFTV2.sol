// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BaseProxyOFT.sol";
import "../timelock/ITimelock.sol";

// ProxyOFT with lock/release mechanism
contract ProxyOFTV2 is BaseProxyOFT {
    function _debitFrom(
        address _token,
        address _from,
        uint16,
        bytes memory,
        uint _amount
    ) internal virtual override notPaused returns (uint) {
        if (_from != _msgSender()) {
            revert OwnerIsNotSender();
        }
        IERC20 token = IERC20(_token);
        uint before = token.balanceOf(address(this));
        token.transferFrom(_from, address(this), _amount);
        return token.balanceOf(address(this)) - before;
    }

    function _creditTo(
        address _srcToken,
        uint16 _srcEid,
        address _toAddress,
        uint _amount
    ) internal virtual override returns (uint) {
        LaneDetail memory detail = tokenMapping(_srcEid, _srcToken);
        address dstToken = detail.dstToken;
        if (dstToken == address(0)) {
            revert ZeroAddressNotAllowed();
        }
        IERC20 token = IERC20(dstToken);

        bool shouldEnterTimelock = ITimelock(timelock).consumeValuePreview(
            dstToken,
            _amount
        );

        if (shouldEnterTimelock) {
            uint before = token.balanceOf(timelock);
            token.transfer(timelock, _amount);
            ITimelock(timelock).createAgreement(dstToken, _toAddress, _amount);
            return token.balanceOf(timelock) - before;
        } else {
            uint before = token.balanceOf(_toAddress);
            token.transfer(_toAddress, _amount);
            ITimelock(timelock).consumeValue(dstToken, _amount);
            return token.balanceOf(_toAddress) - before;
        }
    }

    function adminWithdraw(
        address token,
        address to,
        uint256 amount
    ) public ensureNonzeroAddress(to) onlyAdmin {
        IERC20(token).transfer(to, amount);
    }

    function version() external pure override returns (VERSION) {
        return VERSION.LOCK_AND_RELEASE;
    }
}
