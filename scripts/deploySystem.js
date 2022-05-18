const { ethers, upgrades, network } = require("hardhat");
const { saveFile } = require("./helper")

const deploy = async (contractName, params) => {

    const factory = await ethers.getContractFactory(contractName)

    const instant = await upgrades.deployProxy(factory, params, {
        initializer: "initialize"
    });
    await instant.deployed();
    console.log("Deploying:", contractName);
    console.log("  to", instant.address);
    console.log("  in", instant.deployTransaction.hash);
    await saveFile(network.name, contractName, instant, params, {});

}

const deployProxy = async () => {
    await deploy("MeterERC20Upgradeable", [])
    await deploy("MeterGovERC20Upgradeable", [])
}
deployProxy();