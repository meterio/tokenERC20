import { input, select } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  selectNetwork,
  deployContractV2,
  green,
  sendTransaction,
  loadContractInfo,
} from "./helper";
import { isAddress } from "ethers";

const main = async () => {
  const network = await selectNetwork();
  let { override } = network;

  const impl_answer = await select({
    message: `Token Impl 合约:`,
    choices: [
      {
        name: "部署合约",
        value: "deployImpl",
      },
      {
        name: "输入地址",
        value: "inputImpl",
      },
    ],
  });
  let implAddress = "";

  if (impl_answer == "deployImpl") {
    const implementation = await deployContractV2(
      ethers,
      network,
      "ERC20MintablePauseableUpgradeable",
      [],
      override
    );
    implAddress = await implementation.getAddress();
  } else {
    const defaultValue = loadContractInfo(
      network.name,
      "ERC20MintablePauseableUpgradeable"
    );
    implAddress = await input({
      message: "输入Token Impl地址:",
      validate: (value = "") => isAddress(value) || "Pass a valid value",
      default: defaultValue.address || "",
    });
  }

  const pa = await input({
    message: "输入Proxy Admin地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid value",
  });

  const proxy_answer = await select({
    message: `选择Token 的${green("Proxy")}合约:`,
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
      validate: (value = "") => isAddress(value) || "Pass a valid value",
    });
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
      [implAddress, pa, data],
      override,
      `${symbol}-proxy`
    );
  } else if (proxy_answer == "update") {
    const proxyAddress = await input({
      message: "输入Proxy地址:",
      validate: (value = "") => isAddress(value) || "Pass a valid value",
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
      [proxyAddress, implAddress],
      override
    );
  }
};

main();
