import { ethers } from "hardhat";
import { selectNetwork, selectProxyOFT } from "../helper";
import { SafeHelper } from "../safeHelper";
import { AbiCoder } from "ethers";
import { select, input } from "@inquirer/prompts";

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
  const safeHelperA = new SafeHelper();
  await safeHelperA.init(ethers);
  const resA = await selectProxyOFT(safeHelperA.netConfig);
  const proxyA = resA.address;

  const proxyOFT = await ethers.getContractAt(
    "ProxyOFT",
    proxyA,
    safeHelperA.signer
  );

  const configType = await select({
    message: "选择 ConfigType:",
    choices: [
      { name: "CONFIG_TYPE_INBOUND_PROOF_LIBRARY_VERSION", value: 1 },
      { name: "CONFIG_TYPE_INBOUND_BLOCK_CONFIRMATIONS", value: 2 },
      { name: "CONFIG_TYPE_RELAYER", value: 3 },
      { name: "CONFIG_TYPE_OUTBOUND_PROOF_TYPE", value: 4 },
      { name: "CONFIG_TYPE_OUTBOUND_BLOCK_CONFIRMATIONS", value: 5 },
      { name: "CONFIG_TYPE_ORACLE", value: 6 },
    ],
  });

  const remoteNetwork = await selectNetwork("Remote");

  const configValue = await input({
    message: "输入config value (int):",
    default: "",
  });

  const configValueHex = parseInt(configValue).toString(16);
  console.log("len: ", configValueHex.length);
  console.log("pad:", 64 - configValueHex.length);
  let hex = "0x" + configValueHex.padStart(64, "0");
  console.log(hex.length);

  const setConfigParams = [
    1,
    parseInt(remoteNetwork.netConfig.lzEndpointId),
    configType,
    hex,
  ];
  console.log(`setConfig with `, setConfigParams);
  await safeHelperA.appendSafeTxForCall(proxyOFT, "setConfig", setConfigParams);
  await safeHelperA.proposeSafeTx();
};

main();
