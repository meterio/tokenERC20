import { input, select, password, confirm } from "@inquirer/prompts";
import { ethers, network } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { setNetwork, sendTransaction } from "./helper";
import { ProxyOFT } from "../typechain";
const json = "./scripts/oft.config.json";
let config = JSON.parse(readFileSync(json).toString());
var colors = require("colors");
colors.enable();

const main = async () => {
  const network = await setNetwork(config, "");
  const { netConfig, wallet, networkIndex, override } = network;

  console.log("当前Trust Remote Address配置:");
  const proxyContract = (await ethers.getContractAt(
    "ProxyOFT",
    netConfig.proxy,
    wallet
  )) as ProxyOFT;
  for (let i = 0; i < config.length; i++) {
    if (i != networkIndex) {
      if (config[i].lzChainId) {
        console.log("chain name", colors.green(config[i].name));
        console.log("chain id", colors.green(config[i].lzChainId));
        console.log("chain proxy", colors.green(config[i].proxy));
        let trustedRemoteLookup = await proxyContract.trustedRemoteLookup(
          config[i].lzChainId
        );
        if (trustedRemoteLookup == "0x") {
          const isSetRemote = await confirm({
            message: `${colors.green(
              config[i].lzChainId
            )}未配置TrustRemoteAddress,是否配置?`,
          });

          if (isSetRemote) {
            await sendTransaction(
              network,
              proxyContract,
              "setTrustedRemoteAddress(uint16,bytes)",
              [config[i].lzChainId, config[i].proxy],
              override
            );
          }
        } else {
          let remoteAddress = await proxyContract.getTrustedRemoteAddress(
            config[i].lzChainId
          );
          console.log("trust remote address", colors.yellow(remoteAddress));
          if (remoteAddress != config[i].proxy) {
            const configOrContract = await select({
              message: colors.red("合约读取的地址与配置文件不一致!"),
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
              await sendTransaction(
                network,
                proxyContract,
                "setTrustedRemoteAddress(uint16,bytes)",
                [config[i].lzChainId, config[i].proxy],
                override
              );
            } else {
              config[i].proxy = remoteAddress;
              console.log(
                `chainId: ${colors.green(
                  config[i].lzChainId
                )}, trust remote address: ${colors.yellow(remoteAddress)}`
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
