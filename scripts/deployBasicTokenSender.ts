import { input, select, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { setNetwork, deployContractV2 } from "./helper";
import { isAddress } from "ethers";

const main = async () => {
  const network = await setNetwork();
  let { override, networkIndex, netConfig, config, configPath } = network;

  // Implementation
  const isDeployImpl = await confirm({
    message: "部署BasicTokenSender合约?",
  });
  if (!isDeployImpl) {
    return;
  }

  const routerAddr = await input({
    message: "输入Router合约地址",
    default: netConfig.router,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const impl = await deployContractV2(
    ethers,
    network,
    "BasicTokenSender",
    [routerAddr],
    override
  );

  const addr = await impl.getAddress();
  config[networkIndex].BasicTokenSender = addr;
  writeFileSync(configPath, JSON.stringify(config, null, 2));
};

main();
