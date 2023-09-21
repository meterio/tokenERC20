import { input, select, password, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { Overrides } from "ethers";
import { ProxyOFT, SumerProxyAdmin } from "../typechain";
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
    message: "选择网络:",
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

  // Implementation
  const isDeployImpl = await confirm({
    message: "部署Implementation合约?",
  });
  if (isDeployImpl) {
    override.nonce = await input({
      message: "输入nonce:",
      default: (await provider.getTransactionCount(wallet.address)).toString(),
    });
    const oft_factory = await ethers.getContractFactory("ProxyOFT", wallet);
    override.gasLimit = await wallet.estimateGas(
      oft_factory.getDeployTransaction()
    );
    console.log("gasLimit:", override.gasLimit.toString());
    const oft_deploy = await oft_factory.deploy(override);
    const oft_impl = await oft_deploy.deployed();

    console.log("OFT Implementation:", oft_impl.address);

    config[networkIndex].oft_impl = oft_impl.address;
    writeFileSync(json, JSON.stringify(config));
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
    default: currentConfig.proxyAdmin,
  });
  config[networkIndex].proxyAdmin = proxyAdmin;
  writeFileSync(json, JSON.stringify(config));

  // upgrade
  if (deployProxyOrUpgrade == "upgrade") {
    override.nonce = await input({
      message: "输入nonce:",
      default: (await provider.getTransactionCount(wallet.address)).toString(),
    });

    const proxyAdminContract = (await ethers.getContractAt(
      "SumerProxyAdmin",
      proxyAdmin,
      wallet
    )) as SumerProxyAdmin;

    override.gasLimit = await proxyAdminContract.estimateGas.upgrade(
      currentConfig.proxy,
      currentConfig.oft_impl
    );
    console.log("gasLimit:", override.gasLimit.toString());
    const receipt = await proxyAdminContract.upgrade(
      currentConfig.proxy,
      currentConfig.oft_impl,
      override
    );
    await receipt.wait();
    console.log("OFT Proxy Upgrade:", receipt.hash);
  }

  // deploy
  if (deployProxyOrUpgrade == "deploy") {
    override.nonce = await input({
      message: "输入nonce:",
      default: (await provider.getTransactionCount(wallet.address)).toString(),
    });
    const admin = await input({
      message: "输入合约Admin地址:",
      default: currentConfig.admin,
    });
    const lzEndpoint = await input({
      message: "输入LayerZero Endpoint地址:",
      default: currentConfig.lzEndpoint,
    });
    const lzChainId = await input({
      message: "输入LayerZero ChainId:",
      default: currentConfig.lzChainId,
    });
    const oft_impl = (await ethers.getContractAt(
      "ProxyOFT",
      currentConfig.oft_impl,
      wallet
    )) as ProxyOFT;
    const data = oft_impl.interface.encodeFunctionData("initialize", [
      lzEndpoint,
      admin,
    ]);
    config[networkIndex].oft_init_data = data;
    console.log("OFT initialize data:", data);
    config[networkIndex].lzEndpoint = lzEndpoint;
    config[networkIndex].lzChainId = lzChainId;
    config[networkIndex].admin = admin;
    writeFileSync(json, JSON.stringify(config));
    override.nonce = await provider.getTransactionCount(wallet.address);

    const proxy_factory = await ethers.getContractFactory("SumerProxy", wallet);
    override.gasLimit = await wallet.estimateGas(
      proxy_factory.getDeployTransaction(oft_impl.address, proxyAdmin, data)
    );
    console.log("gasLimit:", override.gasLimit.toString());
    const proxy = await (
      await proxy_factory.deploy(oft_impl.address, proxyAdmin, data, override)
    ).deployed();
    console.log("OFT Proxy:", proxy.address);
    config[networkIndex].proxy = proxy.address;
    writeFileSync(json, JSON.stringify(config));
  }
};

main();
