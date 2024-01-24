import { select, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import {
  setNetwork,
  sendTransaction,
  green,
  yellow,
  red,
  DEFAULT_ADMIN_ROLE,
} from "./helper";

const main = async () => {
  const network = await setNetwork();
  const { netConfig, wallet, networkIndex, override, config, configPath } =
    network;

  const proxyContract = await ethers.getContractAt(
    "ProxyOFT",
    netConfig.proxy,
    wallet
  );
  for (let i = 0; i < config.length; i++) {
    if (i != networkIndex) {
      if (config[i].lzChainId && config[i].proxy) {
        console.log(
          `当前链: ${green(config[i].name)} Trust Remote Address配置:`
        );
        console.log("chain id", green(config[i].lzChainId));
        console.log("chain proxy", green(config[i].proxy));
        let trustedRemoteLookup = await proxyContract.trustedRemoteLookup(
          config[i].lzChainId
        );
        if (trustedRemoteLookup == "0x") {
          const isSetRemote = await confirm({
            message: `${green(
              config[i].lzChainId
            )}未配置TrustRemoteAddress,是否配置?`,
          });

          if (isSetRemote) {
            await sendTransaction(
              network,
              proxyContract,
              "setTrustedRemoteAddress(uint16,bytes)",
              [config[i].lzChainId, config[i].proxy],
              override,
              DEFAULT_ADMIN_ROLE
            );
          }
        } else {
          let remoteAddress = await proxyContract.getTrustedRemoteAddress(
            config[i].lzChainId
          );
          console.log("Trust remote address", yellow(remoteAddress));
          if (
            remoteAddress.toLocaleLowerCase() !=
            config[i].proxy.toLocaleLowerCase()
          ) {
            const configOrContract = await select({
              message: red(
                `合约读取的地址与配置文件不一致!(config:${yellow(
                  config[i].proxy
                )})`
              ),
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
                override,
                DEFAULT_ADMIN_ROLE
              );
            } else {
              config[i].proxy = remoteAddress;
              console.log(
                `chainId: ${green(
                  config[i].lzChainId
                )}, trust remote address: ${yellow(remoteAddress)}`
              );
              writeFileSync(configPath, JSON.stringify(config, null, 2));
            }
          } else {
            console.log(
              green(config[i].name) + " Trust Remote Address配置正确✅"
            );
          }
        }
      }
    }
  }
};

main();
