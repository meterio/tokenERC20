import { input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { setNetwork } from "./helper";
const json = "./scripts/oft.config.json";
let config = JSON.parse(readFileSync(json).toString());
var colors = require("colors");
colors.enable();

const main = async () => {
  let { provider, wallet, override } = await setNetwork(config, "");

  const name = await input({
    message: "输入Token name:",
  });

  const symbol = await input({
    message: "输入Token symbol:",
  });

  const supply = await input({
    message: "输入初始供应量(单位:wei):",
  });

  override.nonce = await input({
    message: "输入nonce:",
    default: (await provider.getTransactionCount(wallet.address)).toString(),
  });

  const token_factory = await ethers.getContractFactory(
    "ERC20MinterBurnerPauser",
    wallet
  );
  override.gasLimit = await wallet.estimateGas(
    token_factory.getDeployTransaction(name, symbol, supply)
  );
  console.log("gasLimit:", colors.yellow(override.gasLimit.toString()));
  const token_deploy = await token_factory.deploy(
    name,
    symbol,
    supply,
    override
  );
  const token = await token_deploy.deployed();

  console.log("token:", colors.yellow(token.address));
};

main();
