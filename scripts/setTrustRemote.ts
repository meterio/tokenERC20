import { select, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  selectNetwork,
  sendTransaction,
  green,
  yellow,
  red,
  DEFAULT_ADMIN_ROLE,
} from "./helper";

const main = async () => {
  const network = await selectNetwork();
  const { netConfig, wallet, override, updateNetConfig } = network;

  const proxyContract = await ethers.getContractAt(
    "ProxyOFT",
    netConfig.proxy,
    wallet
  );

  if (netConfig.lzChainId && netConfig.proxy) {
    console.log(`当前链: ${green(netConfig.name)} Trust Remote Address配置:`);
    console.log("chain id", green(netConfig.lzChainId));
    console.log("chain proxy", green(netConfig.proxy));
    let trustedRemoteLookup = await proxyContract.trustedRemoteLookup(
      netConfig.lzChainId
    );
    if (trustedRemoteLookup == "0x") {
      const isSetRemote = await confirm({
        message: `${green(
          netConfig.lzChainId
        )}未配置TrustRemoteAddress,是否配置?`,
      });

      if (isSetRemote) {
        await sendTransaction(
          network,
          proxyContract,
          "setTrustedRemoteAddress(uint16,bytes)",
          [netConfig.lzChainId, netConfig.proxy],
          override,
          DEFAULT_ADMIN_ROLE
        );
      }
    } else {
      let remoteAddress = await proxyContract.getTrustedRemoteAddress(
        netConfig.lzChainId
      );
      console.log("Trust remote address", yellow(remoteAddress));
      if (
        remoteAddress.toLocaleLowerCase() != netConfig.proxy.toLocaleLowerCase()
      ) {
        const configOrContract = await select({
          message: red(
            `合约读取的地址与配置文件不一致!(config:${yellow(netConfig.proxy)})`
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
            [netConfig.lzChainId, netConfig.proxy],
            override,
            DEFAULT_ADMIN_ROLE
          );
        } else {
          netConfig.proxy = remoteAddress;
          console.log(
            `chainId: ${green(
              netConfig.lzChainId
            )}, trust remote address: ${yellow(remoteAddress)}`
          );
          updateNetConfig(netConfig);
        }
      } else {
        console.log(green(netConfig.name) + " Trust Remote Address配置正确✅");
      }
    }
  }
};

main();
