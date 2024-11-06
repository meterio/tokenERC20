import { confirm, input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { green, yellow, red, selectProxyOFTByNetworkName } from "../helper";
import { isAddress } from "ethers";
import { SafeHelper } from "../safeHelper";

const main = async () => {
  const safeHelper = new SafeHelper();
  await safeHelper.init(ethers);

  const proxy = await selectProxyOFTByNetworkName(safeHelper.netConfig.name);

  const proxyAddr = proxy.address;
  const proxyContract = await ethers.getContractAt(
    "ProxyOFT",
    proxyAddr,
    safeHelper.signer
  );
  const remoteEndpointId = await input({
    message: "输入LayerZero Remote Endpoint Id:",
    validate: (value = "") =>
      parseInt(value) > 0 || "Pass a valid lzEndpointId value",
  });
  const remoteAddress = await input({
    message: "输入LayerZero Remote ProxyOFT地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  console.log(
    `当前链: ${green(safeHelper.netConfig.name)} (lzEndpointId: ${green(safeHelper.netConfig.lzEndpointId)})`
  );
  let trustedRemoteLookup =
    await proxyContract.trustedRemoteLookup(remoteEndpointId);

  if (trustedRemoteLookup == "0x") {
    await safeHelper.appendSafeTxForCall(
      proxyContract,
      "setTrustedRemoteAddress",
      [remoteEndpointId, remoteAddress]
    );
  } else {
    let trustedRemoteAddress =
      await proxyContract.getTrustedRemoteAddress(remoteEndpointId);
    if (trustedRemoteAddress.toLowerCase() != remoteAddress.toLowerCase()) {
      const needUpdate = await confirm({
        message: `合约上读取的TrustRemote地址(${red(trustedRemoteAddress)})与输入(${yellow(remoteAddress)})不一致，是否更新合约配置？`,
        default: false,
      });
      if (needUpdate) {
        await safeHelper.appendSafeTxForCall(
          proxyContract,
          "setTrustedRemoteAddress",
          [remoteEndpointId, remoteAddress]
        );
      }
    } else {
      console.log(
        "TrustRemote地址与合约配置一致",
        yellow(trustedRemoteAddress)
      );
    }
  }
  await safeHelper.proposeSafeTx();
};

main();
