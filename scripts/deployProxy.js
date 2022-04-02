const { ethers, upgrades, network } = require("hardhat");
const { saveFile } = require("./helper")

const deployProxy = async () => {
    const _token = await ethers.getContractFactory("ERC20MintablePauseableUpgradeable")

    const params = [
        "token name", // name
        "token symbol", // symbol
        "100000000000000000000000", // initial supply
        "0xa5F1e2596DC1e878a6a039f41330d9A97c771bE9" // owner
    ]

    const token = await upgrades.deployProxy(_token, params, {
        initializer: "initialize"
    });
    await token.deployed();
    console.log("Deploying:", "ERC20MintablePauseableUpgradeable");
    console.log("  to", token.address);
    console.log("  in", token.deployTransaction.hash);
    await saveFile(network.name, "ERC20MintablePauseableUpgradeable", token, [], {});
}
deployProxy();