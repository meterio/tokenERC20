import { ethers } from "hardhat";
import { writeFileSync } from "fs";

import { json, config, setNetwork, deployContractV2 } from "./helper";

const main = async () => {
  const network = await setNetwork(config);
  let { override, networkIndex } = network;

  const proxyAdmin = await deployContractV2(
    ethers,
    network,
    "SumerProxyAdmin",
    [],
    override
  );

  config[networkIndex].proxyAdmin = proxyAdmin.address;
  writeFileSync(json, JSON.stringify(config));
};

main();
