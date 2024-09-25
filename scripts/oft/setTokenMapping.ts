import { input, confirm, select } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  MINTER_ROLE,
  selectNetwork,
  Network,
  sendTransaction,
  green,
  yellow,
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
  console.log(`查询网络${green(network.name)}的Token权限设置:`);
  const tokenContract = await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenAddress,
    network.wallet
  );

  const hasRoleA = await tokenContract.hasRole(MINTER_ROLE, proxyAddress);

  if (hasRoleA) {
    console.log(
      `网络${green(network.name)}:\n ProxyOFT合约:${yellow(
        proxyAddress
      )}\n 拥有Token ${yellow(tokenAddress)}的MINTER_ROLE✅`
    );
  } else {
    console.log(
      `网络${green(network.name)}:\n ProxyOFT合约:${yellow(
        proxyAddress
      )}\n 不拥有Token ${yellow(tokenAddress)}的MINTER_ROLE❌`
    );
    const grantRole = await confirm({
      message: `是否配置?`,
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
  console.log(`查询网络${green(network.name)}的ProxyOFT设置:`);
  const proxyOFT = await ethers.getContractAt(
    "ProxyOFT",
    proxyAddr,
    network.wallet
  );
  const tokenMapping = loadTokenMapping(network, proxyAddr);
  if (!tokenMapping[srcChainId]) {
    tokenMapping[srcChainId] = {};
  }

  console.log(proxyAddr, network.wallet.address, srcChainId, srcToken);
  const laneExist = await proxyOFT.laneExist(srcChainId, srcToken);
  if (laneExist) {
    console.log(
      `网络${green(network.name)}:\n ProxyOFT合约:${yellow(proxyAddr)}\n ` +
        red("存在") +
        `srcChainId${green(srcChainId)}的srcToken: ${yellow(srcToken)}的链路✅`
    );
    const LaneDetail = await proxyOFT.tokenMapping(srcChainId, srcToken);
    console.log(`dstToken地址:${yellow(LaneDetail.dstToken)}`);
    tokenMapping[srcChainId][srcToken] = LaneDetail.dstToken;
    if (dstToken.toLowerCase() != LaneDetail.dstToken.toLowerCase()) {
      console.log(
        `网络${green(
          network.name
        )}合约记录的dstToken地址:${yellow(LaneDetail.dstToken)}与输入的Token地址${yellow(dstToken)}不一致!`
      );
      const update = await confirm({
        message: `是否配置?`,
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
    saveTokenMapping(network, proxyAddr, tokenMapping);
  } else {
    console.log(
      `网络${green(network.name)}:\n ProxyOFT合约:${yellow(proxyAddr)}\n ` +
        red("不存在") +
        `srcChainId${green(srcChainId)}的srcToken: ${yellow(srcToken)}的链路❌`
    );
    const add = await confirm({
      message: `是否配置?`,
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
      saveTokenMapping(network, proxyAddr, tokenMapping);
    }
  }
}

const main = async () => {
  // 环境
  const networkA = await selectNetwork("A");

  const resA = await selectProxyOFT(networkA);
  const proxyA = resA.address;

  const tokenA = await input({
    message: `选择网络${green("A")}上Token地址:`,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const networkB = await selectNetwork("B");

  const resB = await selectProxyOFT(networkB);
  const proxyB = resB.address;
  const tokenB = await input({
    message: `选择网络${green("B")}上Token地址:`,
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
