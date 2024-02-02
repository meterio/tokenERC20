import { input, confirm, select } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  selectNetwork,
  sendTransaction,
  loadOrDeployImplContract,
  loadOrDeployProxyContract,
  Network,
} from "../helper";
import { Interface, isAddress } from "ethers";

const main = async () => {
  const network = await selectNetwork();
  let { wallet, override, netConfig } = network;

  const version = await select({
    message: "选择部署的ProxyOFT版本:",
    choices: [
      {
        name: "部署V1 (Mint & Burn)",
        value: "v1",
      },
      {
        name: "部署V2 (Lock & Transfer)",
        value: "v2",
      },
    ],
  });

  const contractName = `ProxyOFT` + (version == "v2" ? "V2" : "");

  // Implementation
  const proxyOFT = await loadOrDeployImplContract(
    ethers,
    network,
    contractName,
    [],
    override
  );

  const implAddr = await proxyOFT.getAddress();
  const proxyContract = await loadOrDeployProxyContract(
    ethers,
    network,
    contractName,
    implAddr,
    async (network: Network, _interface: Interface): Promise<string> => {
      const { netConfig } = network;
      const admin = await input({
        message: `输入ProxyOFT的Admin地址:`,
        default: netConfig.admin,
        validate: (value = "") =>
          isAddress(value) || "Pass a valid address value",
      });
      const lzEndpoint = await input({
        message: "输入LayerZero Endpoint地址:",
        default: netConfig.lzEndpoint,
        validate: (value = "") =>
          isAddress(value) || "Pass a valid address value",
      });
      return _interface.encodeFunctionData("initialize", [lzEndpoint, admin]);
    }
  );
  const proxyAddr = await proxyContract.getAddress();
  // const actualImplAddr = await proxyContract._implementation();
  const proxyAdminContract = await ethers.getContractAt(
    "ProxyAdmin",
    netConfig.proxyAdmin,
    wallet
  );
  const actualImplAddr =
    await proxyAdminContract.getProxyImplementation(proxyAddr);

  if (actualImplAddr.toLowerCase() != implAddr.toLowerCase()) {
    const needUpgrade = await confirm({
      message: `更新Implementation至 ${implAddr}`,
    });
    if (needUpgrade) {
      const proxyAdminContract = await ethers.getContractAt(
        "ProxyAdmin",
        netConfig.proxyAdmin,
        wallet
      );

      await sendTransaction(
        network,
        proxyAdminContract,
        "upgrade(address,address)",
        [proxyAddr, implAddr],
        override
      );
    }
  }
};

main();
