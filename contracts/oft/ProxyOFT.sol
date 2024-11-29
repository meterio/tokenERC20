// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BaseProxyOFT.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "../timelock/ITimelock.sol";

// ProxyOFT with mint/burn mechanism
contract ProxyOFT is BaseProxyOFT {
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
        uint before = ERC20MintAndBurn(_token).balanceOf(_from);
        ERC20MintAndBurn(_token).burnFrom(_from, _amount);
        return before - ERC20MintAndBurn(_token).balanceOf(_from);
    }

    function _creditTo(
        address _srcToken,
        uint16 _srcChainId,
        address _toAddress,
        uint _amount
    ) internal virtual override returns (uint) {
        LaneDetail memory detail = tokenMapping(_srcChainId, _srcToken);
        address dstToken = detail.dstToken;
        if (dstToken == address(0)) {
            revert ZeroAddressNotAllowed();
        }

        ERC20MintAndBurn token = ERC20MintAndBurn(dstToken);

        // if timelock is empty
        // directly mint token
        if (timelock == address(0)) {
            uint before = token.balanceOf(_toAddress);
            token.mint(_toAddress, _amount);
            return token.balanceOf(_toAddress) - before;
        }

        // otherwise, check if timelock is needed
        bool shouldEnterTimelock = ITimelock(timelock).consumeValuePreview(
            dstToken,
            _amount
        );

        if (shouldEnterTimelock) {
            // if timelock is needed
            // mint and create an agreement
            uint before = token.balanceOf(timelock);
            token.mint(timelock, _amount);
            ITimelock(timelock).createAgreement(dstToken, _toAddress, _amount);
            return token.balanceOf(timelock) - before;
        } else {
            // otherwise, mint with consumeValue
            uint before = token.balanceOf(_toAddress);
            token.mint(_toAddress, _amount);
            ITimelock(timelock).consumeValue(dstToken, _amount);
            return token.balanceOf(_toAddress) - before;
        }
    }

    function version() external pure override returns (VERSION) {
        return VERSION.MINT_AND_BURN;
    }
}
