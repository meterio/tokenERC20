import { ethers } from "hardhat";

import { selectNetwork, deployContractV2 } from "../helper";

const main = async () => {
  const network = await selectNetwork();
  let { override, netConfig, updateNetConfig } = network;

  const proxyAdmin = await deployContractV2(
    ethers,
    network,
    "ProxyAdmin",
    [],
    override
  );

  netConfig.proxyAdmin = proxyAdmin.address;
  updateNetConfig(netConfig);
};

main();
