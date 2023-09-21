import { input, select, password, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { Overrides } from "ethers";
import { ProxyOFT } from "../typechain";
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
  const networkIndex = await select({
    message: "选择所在网络:",
    choices: getChoices(),
  });
  const currentConfig = config[networkIndex];
  const privateKey = await password({
    message: "输入Private Key:",
  });
  const provider = new ethers.providers.JsonRpcProvider(currentConfig.rpc);
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deployer:", wallet.address);

  const defaultGasPrice = await wallet.provider.getGasPrice();
  override.gasPrice = await input({
    message: "输入Gas price:",
    default: defaultGasPrice.toString(),
  });
  console.log("当前Trust Remote Address配置:");
  const proxyContract = (await ethers.getContractAt(
    "ProxyOFT",
    currentConfig.proxy,
    wallet
  )) as ProxyOFT;
  for (let i = 0; i < config.length; i++) {
    if (i != networkIndex) {
      if (config[i].lzChainId) {
        console.log("chain name", config[i].name);
        console.log("chain id", config[i].lzChainId);
        console.log("chain proxy", config[i].proxy);
        let trustedRemoteLookup = await proxyContract.trustedRemoteLookup(
          config[i].lzChainId
        );
        if (trustedRemoteLookup == "0x") {
          const isSetRemote = await confirm({
            message: `${config[i].lzChainId}未配置TrustRemoteAddress,是否配置?`,
          });

          if (isSetRemote) {
            override.nonce = await input({
              message: "输入nonce:",
              default: (
                await provider.getTransactionCount(wallet.address)
              ).toString(),
            });
            override.gasLimit =
              await proxyContract.estimateGas.setTrustedRemoteAddress(
                config[i].lzChainId,
                config[i].proxy
              );
            console.log("gasLimit:", override.gasLimit.toString());
            let receipt = await proxyContract.setTrustedRemoteAddress(
              config[i].lzChainId,
              config[i].proxy,
              override
            );
            await receipt.wait();
            console.log("setTrustedRemoteAddress tx:", receipt.hash);
          }
        } else {
          let remoteAddress = await proxyContract.getTrustedRemoteAddress(
            config[i].lzChainId
          );
          console.log("trust remote address", remoteAddress);
          if (remoteAddress != config[i].proxy) {
            const configOrContract = await select({
              message: "合约读取的地址与配置文件不一致!",
              choices: [
                {
                  name: "按照Config文件设置合约的TrustRemoteAddress",
                  value: "contract",
                },
                {
                  name: "按照合约读取的TrustRemoteAddress设置Config文件",
                  value: "config",
                },
              ],
            });
            if (configOrContract == "contract") {
              override.nonce = await input({
                message: "输入nonce:",
                default: (
                  await provider.getTransactionCount(wallet.address)
                ).toString(),
              });
              override.gasLimit =
                await proxyContract.estimateGas.setTrustedRemoteAddress(
                  config[i].lzChainId,
                  config[i].proxy
                );
              console.log("gasLimit:", override.gasLimit.toString());
              let receipt = await proxyContract.setTrustedRemoteAddress(
                config[i].lzChainId,
                config[i].proxy,
                override
              );
              await receipt.wait();
              console.log("setTrustedRemoteAddress tx:", receipt.hash);
            } else {
              config[i].proxy = remoteAddress;
              console.log(
                `chainId: ${config[i].lzChainId}, trust remote address: ${remoteAddress}`
              );
              writeFileSync(json, JSON.stringify(config));
            }
          }
        }
      }
    }
  }
};

main();
