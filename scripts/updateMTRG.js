const { ethers, upgrades, network } = require("hardhat");
const { saveFile } = require("./helper")

const deploy = async (contractName, address) => {

    const factory = await ethers.getContractFactory(contractName)

    const instant = await upgrades.upgradeProxy(address, factory);
    console.log("Updating:", contractName);
    console.log("  to", instant.address);
    console.log("  in", instant.deployTransaction.hash);
    await saveFile(network.name, contractName, instant, [], {});

}

const deployProxy = async () => {
    await deploy("MeterGovERC20Upgradeable", "0x69d0E2BDC045A57cd0304A5a831E43651B4050FD")
}
deployProxy();