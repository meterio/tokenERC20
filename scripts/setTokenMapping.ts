import { input, select, password, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { Contract, Overrides, Wallet, providers } from "ethers";
import { ERC20MinterBurnerPauser, ProxyOFT } from "../typechain";
import { MINTER_ROLE, setNetwork, Network, sendTransaction } from "./helper";
var colors = require("colors");
colors.enable();

const json = "./scripts/oft.config.json";
let config = JSON.parse(readFileSync(json).toString());

async function checkRole(network: Network, tokenAddress: string) {
  console.log(`查询网络${colors.green(network.name)}的Token权限设置:`);
  const tokenContract = (await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenAddress,
    network.wallet
  )) as ERC20MinterBurnerPauser;

  const hasRoleA = await tokenContract.hasRole(
    MINTER_ROLE,
    network.netConfig.proxy
  );

  if (hasRoleA) {
    console.log(
      `网络${colors.green(network.name)}:\n ProxyOFT合约:${
        network.netConfig.proxy.yellow
      }\n 拥有Token${colors.green(network.name)}合约${colors.yellow(
        tokenAddress
      )}的MINTER_ROLE`
    );
  } else {
    console.log(
      `网络${colors.green(network.name)}:\n ProxyOFT合约:${
        network.netConfig.proxy.yellow
      }\n 不拥有Token${colors.green(network.name)}合约${colors.yellow(
        tokenAddress
      )}的MINTER_ROLE`
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
        network.override
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
  console.log(`查询网络${colors.green(network.name)}的OFT设置:`);
  const proxyOFT = (await ethers.getContractAt(
    "ProxyOFT",
    network.netConfig.proxy,
    network.wallet
  )) as ProxyOFT;
  if (!config[network.networkIndex].tokenMapping) {
    config[network.networkIndex].tokenMapping = {};
    writeFileSync(json, JSON.stringify(config));
  }
  if (!config[network.networkIndex].tokenMapping[srcChainId]) {
    config[network.networkIndex].tokenMapping[srcChainId] = {};
    writeFileSync(json, JSON.stringify(config));
  }

  const laneExist = await proxyOFT.laneExist(srcChainId, srcToken);
  if (laneExist) {
    console.log(
      `网络${colors.green(network.name)}:\n ProxyOFT合约:${
        network.netConfig.proxy.yellow
      }\n ` +
        colors.red("存在") +
        `srcChainId${colors.green(srcChainId)}的srcToken: ${colors.yellow(
          srcToken
        )}的链路`
    );
    const LaneDetail = await proxyOFT.tokenMapping(srcChainId, srcToken);
    console.log(`dstToken地址:${colors.yellow(LaneDetail.dstToken)}`);
    config[network.networkIndex].tokenMapping[srcChainId][srcToken] =
      LaneDetail.dstToken;
    if (
      dstToken.toLocaleLowerCase() != LaneDetail.dstToken.toLocaleLowerCase()
    ) {
      console.log(
        `合约记录的dstToken地址:${colors.yellow(
          LaneDetail.dstToken
        )},与网络${colors.green(network.name)}的Token地址${colors.yellow(
          dstToken
        )}不一致!`
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
          network.override
        );
        config[network.networkIndex].tokenMapping[srcChainId][srcToken] =
          dstToken;
      }
    }
  } else {
    console.log(
      `网络${colors.green(network.name)}:\n ProxyOFT合约:${
        network.netConfig.proxy.yellow
      }\n ` +
        colors.red("不存在") +
        `srcChainId${colors.green(srcChainId)}的srcToken: ${colors.yellow(
          srcToken
        )}的链路`
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
        network.override
      );
      config[network.networkIndex].tokenMapping[srcChainId][srcToken] =
        dstToken;
    }
  }
  writeFileSync(json, JSON.stringify(config));
}

const main = async () => {
  // 环境
  const networkA = await setNetwork(config, "A");
  const tokenA = await input({
    message: "输入网络" + colors.green("A") + "的Token地址:",
  });

  const networkB = await setNetwork(config, "B");
  const tokenB = await input({
    message: "输入网络" + colors.green("B") + "的Token地址:",
  });

  await checkRole(networkA, tokenA);

  await checkRole(networkB, tokenB);

  await laneExist(networkA, networkB.netConfig.lzChainId, tokenB, tokenA);

  await laneExist(networkB, networkA.netConfig.lzChainId, tokenA, tokenB);
};

main();
// 0x12F7661fa804BcdBdc4C517765A0E8D71Db0c0e7
// 0xDD78FB0852091C073d05d9Ac3Ad9afdC9850147a

// 0xAEA3C3d4e78cfA3c1Cf2AC5702e83485097787EB
// 0xf04Bb037AF443F69494234Bab0aD61704cbec381
