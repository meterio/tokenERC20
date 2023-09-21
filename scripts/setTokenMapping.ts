import { input, select, password, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { Overrides } from "ethers";
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

const main = async () => {
  // 环境
  let override: Overrides = {};
  const networkIndexA = await select({
    message: "选择网络A:",
    choices: getChoices(),
  });
  const privateKeyA = await password({
    message: "输入网络A的Private Key:",
  });

  const tokenA = await input({
    message: "输入网络A的Token地址:",
  });

  const networkIndexB = await select({
    message: "选择网络B:",
    choices: getChoices(),
  });
  const privateKeyB = await password({
    message: "输入网络B的Private Key:",
  });
  const tokenB = await input({
    message: "输入网络B的Token地址:",
  });
  // 网络A
  const providerA = new ethers.providers.JsonRpcProvider(
    config[networkIndexA].rpc
  );
  const walletA = new ethers.Wallet(privateKeyA, providerA);
  // TokenA
  console.log("查询网络A的Token权限设置:");
  const tokenAContract = (await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenA,
    walletA
  )) as ERC20MinterBurnerPauser;

  const hasRoleA = await tokenAContract.hasRole(
    MINTER_ROLE,
    config[networkIndexA].proxy
  );
  if (hasRoleA) {
    console.log(
      `网络A:${config[networkIndexA].name}\n ProxyOFT合约:${config[networkIndexA].proxy}\n 拥有TokenA合约${tokenA}的MINTER_ROLE`
    );
  } else {
    console.log(
      `网络A:${config[networkIndexA].name}\n ProxyOFT合约:${config[networkIndexA].proxy}\n 不拥有TokenA合约${tokenA}的MINTER_ROLE`
    );
    const grantRole = await confirm({
      message: `是否配置?`,
    });
    if (grantRole) {
      override.nonce = await input({
        message: "输入nonce:",
        default: (
          await providerA.getTransactionCount(walletA.address)
        ).toString(),
      });
      override.gasLimit = await tokenAContract.estimateGas.grantRole(
        MINTER_ROLE,
        config[networkIndexA].proxy
      );
      console.log("gasLimit:", override.gasLimit.toString());
      let receipt = await tokenAContract.grantRole(
        MINTER_ROLE,
        config[networkIndexA].proxy,
        override
      );
      await receipt.wait();
      console.log("grantRole tx:", receipt.hash);
    }
  }

  // 网络B
  const providerB = new ethers.providers.JsonRpcProvider(
    config[networkIndexB].rpc
  );
  const walletB = new ethers.Wallet(privateKeyB, providerB);
  // TokenB
  console.log("查询网络B的Token权限设置:");
  const tokenBContract = (await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenB,
    walletB
  )) as ERC20MinterBurnerPauser;

  const hasRoleB = await tokenBContract.hasRole(
    MINTER_ROLE,
    config[networkIndexB].proxy
  );
  if (hasRoleB) {
    console.log(
      `网络B:${config[networkIndexB].name}\n ProxyOFT合约:${config[networkIndexB].proxy}\n 拥有TokenB合约${tokenB}的MINTER_ROLE`
    );
  } else {
    console.log(
      `网络B:${config[networkIndexB].name}\n ProxyOFT合约:${config[networkIndexB].proxy}\n 不拥有TokenB合约${tokenB}的MINTER_ROLE`
    );
    const grantRole = await confirm({
      message: `是否配置?`,
    });
    if (grantRole) {
      override.nonce = await input({
        message: "输入nonce:",
        default: (
          await providerB.getTransactionCount(walletB.address)
        ).toString(),
      });
      override.gasLimit = await tokenBContract.estimateGas.grantRole(
        MINTER_ROLE,
        config[networkIndexB].proxy
      );
      console.log("gasLimit:", override.gasLimit.toString());
      let receipt = await tokenBContract.grantRole(
        MINTER_ROLE,
        config[networkIndexB].proxy,
        override
      );
      await receipt.wait();
      console.log("grantRole tx:", receipt.hash);
    }
  }
  /////////
  console.log("查询网络A的OFT设置:");
  const proxyOFTA = (await ethers.getContractAt(
    "ProxyOFT",
    config[networkIndexA].proxy,
    walletA
  )) as ProxyOFT;

  const laneExistA = await proxyOFTA.laneExist(
    config[networkIndexB].lzChainId,
    tokenB
  );
  if (laneExistA) {
    const dstTokenA = await proxyOFTA.tokenMapping(
      config[networkIndexB].lzChainId,
      tokenB
    );

    console.log(
      `网络A:${config[networkIndexA].name}\n ProxyOFT合约:${config[networkIndexA].proxy}\n 存在来自于网络B${config[networkIndexB].name}\n 
      的Token: ${tokenB}的目标合约地址:${dstTokenA.dstToken}`
    );
    if (dstTokenA.dstToken != tokenA) {
      console.log(`目标合约地址:${dstTokenA.dstToken},与TokenA不一致!`);
      const update = await confirm({
        message: `是否配置?`,
      });
      if (update) {
        override.nonce = await input({
          message: "输入nonce:",
          default: (
            await providerA.getTransactionCount(walletA.address)
          ).toString(),
        });
        override.gasLimit = await proxyOFTA.estimateGas.updateTokenMapping(
          config[networkIndexB].lzChainId,
          tokenB,
          tokenA
        );
        console.log("gasLimit:", override.gasLimit.toString());
        let receipt = await proxyOFTA.updateTokenMapping(
          config[networkIndexB].lzChainId,
          tokenB,
          tokenA,
          override
        );
        await receipt.wait();
        console.log("updateTokenMapping tx:", receipt.hash);
      }
    }
  } else {
    console.log(
      `网络A:${config[networkIndexA].name}\n ProxyOFT合约:${config[networkIndexA].proxy}\n 不存在来自于网络B${config[networkIndexB].name}\n 
      的Token: ${tokenB}的目标合约地址`
    );
    const add = await confirm({
      message: `是否配置?`,
    });
    if (add) {
      override.nonce = await input({
        message: "输入nonce:",
        default: (
          await providerA.getTransactionCount(walletA.address)
        ).toString(),
      });
      override.gasLimit = await proxyOFTA.estimateGas.addTokenMapping(
        config[networkIndexB].lzChainId,
        tokenB,
        tokenA
      );
      console.log("gasLimit:", override.gasLimit.toString());
      let receipt = await proxyOFTA.addTokenMapping(
        config[networkIndexB].lzChainId,
        tokenB,
        tokenA,
        override
      );
      await receipt.wait();
      console.log("addTokenMapping tx:", receipt.hash);
    }
  }
  /////////
  console.log("查询网络B的OFT设置:");
  const proxyOFTB = (await ethers.getContractAt(
    "ProxyOFT",
    config[networkIndexB].proxy,
    walletB
  )) as ProxyOFT;

  const laneExistB = await proxyOFTB.laneExist(
    config[networkIndexA].lzChainId,
    tokenA
  );
  if (laneExistA) {
    const dstTokenB = await proxyOFTB.tokenMapping(
      config[networkIndexA].lzChainId,
      tokenA
    );

    console.log(
      `网络B:${config[networkIndexB].name}\n ProxyOFT合约:${config[networkIndexB].proxy}\n 存在来自于网络A${config[networkIndexA].name}\n 
      的Token: ${tokenA}的目标合约地址:${dstTokenB.dstToken}`
    );
    if (dstTokenB.dstToken != tokenB) {
      console.log(`目标合约地址:${dstTokenB.dstToken},与TokenB不一致!`);
      const update = await confirm({
        message: `是否配置?`,
      });
      if (update) {
        override.nonce = await input({
          message: "输入nonce:",
          default: (
            await providerB.getTransactionCount(walletB.address)
          ).toString(),
        });
        override.gasLimit = await proxyOFTB.estimateGas.updateTokenMapping(
          config[networkIndexA].lzChainId,
          tokenA,
          tokenB
        );
        console.log("gasLimit:", override.gasLimit.toString());
        let receipt = await proxyOFTB.updateTokenMapping(
          config[networkIndexA].lzChainId,
          tokenA,
          tokenB,
          override
        );
        await receipt.wait();
        console.log("updateTokenMapping tx:", receipt.hash);
      }
    }
  } else {
    console.log(
      `网络B:${config[networkIndexB].name}\n ProxyOFT合约:${config[networkIndexB].proxy}\n 不存在来自于网络A${config[networkIndexA].name}\n 
      的Token: ${tokenA}的目标合约地址`
    );
    const add = await confirm({
      message: `是否配置?`,
    });
    if (add) {
      override.nonce = await input({
        message: "输入nonce:",
        default: (
          await providerB.getTransactionCount(walletB.address)
        ).toString(),
      });
      override.gasLimit = await proxyOFTB.estimateGas.addTokenMapping(
        config[networkIndexA].lzChainId,
        tokenA,
        tokenB
      );
      console.log("gasLimit:", override.gasLimit.toString());
      let receipt = await proxyOFTB.addTokenMapping(
        config[networkIndexA].lzChainId,
        tokenA,
        tokenB,
        override
      );
      await receipt.wait();
      console.log("addTokenMapping tx:", receipt.hash);
    }
  }
};

main();
