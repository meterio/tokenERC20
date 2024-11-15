import { ethers } from "hardhat";
import { selectNetwork, selectProxyOFT } from "../helper";
import { SafeHelper } from "../safeHelper";
import { AbiCoder } from "ethers";
import { select, input } from "@inquirer/prompts";
import { proxyOftSol } from "../../typechain-types/contracts/oft";

const main = async () => {
  // const coder = new AbiCoder();
  // const decoded = coder.decode(
  //   ["uint16", "uint16", "uint16", "bytes"],
  //   "0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000010680000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000064"
  // );
  // console.log(decoded);
  // const d = coder.decode(["uint64"], decoded[3]);
  // console.log(d);

  // 环境
  const network = await selectNetwork();
  const resA = await selectProxyOFT(network.netConfig);
  const proxyA = resA.address;

  const proxyOFT = await ethers.getContractAt(
    "ProxyOFT",
    proxyA,
    network.wallet
  );

  const endpointAddr = await proxyOFT.lzEndpoint();
  const endpoint = await ethers.getContractAt(
    "ILayerZeroEndpointUpgradeable",
    endpointAddr,
    network.wallet
  );

  const typesMap = {
    1: "CONFIG_TYPE_INBOUND_PROOF_LIBRARY_VERSION",
    2: "CONFIG_TYPE_INBOUND_BLOCK_CONFIRMATIONS",
    3: "CONFIG_TYPE_RELAYER",
    4: "CONFIG_TYPE_OUTBOUND_PROOF_TYPE",
    5: "CONFIG_TYPE_OUTBOUND_BLOCK_CONFIRMATIONS",
    6: "CONFIG_TYPE_ORACLE",
  };

  for (let configType = 1; configType <= 6; configType++) {
    const config = await endpoint.getConfig(
      1,
      network.netConfig.lzEndpointId,
      proxyA,
      configType
    );
    console.log(
      `config: ${typesMap[configType as keyof typeof typesMap]}  value: ${config}`
    );
  }
};

main();
