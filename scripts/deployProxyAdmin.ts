import { ethers } from "hardhat";
import { writeFileSync } from "fs";

import { setNetwork, deployContractV2 } from "./helper";

const main = async () => {
  const network = await setNetwork();
  let { override, netConfig, updateNetConfig } = network;

  const proxyAdmin = await deployContractV2(
    ethers,
    network,
    "SumerProxyAdmin",
    [],
    override
  );

  netConfig.proxyAdmin = proxyAdmin.address;
  updateNetConfig(netConfig);
};

main();
