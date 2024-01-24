import { input, select, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import {
  setNetwork,
  deployContractV2,
  sendTransaction,
  yellow,
} from "./helper";
import { isAddress } from "ethers";

const main = async () => {
  const network = await setNetwork();
  let { wallet, override, networkIndex, netConfig, config, configPath } =
    network;

  // Implementation
  const isDeployImpl = await confirm({
    message: "部署Implementation合约?",
  });
  if (isDeployImpl) {
    const oft_impl = await deployContractV2(
      ethers,
      network,
      "ProxyOFT",
      [],
      override
    );

    config[networkIndex].oft_impl = oft_impl.address;
    writeFileSync(configPath, JSON.stringify(config, null, 2));
  } else {
    config[networkIndex].oft_impl = await input({
      message: "输入Implementation合约地址",
      default: netConfig.oft_impl,
      validate: (value = "") =>
        isAddress(value) || "Pass a valid address value",
    });
    writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  // deployProxyOrUpgrade
  const deployProxyOrUpgrade = await select({
    message: "部署Proxy或者更新Implementation",
    choices: [
      {
        name: "部署Proxy合约",
        value: "deploy",
      },
      {
        name: "更新Implementation",
        value: "upgrade",
      },
    ],
  });
  const proxyAdmin = await input({
    message: "输入ProxyAdmin地址:",
    default: netConfig.proxyAdmin,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });
  config[networkIndex].proxyAdmin = proxyAdmin;
  writeFileSync(configPath, JSON.stringify(config, null, 2));

  // upgrade
  if (deployProxyOrUpgrade == "upgrade") {
    const proxyAdminContract = await ethers.getContractAt(
      "SumerProxyAdmin",
      proxyAdmin,
      wallet
    );

    proxyAdminContract.getFunction("upgrade").send();
    await sendTransaction(
      network,
      proxyAdminContract,
      "upgrade(address,address)",
      [netConfig.proxy, netConfig.oft_impl],
      override
    );
  }

  // deploy
  if (deployProxyOrUpgrade == "deploy") {
    const admin = await input({
      message: "输入合约Admin地址:",
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
    const lzChainId = await input({
      message: "输入LayerZero ChainId:",
      default: netConfig.lzChainId,
      validate: (value = "") =>
        parseInt(value) > 0 || "Pass a valid lzChainId value",
    });
    const oft_impl = await ethers.getContractAt(
      "ProxyOFT",
      netConfig.oft_impl,
      wallet
    );
    const data = oft_impl.interface.encodeFunctionData("initialize", [
      lzEndpoint,
      admin,
    ]);
    config[networkIndex].oft_init_data = data;
    console.log("OFT initialize data:", yellow(data));
    config[networkIndex].lzEndpoint = lzEndpoint;
    config[networkIndex].lzChainId = lzChainId;
    config[networkIndex].admin = admin;
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    const oftAddr = await oft_impl.getAddress();
    const proxy = await deployContractV2(
      ethers,
      network,
      "SumerProxy",
      [oftAddr, proxyAdmin, data],
      override
    );

    config[networkIndex].proxy = proxy.address;
    writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
};

main();
