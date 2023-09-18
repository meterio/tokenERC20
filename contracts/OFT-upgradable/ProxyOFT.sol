// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./OFTCoreUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ERC20MintAndBurn is IERC20 {
    function burnFrom(address account, uint256 amount) external;

    function mint(address to, uint256 amount) external;
}

contract ProxyOFT is OFTCoreUpgradeable {
    using SafeERC20 for ERC20MintAndBurn;

    address public override token;
    uint256 public override circulatingSupply;

    function initialize(address _lzEndpoint, address admin) public initializer {
        __OFTCoreUpgradeable_init(_lzEndpoint, admin);
    }

    function _debitFrom(
        address _token,
        address _from,
        uint16,
        bytes memory,
        uint _amount
    ) internal virtual override returns (uint) {
        require(_from == _msgSender(), "ProxyOFT: owner is not send caller");
        uint before = ERC20MintAndBurn(_token).balanceOf(_from);
        ERC20MintAndBurn(_token).burnFrom(_from, _amount);
        return before - ERC20MintAndBurn(_token).balanceOf(_from);
    }

    function _creditTo(
        address _token,
        uint16,
        address _toAddress,
        uint _amount
    ) internal virtual override returns (uint) {
        uint before = ERC20MintAndBurn(_token).balanceOf(_toAddress);
        ERC20MintAndBurn(_token).mint(_toAddress, _amount);
        return ERC20MintAndBurn(_token).balanceOf(_toAddress) - before;
    }
}
