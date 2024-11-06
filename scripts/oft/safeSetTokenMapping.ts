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
      await safeHelper.proposeSafeTx();
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
        await safeHelper.proposeSafeTx();
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
      await safeHelper.proposeSafeTx();
      saveTokenMapping(netConfig.name, netConfig, proxyAddr, tokenMapping);
    }
  }
}

const main = async () => {
  // 环境
  const safeHelperA = new SafeHelper();
  await safeHelperA.init(ethers);
  const resA = await selectProxyOFT(safeHelperA.netConfig);
  const proxyA = resA.address;

  const tokenA = await input({
    message: `输入网络 ${blue(safeHelperA.netConfig.name)} 上Token地址:`,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const safeHelperB = new SafeHelper();
  await safeHelperB.init(ethers);
  const resB = await selectProxyOFT(safeHelperB.netConfig);
  const proxyB = resB.address;
  const tokenB = await input({
    message: `输入网络 ${blue(safeHelperB.netConfig.name)} 上Token地址:`,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  if (safeHelperA.netConfig.name == safeHelperB.netConfig.name) {
    throw new Error(red("网络A和网络B不能相同!"));
  }

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
};

main();
