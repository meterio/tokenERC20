// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IWMTR {
    function deposit() external payable;

    function transfer(address dst, uint256 wad) external returns (bool);

    function withdraw(uint256 wad) external;
}
