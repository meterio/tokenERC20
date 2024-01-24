import { ethers } from "hardhat";
import { writeFileSync } from "fs";

import { setNetwork, deployContractV2 } from "./helper";

const main = async () => {
  const network = await setNetwork();
  let { config, override, networkIndex, configPath } = network;

  const proxyAdmin = await deployContractV2(
    ethers,
    network,
    "SumerProxyAdmin",
    [],
    override
  );

  config[networkIndex].proxyAdmin = proxyAdmin.address;
  writeFileSync(configPath, JSON.stringify(config, null, 2));
};

main();
