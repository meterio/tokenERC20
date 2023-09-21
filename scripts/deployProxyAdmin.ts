import { input, select, password, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { Overrides } from "ethers";
const json = "./scripts/oft.config.json";
let config = JSON.parse(readFileSync(json).toString());

function getChoices() {
  let result = [];
  for (let i = 0; i < config.length; i++) {
    result.push({
      name: config[i].name,
      value: i,
    });
  }
  return result;
}

const main = async () => {
  // 环境
  let override: Overrides = {};
  const networkIndex = await select({
    message: "选择网络:",
    choices: getChoices(),
  });
  const currentConfig = config[networkIndex];
  const privateKey = await password({
    message: "输入Private Key:",
  });
  const provider = new ethers.providers.JsonRpcProvider(currentConfig.rpc);
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deployer:", wallet.address);

  const defaultGasPrice = await wallet.provider.getGasPrice();
  override.gasPrice = await input({
    message: "输入Gas price:",
    default: defaultGasPrice.toString(),
  });

  override.nonce = await input({
    message: "输入nonce:",
    default: (await provider.getTransactionCount(wallet.address)).toString(),
  });

  const proxyAdmin_factory = await ethers.getContractFactory(
    "SumerProxyAdmin",
    wallet
  );
  override.gasLimit = await wallet.estimateGas(
    proxyAdmin_factory.getDeployTransaction()
  );
  console.log("gasLimit:", override.gasLimit.toString());
  const proxyAdmin_deploy = await proxyAdmin_factory.deploy(override);
  const proxyAdmin = await proxyAdmin_deploy.deployed();

  console.log("SumerProxyAdmin:", proxyAdmin.address);

  config[networkIndex].proxyAdmin = proxyAdmin.address;
  writeFileSync(json, JSON.stringify(config));
};

main();
