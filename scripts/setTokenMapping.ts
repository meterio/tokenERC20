import { input, select, password, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { Contract, Overrides, Wallet, providers } from "ethers";
import { ERC20MinterBurnerPauser, ProxyOFT } from "../typechain";
import { MINTER_ROLE } from "./helper";
const json = "./scripts/oft.config.json";
let config = JSON.parse(readFileSync(json).toString());

function getChoices() {
  let result = [];
  for (let i = 0; i < config.length; i++) {
    result.push({
      name: config[i].name,
      value: i,
    });
  }
  return result;
}

type Network = {
  name: string;
  provider: providers.JsonRpcProvider;
  wallet: Wallet;
  netConfig: any;
  networkIndex: number;
};

async function setNetwork(name: string): Promise<Network> {
  const networkIndex = await select({
    message: `选择网络${name}:`,
    choices: getChoices(),
  });
  const privateKey = await password({
    message: `输入网络${name}的Private Key:`,
  });

  const provider = new ethers.providers.JsonRpcProvider(
    config[networkIndex].rpc
  );
  const wallet = new ethers.Wallet(privateKey, provider);
  const netConfig = config[networkIndex];
  return { name, provider, wallet, netConfig, networkIndex };
}

async function sendTransaction(
  network: Network,
  contract: Contract,
  func: string,
  args: any[],
  override: Overrides = {}
) {
  override.nonce = await input({
    message: "输入nonce:",
    default: (
      await network.provider.getTransactionCount(network.wallet.address)
    ).toString(),
  });
  override.gasLimit = await contract.estimateGas[func](...args);
  console.log("gasLimit:", override.gasLimit.toString());
  let receipt = await contract[func](...args, override);
  await receipt.wait();
  console.log(`${func} tx:`, receipt.hash);
}

async function checkRole(network: Network, tokenAddress: string) {
  console.log(`查询网络${network.name}的Token权限设置:`);
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
      `网络${network.name}:\n ProxyOFT合约:${network.netConfig.proxy}\n 拥有Token${network.name}合约${tokenAddress}的MINTER_ROLE`
    );
  } else {
    console.log(
      `网络${network.name}:\n ProxyOFT合约:${network.netConfig.proxy}\n 不拥有Token${network.name}合约${tokenAddress}的MINTER_ROLE`
    );
    const grantRole = await confirm({
      message: `是否配置?`,
    });
    if (grantRole) {
      sendTransaction(network, tokenContract, "grantRole(bytes32,address)", [
        MINTER_ROLE,
        network.netConfig.proxy,
      ]);
    }
  }
}

async function laneExist(
  network: Network,
  srcChainId: string,
  srcToken: string,
  dstToken: string
) {
  console.log(`查询网络${network.name}的OFT设置:`);
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
      `网络${network.name}:\n ProxyOFT合约:${network.netConfig.proxy}\n 存在srcChainId${srcChainId}的srcToken: ${srcToken}的链路`
    );
    const LaneDetail = await proxyOFT.tokenMapping(srcChainId, srcToken);
    console.log(`dstToken地址:${LaneDetail.dstToken}`);
    config[network.networkIndex].tokenMapping[srcChainId][srcToken] =
      LaneDetail.dstToken;
    if (
      dstToken.toLocaleLowerCase() != LaneDetail.dstToken.toLocaleLowerCase()
    ) {
      console.log(
        `合约记录的dstToken地址:${LaneDetail.dstToken},与网络${network.name}的Token地址${dstToken}不一致!`
      );
      const update = await confirm({
        message: `是否配置?`,
      });
      if (update) {
        sendTransaction(
          network,
          proxyOFT,
          "updateTokenMapping(uint16,address,address)",
          [srcChainId, srcToken, dstToken]
        );
        config[network.networkIndex].tokenMapping[srcChainId][srcToken] =
          dstToken;
      }
    }
  } else {
    console.log(
      `网络${network.name}:\n ProxyOFT合约:${network.netConfig.proxy}\n 不存在srcChainId${srcChainId}的srcToken: ${srcToken}的链路`
    );
    const add = await confirm({
      message: `是否配置?`,
    });
    if (add) {
      sendTransaction(
        network,
        proxyOFT,
        "addTokenMapping(uint16,address,address)",
        [srcChainId, srcToken, dstToken]
      );
      config[network.networkIndex].tokenMapping[srcChainId][srcToken] =
        dstToken;
    }
  }
  writeFileSync(json, JSON.stringify(config));
}

const main = async () => {
  // 环境
  const networkA = await setNetwork("A");
  const tokenA = await input({
    message: "输入网络A的Token地址:",
  });

  const networkB = await setNetwork("B");
  const tokenB = await input({
    message: "输入网络B的Token地址:",
  });

  await checkRole(networkA, tokenA);

  await checkRole(networkB, tokenB);

  await laneExist(networkA, networkB.netConfig.lzChainId, tokenB, tokenA);

  await laneExist(networkB, networkA.netConfig.lzChainId, tokenA, tokenB);
};

main();
// 0x12F7661fa804BcdBdc4C517765A0E8D71Db0c0e7
// 0xDD78FB0852091C073d05d9Ac3Ad9afdC9850147a
