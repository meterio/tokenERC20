import { input, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  MINTER_ROLE,
  Network,
  green,
  yellow,
  red,
  loadTokenMapping,
  selectProxyOFTByNetworkName,
  loadNetConfig,
  saveNetConfig,
} from "../helper";
import { isAddress } from "ethers";
import { SafeHelper } from "../safeHelper";

async function checkRole(
  safeHelper: SafeHelper,
  proxyAddress: string,
  tokenAddress: string
) {
  const netName = safeHelper.netConfig.name;
  console.log(`查询网络${green(netName)}的Token权限设置:`);
  const tokenContract = await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenAddress,
    safeHelper.signer
  );

  const hasRoleA = await tokenContract.hasRole(MINTER_ROLE, proxyAddress);

  if (hasRoleA) {
    console.log(
      `网络${green(netName)}:\n ProxyOFT合约:${yellow(
        proxyAddress
      )}\n 拥有Token ${yellow(tokenAddress)}的MINTER_ROLE✅`
    );
  } else {
    console.log(
      `网络${green(netName)}:\n ProxyOFT合约:${yellow(
        proxyAddress
      )}\n 不拥有Token ${yellow(tokenAddress)}的MINTER_ROLE❌`
    );
    const grantRole = await confirm({
      message: `是否配置?`,
    });
    if (grantRole) {
      await safeHelper.appendSafeTxForCall(tokenContract, "grantRole", [
        MINTER_ROLE,
        proxyAddress,
      ]);
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
  const netName = safeHelper.netConfig.name;
  console.log(`查询网络${green(netName)}的ProxyOFT设置:`);
  const proxyOFT = await ethers.getContractAt(
    "ProxyOFT",
    proxyAddr,
    safeHelper.signer
  );
  const netConfig = loadNetConfig(netName);
  const tokenMapping = loadTokenMapping({ netConfig } as Network, proxyAddr);
  if (!tokenMapping[srcChainId]) {
    tokenMapping[srcChainId] = {};
  }

  console.log(proxyAddr, srcChainId, srcToken);
  const laneExist = await proxyOFT.laneExist(srcChainId, srcToken);
  if (laneExist) {
    console.log(
      `网络${green(netName)}:\n ProxyOFT合约:${yellow(proxyAddr)}\n ` +
        red("存在") +
        `srcChainId${green(srcChainId)}的srcToken: ${yellow(srcToken)}的链路✅`
    );
    const LaneDetail = await proxyOFT.tokenMapping(srcChainId, srcToken);
    console.log(`dstToken地址:${yellow(LaneDetail.dstToken)}`);
    tokenMapping[srcChainId][srcToken] = LaneDetail.dstToken;
    if (dstToken.toLowerCase() != LaneDetail.dstToken.toLowerCase()) {
      console.log(
        `网络${green(
          netName
        )}合约记录的dstToken地址:${yellow(LaneDetail.dstToken)}与输入的Token地址${yellow(dstToken)}不一致!`
      );
      const update = await confirm({
        message: `是否配置?`,
      });
      if (update) {
        await safeHelper.appendSafeTxForCall(proxyOFT, "updateTokenMapping", [
          srcChainId,
          srcToken,
          dstToken,
        ]);
        tokenMapping[srcChainId][srcToken] = dstToken;
        await safeHelper.proposeSafeTx();
      }
    }
    if (!netConfig.tokenMapping) {
      netConfig.tokenMapping = {};
    }
    netConfig.tokenMapping[proxyAddr] = tokenMapping;
    saveNetConfig(netName, netConfig);
  } else {
    console.log(
      `网络${green(netName)}:\n ProxyOFT合约:${yellow(proxyAddr)}\n ` +
        red("不存在") +
        `srcChainId${green(srcChainId)}的srcToken: ${yellow(srcToken)}的链路❌`
    );
    const add = await confirm({
      message: `是否配置?`,
    });
    if (add) {
      await safeHelper.appendSafeTxForCall(proxyOFT, "addTokenMapping", [
        srcChainId,
        srcToken,
        dstToken,
      ]);
      await safeHelper.proposeSafeTx();

      if (!netConfig.tokenMapping) {
        netConfig.tokenMapping = {};
      }
      netConfig.tokenMapping[proxyAddr] = tokenMapping;
      saveNetConfig(netName, netConfig);
    }
  }
}

const main = async () => {
  // 环境
  const safeHelperA = new SafeHelper();
  await safeHelperA.init(ethers);

  const resA = await selectProxyOFTByNetworkName(safeHelperA.netConfig.name);
  const proxyA = resA.address;

  const tokenA = await input({
    message: `输入网络${green("A")}上Token地址:`,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const safeHelperB = new SafeHelper();
  await safeHelperB.init(ethers);

  const resB = await selectProxyOFTByNetworkName(safeHelperB.netConfig.name);
  const proxyB = resB.address;
  const tokenB = await input({
    message: `输入网络${green("B")}上Token地址:`,
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
