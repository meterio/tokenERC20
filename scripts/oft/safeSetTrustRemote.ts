import { confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { selectNetwork, green, yellow, selectProxyOFT } from "../helper";
import { SafeHelper } from "../safeHelper";

const main = async () => {
  const safeHelper = new SafeHelper();
  await safeHelper.init(ethers);

  const proxy = await selectProxyOFT(safeHelper.netConfig);

  const proxyAddr = proxy.address;
  const proxyContract = await ethers.getContractAt(
    "ProxyOFT",
    proxyAddr,
    safeHelper.signer
  );

  const remoteNetwork = await selectNetwork("Remote");
  const remoteEndpointId = remoteNetwork.netConfig.lzEndpointId;
  const remoteProxyOFTInfo = await selectProxyOFT(remoteNetwork.netConfig);
  const remoteProxyOFTAddress = remoteProxyOFTInfo.address;

  console.log(
    `检查当前链: ${green(safeHelper.netConfig.name)} 上TrustRemote设置 (dstEid: ${remoteEndpointId} -> ProxyOFT: ${remoteProxyOFTAddress}))`
  );
  let trustedRemoteLookup =
    await proxyContract.trustedRemoteLookup(remoteEndpointId);

  if (trustedRemoteLookup == "0x") {
    const needConfig = await confirm({
      message: `未设置 dstEid: ${remoteEndpointId} 对应的 TrustedRemote，是否配置指向 ${yellow(remoteProxyOFTAddress)}？`,
      default: true,
    });
    if (needConfig) {
      await safeHelper.appendSafeTxForCall(
        proxyContract,
        "setTrustedRemoteAddress(uint16,bytes)",
        [remoteEndpointId, remoteProxyOFTAddress]
      );
      await safeHelper.proposeSafeTx();
    }
  } else {
    let trustedRemoteAddress =
      await proxyContract.getTrustedRemoteAddress(remoteEndpointId);
    if (
      trustedRemoteAddress.toLowerCase() != remoteProxyOFTAddress.toLowerCase()
    ) {
      const needUpdate = await confirm({
        message: `合约配置的TrustRemote: ${yellow(trustedRemoteAddress)} 与输入 ${yellow(remoteProxyOFTAddress)} 不一致，是否更新合约配置？`,
        default: true,
      });
      if (needUpdate) {
        await safeHelper.appendSafeTxForCall(
          proxyContract,
          "setTrustedRemoteAddress(uint16,bytes)",
          [remoteEndpointId, remoteProxyOFTAddress]
        );
        await safeHelper.proposeSafeTx();
      }
    } else {
      console.log("  本地与合约配置一致 ✅");
    }
  }
};

main();
