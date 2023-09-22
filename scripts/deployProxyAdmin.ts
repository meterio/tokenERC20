import { input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";

import { setNetwork } from "./helper";
const json = "./scripts/oft.config.json";
let config = JSON.parse(readFileSync(json).toString());
var colors = require("colors");
colors.enable();

const main = async () => {
  let { provider, wallet, override, networkIndex } = await setNetwork(
    config,
    ""
  );

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
  console.log("gasLimit:", colors.yellow(override.gasLimit.toString()));
  const proxyAdmin_deploy = await proxyAdmin_factory.deploy(override);
  const proxyAdmin = await proxyAdmin_deploy.deployed();

  console.log("SumerProxyAdmin:", colors.yellow(proxyAdmin.address));

  config[networkIndex].proxyAdmin = proxyAdmin.address;
  writeFileSync(json, JSON.stringify(config));
};

main();
