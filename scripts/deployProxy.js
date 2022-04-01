const { ethers, upgrades } = require("hardhat");

const deployProxy = async () => {
    const _token = await ethers.getContractFactory("ERC20MintablePauseableUpgradeable")

    const params = [
        "token name",
        "token symbol",
        "100000000000000000000000",
        "0xa5F1e2596DC1e878a6a039f41330d9A97c771bE9"
    ]

    const token = await upgrades.deployProxy(_token, params, {
        initializer: "initialize"
    });
    await token.deployed();
    console.log("Contract address:", token.address);
}
deployProxy();