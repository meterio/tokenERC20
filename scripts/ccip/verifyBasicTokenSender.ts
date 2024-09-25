import { input, confirm } from "@inquirer/prompts";
import { selectNetwork } from "../helper";
import { isAddress } from "ethers";
// const hre = require("hardhat");
import * as hre from "hardhat";

const main = async () => {
  const network = await selectNetwork();
  let { netConfig } = network;

  // Implementation
  const isDeployImpl = await confirm({
    message: "开源BasicTokenSender合约?",
  });
  if (!isDeployImpl) {
    return;
  }

  const routerAddr = await input({
    message: "输入Router合约地址",
    default: netConfig.router,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const contractAddr = await input({
    message: "输入需开源合约地址",
    default: "0x",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  await hre.run("verify:verify", {
    address: contractAddr,
    contract: `contracts/ccip/BasicTokenSender.sol:BasicTokenSender`,
    constructorArguments: [routerAddr],
  });
};

main();
