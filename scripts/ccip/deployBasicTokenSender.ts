import { input, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { selectNetwork, deployContractV2 } from "./helper";
import { isAddress } from "ethers";

const main = async (i: any) => {
  const network = await selectNetwork();
  let { override, netConfig, updateNetConfig } = network;

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
  netConfig.BasicTokenSender = addr;
  updateNetConfig(netConfig);
};

main(hre);
