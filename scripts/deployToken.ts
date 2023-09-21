import { input, select, password } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { readFileSync } from "fs";
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

  const name = await input({
    message: "输入Token name:",
  });

  const symbol = await input({
    message: "输入Token symbol:",
  });

  const supply = await input({
    message: "输入初始供应量(单位:wei):",
  });

  const token_factory = await ethers.getContractFactory(
    "ERC20MinterBurnerPauser",
    wallet
  );
  override.gasLimit = await wallet.estimateGas(
    token_factory.getDeployTransaction(name, symbol, supply)
  );
  console.log("gasLimit:", override.gasLimit.toString());
  const token_deploy = await token_factory.deploy(
    name,
    symbol,
    supply,
    override
  );
  const token = await token_deploy.deployed();

  console.log("token:", token.address);
};

main();
