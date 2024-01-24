import { input, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import {
  json,
  config,
  MINTER_ROLE,
  setNetwork,
  Network,
  sendTransaction,
  green,
  yellow,
  red,
  DEFAULT_ADMIN_ROLE,
} from "./helper";
import { isAddress } from "ethers";

async function checkRole(network: Network, tokenAddress: string) {
  console.log(`查询网络${green(network.name)}的Token权限设置:`);
  const tokenContract = await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenAddress,
    network.wallet
  );

  const hasRoleA = await tokenContract.hasRole(
    MINTER_ROLE,
    network.netConfig.proxy
  );

  if (hasRoleA) {
    console.log(
      `网络${green(network.name)}:\n ProxyOFT合约:${yellow(
        network.netConfig.proxy
      )}\n 拥有Token${green(network.name)}合约${yellow(
        tokenAddress
      )}的MINTER_ROLE✅`
    );
  } else {
    console.log(
      `网络${green(network.name)}:\n ProxyOFT合约:${yellow(
        network.netConfig.proxy
      )}\n 不拥有Token${green(network.name)}合约${yellow(
        tokenAddress
      )}的MINTER_ROLE❌`
    );
    const grantRole = await confirm({
      message: `是否配置?`,
    });
    if (grantRole) {
      await sendTransaction(
        network,
        tokenContract,
        "grantRole(bytes32,address)",
        [MINTER_ROLE, network.netConfig.proxy],
        network.override,
        DEFAULT_ADMIN_ROLE
      );
    }
  }
}

async function laneExist(
  network: Network,
  srcChainId: string,
  srcToken: string,
  dstToken: string
) {
  console.log(`查询网络${green(network.name)}的OFT设置:`);
  const proxyOFT = await ethers.getContractAt(
    "ProxyOFT",
    network.netConfig.proxy,
    network.wallet
  );
  if (!config[network.networkIndex].tokenMapping) {
    config[network.networkIndex].tokenMapping = {};
    writeFileSync(json, JSON.stringify(config, null, 2));
  }
  if (!config[network.networkIndex].tokenMapping[srcChainId]) {
    config[network.networkIndex].tokenMapping[srcChainId] = {};
    writeFileSync(json, JSON.stringify(config, null, 2));
  }

  const laneExist = await proxyOFT.laneExist(srcChainId, srcToken);
  if (laneExist) {
    console.log(
      `网络${green(network.name)}:\n ProxyOFT合约:${yellow(
        network.netConfig.proxy
      )}\n ` +
        red("存在") +
        `srcChainId${green(srcChainId)}的srcToken: ${yellow(srcToken)}的链路✅`
    );
    const LaneDetail = await proxyOFT.tokenMapping(srcChainId, srcToken);
    console.log(`dstToken地址:${yellow(LaneDetail.dstToken)}`);
    config[network.networkIndex].tokenMapping[srcChainId][srcToken] =
      LaneDetail.dstToken;
    if (
      dstToken.toLocaleLowerCase() != LaneDetail.dstToken.toLocaleLowerCase()
    ) {
      console.log(
        `合约记录的dstToken地址:${yellow(LaneDetail.dstToken)},与网络${green(
          network.name
        )}的Token地址${yellow(dstToken)}不一致!`
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
        config[network.networkIndex].tokenMapping[srcChainId][srcToken] =
          dstToken;
      }
    }
  } else {
    console.log(
      `网络${green(network.name)}:\n ProxyOFT合约:${yellow(
        network.netConfig.proxy
      )}\n ` +
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
      config[network.networkIndex].tokenMapping[srcChainId][srcToken] =
        dstToken;
    }
  }
  writeFileSync(json, JSON.stringify(config, null, 2));
}

const main = async () => {
  // 环境
  const networkA = await setNetwork(config, "A");
  const tokenA = await input({
    message: "输入网络" + green("A") + "的Token地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const networkB = await setNetwork(config, "B");
  const tokenB = await input({
    message: "输入网络" + green("B") + "的Token地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });
  if (networkA.networkIndex == networkB.networkIndex) {
    throw new Error(red("网络A和网络B不能相同!"));
  }

  await checkRole(networkA, tokenA);

  await checkRole(networkB, tokenB);

  await laneExist(networkA, networkB.netConfig.lzChainId, tokenB, tokenA);

  await laneExist(networkB, networkA.netConfig.lzChainId, tokenA, tokenB);
};

main();
