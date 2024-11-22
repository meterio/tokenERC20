import { input, confirm, select } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  MINTER_ROLE,
  selectNetwork,
  Network,
  sendTransaction,
  green,
  yellow,
  blue,
  red,
  DEFAULT_ADMIN_ROLE,
  loadTokenMapping,
  saveTokenMapping,
  selectProxyOFT,
} from "../helper";
import { isAddress } from "ethers";

async function checkRole(
  network: Network,
  proxyAddress: string,
  tokenAddress: string
) {
  console.log(
    `查询网络 ${blue(network.name)} 上ProxyOFT: ${proxyAddress} 是否拥有 Token: ${tokenAddress} 的MINTER权限:`
  );
  const tokenContract = await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenAddress,
    network.wallet
  );

  const hasRoleA = await tokenContract.hasRole(MINTER_ROLE, proxyAddress);

  if (hasRoleA) {
    console.log(`  是 MINTER_ROLE ✅`);
  } else {
    const grantRole = await confirm({
      message: `不是 MINTER_ROLE ❌, 是否配置?`,
    });
    if (grantRole) {
      await sendTransaction(
        network,
        tokenContract,
        "grantRole(bytes32,address)",
        [MINTER_ROLE, proxyAddress],
        network.override,
        DEFAULT_ADMIN_ROLE
      );
    }
  }
}

async function laneExist(
  network: Network,
  proxyAddr: string,
  srcChainId: string,
  srcToken: string,
  dstToken: string
) {
  console.log(
    `查询网络 ${blue(network.name)} 的ProxyOFT: ${proxyAddr} 的tokenMapping:`
  );
  const proxyOFT = await ethers.getContractAt(
    "ProxyOFT",
    proxyAddr,
    network.wallet
  );
  const tokenMapping = loadTokenMapping(network.netConfig, proxyAddr);
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
        await sendTransaction(
          network,
          proxyOFT,
          "updateTokenMapping(uint16,address,address)",
          [srcChainId, srcToken, dstToken],
          network.override,
          DEFAULT_ADMIN_ROLE
        );
        tokenMapping[srcChainId][srcToken] = dstToken;
      }
    }
    saveTokenMapping(
      network.netConfig.name,
      network.netConfig,
      proxyAddr,
      tokenMapping
    );
  } else {
    const add = await confirm({
      message: `${red("不存在")} (srcEid: ${green(srcChainId)}, srcToken: ${yellow(srcToken)}) 链路 ❌，是否配置?`,
    });
    if (add) {
      await sendTransaction(
        network,
        proxyOFT,
        "addTokenMapping(uint16,address,address)",
        [srcChainId, srcToken, dstToken],
        network.override,
        DEFAULT_ADMIN_ROLE
      );
      tokenMapping[srcChainId][srcToken] = dstToken;
      saveTokenMapping(
        network.netConfig.name,
        network.netConfig,
        proxyAddr,
        tokenMapping
      );
    }
  }
}

const main = async () => {
  // 环境
  const networkA = await selectNetwork("A");

  const resA = await selectProxyOFT(networkA.netConfig);
  const proxyA = resA.address;

  const tokenA = await input({
    message: `输入网络 ${blue(networkA.name)} 上Token地址:`,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const networkB = await selectNetwork("B");
  console.log(await networkB.wallet.getAddress());
  const resB = await selectProxyOFT(networkB.netConfig);
  const proxyB = resB.address;
  const tokenB = await input({
    message: `输入网络 ${blue(networkB.name)} 上Token地址:`,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  if (networkA.name == networkB.name) {
    throw new Error(red("网络A和网络B不能相同!"));
  }

  if (resA.version == "v1") {
    await checkRole(networkA, proxyA, tokenA);
  }

  if (resB.version == "v1") {
    await checkRole(networkB, proxyB, tokenB);
  }

  await laneExist(
    networkA,
    proxyA,
    networkB.netConfig.lzEndpointId,
    tokenB,
    tokenA
  );

  await laneExist(
    networkB,
    proxyB,
    networkA.netConfig.lzEndpointId,
    tokenA,
    tokenB
  );
};

main();
