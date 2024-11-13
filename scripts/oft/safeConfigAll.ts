import { input, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  MINTER_ROLE,
  green,
  yellow,
  blue,
  red,
  loadTokenMapping,
  saveTokenMapping,
  selectProxyOFT,
} from "../helper";
import { isAddress } from "ethers";
import { SafeHelper } from "../safeHelper";

async function checkRole(
  safeHelper: SafeHelper,
  proxyAddress: string,
  tokenAddress: string
) {
  const { signer, netConfig } = safeHelper;
  console.log(
    `查询网络 ${blue(netConfig.name)} 上ProxyOFT: ${proxyAddress} 是否拥有 Token: ${tokenAddress} 的MINTER权限:`
  );
  const tokenContract = await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenAddress,
    signer
  );

  const hasRoleA = await tokenContract.hasRole(MINTER_ROLE, proxyAddress);

  if (hasRoleA) {
    console.log(`  是 MINTER_ROLE ✅`);
  } else {
    const grantRole = await confirm({
      message: `不是 MINTER_ROLE ❌, 是否配置?`,
    });
    if (grantRole) {
      await safeHelper.appendSafeTxForCall(
        tokenContract,
        "grantRole(bytes32,address)",
        [MINTER_ROLE, proxyAddress]
      );
    }
  }
}

async function laneExist(
  safeHelper: SafeHelper,
  proxyAddr: string,
  srcChainId: string,
  srcToken: string,
  dstToken: string
) {
  const { signer, netConfig } = safeHelper;
  console.log(
    `查询网络 ${blue(netConfig.name)} 的ProxyOFT: ${proxyAddr} 的tokenMapping:`
  );
  const proxyOFT = await ethers.getContractAt("ProxyOFT", proxyAddr, signer);
  const tokenMapping = loadTokenMapping(netConfig, proxyAddr);
  if (!tokenMapping[srcChainId]) {
    tokenMapping[srcChainId] = {};
  }

  const laneExist = await proxyOFT.laneExist(srcChainId, srcToken);
  if (laneExist) {
    console.log(
      `  ${green("存在")} (srcEid: ${green(srcChainId)}, srcToken: ${yellow(srcToken)}) 链路 ✅`
    );
    const LaneDetail = await proxyOFT.tokenMapping(srcChainId, srcToken);
    tokenMapping[srcChainId][srcToken] = LaneDetail.dstToken;
    if (dstToken.toLowerCase() != LaneDetail.dstToken.toLowerCase()) {
      const update = await confirm({
        message: `合约记录的dstToken: ${yellow(LaneDetail.dstToken)} 与输入的Token: ${yellow(dstToken)} 不一致，是否配置?`,
      });
      if (update) {
        await safeHelper.appendSafeTxForCall(
          proxyOFT,
          "updateTokenMapping(uint16,address,address)",
          [srcChainId, srcToken, dstToken]
        );
        tokenMapping[srcChainId][srcToken] = dstToken;
      }
    }
    saveTokenMapping(netConfig.name, netConfig, proxyAddr, tokenMapping);
  } else {
    const add = await confirm({
      message: `${red("不存在")} (srcEid: ${green(srcChainId)}, srcToken: ${yellow(srcToken)}) 链路 ❌，是否配置?`,
    });
    if (add) {
      await safeHelper.appendSafeTxForCall(
        proxyOFT,
        "addTokenMapping(uint16,address,address)",
        [srcChainId, srcToken, dstToken]
      );
      tokenMapping[srcChainId][srcToken] = dstToken;
      saveTokenMapping(netConfig.name, netConfig, proxyAddr, tokenMapping);
    }
  }
}

async function setTrustRemote(
  safeHelper: SafeHelper,
  proxyAddr: string,
  srcEndpointId: string,
  srcProxyAddr: string
) {
  const proxyContract = await ethers.getContractAt(
    "ProxyOFT",
    proxyAddr,
    safeHelper.signer
  );

  console.log(
    `检查 ${green(safeHelper.netConfig.name)} 上TrustRemote设置 (srcEid: ${srcEndpointId} -> ProxyOFT: ${srcProxyAddr}))`
  );
  let trustedRemoteLookup =
    await proxyContract.trustedRemoteLookup(srcEndpointId);

  if (trustedRemoteLookup == "0x") {
    const yes = await confirm({
      message: `未设置 srcEid: ${srcEndpointId} 对应的 TrustedRemote，是否配置指向 ${yellow(srcProxyAddr)}？`,
      default: true,
    });
    if (yes) {
      await safeHelper.appendSafeTxForCall(
        proxyContract,
        "setTrustedRemoteAddress(uint16,bytes)",
        [srcEndpointId, srcProxyAddr]
      );
    }
  } else {
    let trustedRemoteAddress =
      await proxyContract.getTrustedRemoteAddress(srcEndpointId);
    if (trustedRemoteAddress.toLowerCase() != srcProxyAddr.toLowerCase()) {
      const yes = await confirm({
        message: `合约上 srcEid: ${srcEndpointId} 对应的TrustRemote: ${yellow(trustedRemoteAddress)} 与输入 ${yellow(srcProxyAddr)} 不一致，是否更新合约配置？`,
        default: true,
      });
      if (yes) {
        await safeHelper.appendSafeTxForCall(
          proxyContract,
          "setTrustedRemoteAddress(uint16,bytes)",
          [srcEndpointId, srcProxyAddr]
        );
        await safeHelper.proposeSafeTx();
      }
    } else {
      console.log("  本地与合约配置一致 ✅");
    }
  }
}

const main = async () => {
  // 环境
  const safeHelperA = new SafeHelper();
  await safeHelperA.init(ethers);
  const resA = await selectProxyOFT(safeHelperA.netConfig);
  const proxyA = resA.address;

  const safeHelperB = new SafeHelper();
  await safeHelperB.init(ethers);
  const resB = await selectProxyOFT(safeHelperB.netConfig);
  const proxyB = resB.address;

  await setTrustRemote(
    safeHelperA,
    proxyA,
    safeHelperB.netConfig.lzEndpointId,
    proxyB
  );
  await setTrustRemote(
    safeHelperB,
    proxyB,
    safeHelperA.netConfig.lzEndpointId,
    proxyA
  );

  if (safeHelperA.netConfig.name == safeHelperB.netConfig.name) {
    throw new Error(red("网络A和网络B不能相同!"));
  }

  for (;;) {
    const tokenA = await input({
      message: `输入网络 ${blue(safeHelperA.netConfig.name)} 上Token A地址:`,
      validate: (value = "") =>
        isAddress(value) || "Pass a valid address value",
    });

    const tokenB = await input({
      message: `输入网络 ${blue(safeHelperB.netConfig.name)} 上Token B地址:`,
      default: tokenA,
      validate: (value = "") =>
        isAddress(value) || "Pass a valid address value",
    });

    if (resA.version == "v1") {
      await checkRole(safeHelperA, proxyA, tokenA);
    }

    if (resB.version == "v1") {
      await checkRole(safeHelperB, proxyB, tokenB);
    }

    await laneExist(
      safeHelperA,
      proxyA,
      safeHelperB.netConfig.lzEndpointId,
      tokenB,
      tokenA
    );

    await laneExist(
      safeHelperB,
      proxyB,
      safeHelperA.netConfig.lzEndpointId,
      tokenA,
      tokenB
    );

    const more = await confirm({
      message: "是否需要继续添加 tokenMapping ?",
      default: false,
    });
    if (!more) {
      break;
    }
  }

  await safeHelperA.proposeSafeTx();

  await safeHelperB.proposeSafeTx();
};

main();
