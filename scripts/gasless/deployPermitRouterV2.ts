import { input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { selectNetwork, deployContractV2, loadNetConfig } from "../helper";
import { isAddress } from "ethers";

const main = async () => {
  const network = await selectNetwork();
  let { override, netConfig } = network;

  const fee = await input({
    message: "输入fee(单位:10000 代表 100%):",
    default: "300",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  // const wmtr = await input({
  //   message: "输入WMTR地址:",
  //   default: netConfig.WMTR,
  //   validate: (value = "") => isAddress(value) || "Pass a valid address value",
  // });

  await deployContractV2(ethers, network, "PermitRouterV2", [fee], override);
};

main();
