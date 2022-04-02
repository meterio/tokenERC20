const { ethers, upgrades, network } = require("hardhat");
const { mkdirSync, readFileSync, writeFileSync, existsSync } = require("fs");

const deployProxy = async () => {
    const _token = await ethers.getContractFactory("ERC20MintablePauseableUpgradeable")

    const path = `./deployments/${network.name}/`;
    const latest = `ERC20MintablePauseableUpgradeable.json`;

    if (existsSync(path + latest)) {
        let json = JSON.parse(readFileSync(path + latest).toString());
        const proxy = json.address;

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
    } else {
        return "";
    }
}
deployProxy();