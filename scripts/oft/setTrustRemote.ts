import { confirm, input, select } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  selectNetwork,
  sendTransaction,
  green,
  yellow,
  red,
  DEFAULT_ADMIN_ROLE,
  loadDeployedAddresses,
  selectProxyOFT,
} from "../helper";
import { isAddress } from "ethers";

const main = async () => {
  const network = await selectNetwork();
  const { netConfig, wallet, override } = network;

  const proxy = await selectProxyOFT(network);

  const proxyAddr = proxy.address;
  const proxyContract = await ethers.getContractAt(
    "ProxyOFT",
    proxyAddr,
    wallet
  );
  const remoteEndpointId = await input({
    message: "输入LayerZero Remote Endpoint Id:",
    validate: (value = "") =>
      parseInt(value) > 0 || "Pass a valid lzEndpointId value",
  });
  const remoteAddress = await input({
    message: "输入LayerZero Remote地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  console.log(
    `当前链: ${green(netConfig.name)} (lzEndpointId: ${green(netConfig.lzEndpointId)})`
  );
  let trustedRemoteLookup =
    await proxyContract.trustedRemoteLookup(remoteEndpointId);

  if (trustedRemoteLookup == "0x") {
    await sendTransaction(
      network,
      proxyContract,
      "setTrustedRemoteAddress(uint16,bytes)",
      [remoteEndpointId, remoteAddress],
      override,
      DEFAULT_ADMIN_ROLE
    );
  } else {
    let trustedRemoteAddress =
      await proxyContract.getTrustedRemoteAddress(remoteEndpointId);
    console.log("Trust remote address", yellow(trustedRemoteAddress));
    if (trustedRemoteAddress.toLowerCase() != remoteAddress.toLowerCase()) {
      const needUpdate = await confirm({
        message: `合约上读取的TrustRemote地址(${red(trustedRemoteAddress)})与输入(${yellow(remoteAddress)})不一致，是否更新合约配置？`,
        default: false,
      });
      if (needUpdate) {
        await sendTransaction(
          network,
          proxyContract,
          "setTrustedRemoteAddress(uint16,bytes)",
          [remoteEndpointId, remoteAddress],
          override,
          DEFAULT_ADMIN_ROLE
        );
      }
    }
  }
};

main();
