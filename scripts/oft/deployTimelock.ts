import { input, confirm, select } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  selectNetwork,
  sendTransaction,
  loadOrDeployImplContract,
  loadOrDeployProxyContract,
  Network,
} from "../helper";
import { Interface, isAddress, ZeroAddress } from "ethers";

const main = async () => {
  const network = await selectNetwork();
  let { wallet, override, netConfig } = network;

  const contractName = `Timelock`;

  // Implementation
  const timelock = await loadOrDeployImplContract(
    ethers,
    network,
    contractName,
    [],
    override
  );

  const implAddr = await timelock.getAddress();
  const proxyContract = await loadOrDeployProxyContract(
    ethers,
    network,
    contractName,
    implAddr,
    async (network: Network, _interface: Interface): Promise<string> => {
      const { netConfig } = network;
      const admin = await input({
        message: `输入 Timelock 的 Admin地址:`,
        default: netConfig.admin,
        validate: (value = "") =>
          isAddress(value) || "Pass a valid address value",
      });
      const proposer = ZeroAddress;
      const executor = ZeroAddress;
      const limitWindow = await input({
        message: "输入 Limit Window (seconds):",
        default: Number(60 * 60 * 12).toString(),
        validate: (value = "") =>
          !Number.isNaN(Number(value)) || "Pass a valid address value",
      });

      return _interface.encodeFunctionData("initialize", [
        admin,
        proposer,
        executor,
        limitWindow,
      ]);
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
        [proxyAddr, implAddr]
        // override
      );
    }
  }
};

main();
