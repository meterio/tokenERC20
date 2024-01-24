import { input, select } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  config,
  setNetwork,
  deployContractV2,
  green,
  sendTransaction,
} from "./helper";
import { utils } from "ethers";

const main = async () => {
  const network = await setNetwork(config);
  let { override } = network;

  const pa = await input({
    message: "输入Proxy Admin地址:",
    validate: (value = "") => utils.isAddress(value) || "Pass a valid value",
  });

  const name = await input({
    message: "输入Token name:",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  const symbol = await input({
    message: "输入Token symbol:",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  const supply = await input({
    message: "输入初始供应量(单位:wei):",
    default: "0",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  const admin = await input({
    message: "输入合约Admin:",
    validate: (value = "") => utils.isAddress(value) || "Pass a valid value",
  });

  const implementation = await deployContractV2(
    ethers,
    network,
    "ERC20MintablePauseableUpgradeable",
    [],
    override
  );

  const proxy_answer = await select({
    message: `选择${green(name)} 的${green("Proxy")}合约:`,
    choices: [
      {
        name: "部署合约",
        value: "deploy",
      },
      {
        name: "更新合约",
        value: "update",
      },
    ],
  });

  if (proxy_answer == "deploy") {
    const factory = await ethers.getContractFactory(
      "ERC20MintablePauseableUpgradeable"
    );
    const data = factory.interface.encodeFunctionData("initialize", [
      name,
      symbol,
      supply,
      admin,
    ]);
    const proxy = await deployContractV2(
      ethers,
      network,
      "SumerProxy",
      [implementation.address, pa, data],
      override
    );
  } else if (proxy_answer == "update") {
    const proxyAddress = await input({
      message: "输入Proxy地址:",
      validate: (value = "") => utils.isAddress(value) || "Pass a valid value",
    });
    const proxyAdminContract = await ethers.getContractAt(
      "SumerProxyAdmin",
      pa,
      network.wallet
    );
    await sendTransaction(
      network,
      proxyAdminContract,
      "upgrade(address,address)",
      [proxyAddress, implementation.address],
      override
    );
  }
};

main();
