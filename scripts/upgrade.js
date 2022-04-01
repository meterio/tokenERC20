const { ethers, upgrades } = require("hardhat");

const deployProxy = async () => {
    const _token = await ethers.getContractFactory("ERC20MintablePauseableUpgradeable")

    const proxy = "0xBD30bD7Adcf52EaD3E3a5F96311Cd10360067A6D";

    const params = [
        "token2 name",
        "token2 symbol",
        "100000000000000000000000",
        "0x270E63f5EC6e6B5E3003ba77392c17f60C9f4E75"
    ];

    const token = await upgrades.upgradeProxy(proxy, _token, params, {
        initializer: "initialize"
    });
    console.log("Contract address:", token.address);
}
deployProxy();