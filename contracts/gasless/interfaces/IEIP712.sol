// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEIP712 {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        bytes memory signature
    ) external;
}
