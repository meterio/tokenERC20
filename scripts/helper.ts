import {
  Contract,
  BytesLike,
  Wallet,
  JsonRpcProvider,
  isBytesLike,
  isAddress,
  ZeroAddress,
  Interface,
} from "ethers";
import { HardhatEthersHelpers } from "@nomicfoundation/hardhat-ethers/types";
import { input, select, password, confirm } from "@inquirer/prompts";
import colors from "colors";
colors.enable();
import * as fs from "fs";
import * as path from "path";
import moment from "moment";

import hardhatConfig from "../hardhat.config";
import { exit } from "process";

export const yellow = colors.yellow;
export const green = colors.green;
export const red = colors.red;
export const blue = colors.blue;
export const bgWhite = colors.bgWhite;
export const bgYellow = colors.bgYellow;
export const overrides: any = {
  gasLimit: 8000000,
};
import hardhatContractConfig from "../hardhat.config";
import * as LAYERZERO_V1 from "./layerzero_v1.json";

export const MINTER_ROLE: BytesLike =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
export const DEFAULT_ADMIN_ROLE: BytesLike =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const gasLeft: bigint = BigInt(28975827); //1ba22d3

export type Network = {
  name: string;
  provider: JsonRpcProvider;
  wallet: Wallet;
  override: any;
  netConfig: any;
  updateNetConfig: Function;
};

const deployDir = path.join(__dirname, "..", "deployments");
function ensureDir(filepath: string) {
  if (
    !fs.existsSync(path.dirname(filepath)) ||
    !fs.lstatSync(path.dirname(filepath)).isDirectory()
  ) {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
  }
}

export type ContractInfo = {
  contract: string;
  address: string;
  createdBy: string;
  createdAt: string;
  creationTx?: string;
  constructorArguments: Array<string>;
  constructorArgumentsDefs?: Array<{ name: string; type: string }>;
  libraries?: Object;
};

function getContractInfoFilePath(
  network: string,
  contractName: string,
  isProxy = false
): string {
  let filepath = path.join(deployDir, network, `${contractName}.json`);
  if (isProxy) {
    filepath = path.join(deployDir, network, `${contractName}-proxy.json`);
  }
  ensureDir(filepath);
  return filepath;
}

export function saveContractInfo(
  network: string,
  contractName: string,
  info: ContractInfo,
  isProxy = false
) {
  let filepath = getContractInfoFilePath(network, contractName, isProxy);

  fs.writeFileSync(filepath, JSON.stringify(info, null, 2));
  console.log(`saved contract info:`, yellow(filepath));
}

export function loadContractInfo(
  network: string,
  contractName: string,
  isProxy = false
): ContractInfo {
  let filepath = getContractInfoFilePath(network, contractName, isProxy);

  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath).toString()) as ContractInfo;
  }
  console.log(`load contract info:`, yellow(filepath));
  return {} as ContractInfo;
}

export function loadContractInfoByAddress(
  network: string,
  address: string
): ContractInfo {
  const q = [path.join(deployDir, network)];
  while (q.length > 0) {
    const dir = q.shift();
    if (!dir) {
      continue;
    }
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const filepath = path.join(dir, f);
      if (fs.lstatSync(filepath).isDirectory()) {
        q.push(filepath);
      } else if (f.endsWith(".json")) {
        const content = JSON.parse(fs.readFileSync(filepath).toString());
        if (content.address?.toLowerCase() == address.toLowerCase()) {
          return content as ContractInfo;
        }
      }
    }
  }
  throw new Error(`没有找到对应地址 ${address} 的配置`);
}

export function findContractPath(name: string): string {
  const q = [path.join(__dirname, "..", "contracts")];
  while (q.length > 0) {
    const dir = q.shift();
    if (!dir) {
      continue;
    }
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const filepath = path.join(dir, f);
      if (fs.lstatSync(filepath).isDirectory()) {
        q.push(filepath);
      } else if (f == name + ".sol") {
        return (
          filepath.replace(path.join(__dirname, "..") + "/", "") + `:${name}`
        );
      }
    }
  }
  throw new Error(`没有找到合约 ${name} 的.sol文件`);
}

export function loadTokenMapping(netConfig: any, proxyAddress: string) {
  if (!netConfig.tokenMapping) {
    return {};
  }
  if (netConfig.tokenMapping[proxyAddress]) {
    return netConfig.tokenMapping[proxyAddress];
  }
  return {};
}

export function saveTokenMapping(
  netName: string,
  netConfig: any,
  proxyAddress: string,
  tokenMapping: object
) {
  if (!netConfig.tokenMapping) {
    netConfig.tokenMapping = {};
  }
  netConfig.tokenMapping[proxyAddress] = tokenMapping;
  saveNetConfig(netName, netConfig);
}

export function loadDeployedAddresses(
  netConfig: any,
  name: string,
  isProxy = false
): string[] {
  if (isProxy) {
    name += "-proxy";
  }
  let result = [];
  if (netConfig.hasOwnProperty(name)) {
    if (typeof netConfig[name] == "string") {
      result = [netConfig[name]];
    } else if (Array.isArray(netConfig[name])) {
      result = netConfig[name];
    }
  }
  return result;
}

export function saveDeployedAddress(
  network: Network,
  name: string,
  address: string,
  isProxy = false
) {
  if (isProxy) {
    name += "-proxy";
  }
  const { netConfig, updateNetConfig } = network;
  if (!netConfig[name]) {
    netConfig[name] = address;
  } else if (typeof netConfig[name] == "string" && netConfig[name] != address) {
    netConfig[name] = [address, netConfig[name]];
  } else if (Array.isArray(netConfig[name])) {
    netConfig[name].unshift(address);
  }
  updateNetConfig(netConfig);
}
export function moveContractInfo(
  network: string,
  contractName: string,
  isProxy = false
) {
  const filepath = getContractInfoFilePath(network, contractName, isProxy);

  if (!fs.existsSync(filepath)) {
    return;
  }

  const content: ContractInfo = JSON.parse(
    fs.readFileSync(filepath).toString()
  );

  if (!content.address) {
    return;
  }

  const filename = path.basename(filepath);
  const ext = path.extname(filename);
  const realname = filename.slice(0, filename.length - ext.length);
  const newname = realname + "-" + content.address + ext;
  const newpath = path.join(deployDir, network, newname);
  console.log(`moved contract info: ${filepath} -> ${yellow(newpath)}`);
  fs.writeFileSync(newpath, JSON.stringify(content, null, 2));
  fs.unlinkSync(filepath);
}

export function getNetworkChoicesFromHardhat() {
  const networkChoices = Object.keys(hardhatContractConfig.networks).map(
    (n) => ({
      name: `${n} (${hardhatContractConfig.networks[n as keyof typeof hardhatContractConfig.networks].chainId}) : ${
        hardhatContractConfig.networks[
          n as keyof typeof hardhatContractConfig.networks
        ].url
      }`,
      value: n,
    })
  );
  return networkChoices;
}

export function loadNetConfigFromHardhat(net: string) {
  const config =
    hardhatContractConfig.networks[
      net as keyof typeof hardhatContractConfig.networks
    ];
  return {
    ...config,
    ...LAYERZERO_V1[net as keyof typeof LAYERZERO_V1],
    name: net,
  };
}

export function loadNetConfig(netName: string): any {
  const netConfigPath = path.join(deployDir, netName, "config.json");
  ensureDir(netConfigPath);
  const hardhatNetConfig = loadNetConfigFromHardhat(netName);

  if (!fs.existsSync(netConfigPath)) {
    fs.writeFileSync(fs.openSync(netConfigPath, "w"), JSON.stringify({}));
    return { ...hardhatNetConfig, name: netName };
  }

  const config = JSON.parse(fs.readFileSync(netConfigPath).toString());
  console.log(`config`, config);
  return { ...config, ...hardhatNetConfig, name: netName };
}

export function saveNetConfig(netName: string, newNetConfig: any) {
  const netConfigPath = path.join(deployDir, netName, "config.json");
  ensureDir(netConfigPath);

  const config = JSON.parse(JSON.stringify(newNetConfig));

  delete config.lzEndpoint;
  delete config.lzEndpointId;
  delete config.url;
  delete config.accounts;
  delete config.chainId;
  delete config.gasPrice;
  delete config.name;

  console.log(`保存网络 ${blue(netName)} config.json:`, yellow(netConfigPath));
  fs.writeFileSync(netConfigPath, JSON.stringify(config, null, 2));
}

export function getNetwork2LZMap() {
  let configMap: { [key: string]: any } = {};
  for (const network in hardhatConfig.networks) {
    const config = loadNetConfig(network);
    if (
      config.hasOwnProperty("lzEndpointId") &&
      config.hasOwnProperty("lzEndpoint")
    ) {
      configMap[network] = {
        lzEndpointId: config.lzEndpointId,
        lzEndpoint: config.lzEndpoint,
      };
    }
  }
  return configMap;
}

export function getLZ2NetworkMap() {
  const n2l = getNetwork2LZMap();
  let l2n: { [key: string]: string } = {};
  for (const netName in n2l) {
    l2n[n2l[netName].lzEndpointId] = netName;
  }
  return l2n;
}

export function getAllNetConfigs() {
  const networks = Object.keys(hardhatConfig.networks);
  let results = [];
  for (const network of networks) {
    const netConfig = loadNetConfig(network);
    results.push({
      ...netConfig,
      name: network,
      rpc: hardhatConfig.networks[
        network as keyof typeof hardhatConfig.networks
      ].url,
      chainId:
        hardhatConfig.networks[network as keyof typeof hardhatConfig.networks]
          .chainId,
    });
  }
  return results;
}

export async function selectProxyOFT(netConfig: any) {
  const v1Proxies = loadDeployedAddresses(netConfig, "ProxyOFT", true);
  const v2Proxies = loadDeployedAddresses(netConfig, "ProxyOFTV2", true);
  let choicesB: { name: string; value: string }[] = [];
  v1Proxies.map((p) => {
    choicesB.push({ name: `V1: ${p}`, value: p });
  });
  v2Proxies.map((p) => {
    choicesB.push({ name: `V2: ${p}`, value: p });
  });
  if (choicesB.length <= 0) {
    console.log(`${netConfig.name} 上还没有部署任何ProxyOFT，请先部署`);
    exit(-1);
  }
  const proxyAddress = await select({
    message: `选择网络 ${blue(netConfig.name)} 上ProxyOFT地址:`,
    choices: choicesB,
  });
  const version = v1Proxies.includes(proxyAddress) ? "v1" : "v2";
  return { address: proxyAddress, version };
}

export async function selectNetwork(
  name: string = "",
  readonly = false
): Promise<Network> {
  // const { config, configPath } = await setConfig();
  if (!fs.lstatSync(deployDir).isDirectory()) {
    fs.mkdirSync(deployDir);
  }

  let override: any = {};
  const netName = await select({
    message: `选择网络 ${blue(name)}:`,
    choices: getNetworkChoicesFromHardhat(),
  });

  let netConfig = loadNetConfig(netName);
  console.log(`使用 hardhat.config.ts 中配置的url: `, netConfig.url);

  const provider = new JsonRpcProvider(netConfig.url);
  let wallet = {} as Wallet;
  if (!readonly) {
    let privateKey = "";
    const env_privkey = process.env[`${netName.toUpperCase()}_PRIVKEY`];
    if (env_privkey && isBytesLike(env_privkey)) {
      privateKey = env_privkey;
    } else {
      privateKey = await password({
        message: `输入网络${green(name)}的Private Key:`,
        validate: (value = "") =>
          isBytesLike(value) || "Pass a valid Private Key value",
        mask: "*",
      });
    }

    wallet = new Wallet(privateKey, provider);
    console.log("Wallet Signer:", yellow(wallet.address));
  }

  // const feeData = await provider.getFeeData();
  // if (!readonly) {
  //   const defaultGasPrice = feeData.gasPrice;
  //   override.gasPrice = await input({
  //     message: "输入Gas price:",
  //     default: defaultGasPrice?.toString(),
  //     validate: (value = "") => value.length > 0 || "Pass a valid value",
  //   });
  // }

  const updateNetConfig = (newNetConfig: object) => {
    saveNetConfig(netName, newNetConfig);
  };

  return {
    name: netName,
    provider,
    wallet,
    override,
    netConfig,
    updateNetConfig,
  };
}

export async function sendTransaction(
  network: Network,
  contract: any,
  func: string,
  args: any[],
  override: any = {},
  checkRole: BytesLike = "0x"
) {
  if (checkRole != "0x") {
    console.log(checkRole, network.wallet.address);
    let hasRole = await contract.hasRole(checkRole, network.wallet.address);
    if (!hasRole) {
      throw new Error(red("签名人不具有DEFAULT_ADMIN_ROLE权限!"));
    }
  }
  const address = await contract.getAddress();
  // override.nonce = await input({
  //   message: "输入nonce:",
  //   default: (
  //     await network.provider.getTransactionCount(network.wallet.address)
  //   ).toString(),
  //   validate: (value = "") => value.length > 0 || "Pass a valid value",
  // });

  override.gasLimit = await contract[func].estimateGas(...args, override);
  console.log("Estimated Gas:", green(override.gasLimit.toString()));
  let response = await contract[func](...args, override);
  const receipt = await response.wait();
  console.log(
    `called ${blue(func)} at ${address} by tx:`,
    yellow(receipt.hash)
  );
}

export async function loadOrDeployImplContract(
  ethers: HardhatEthersHelpers,
  network: Network,
  contract: string,
  args: any[],
  override: any = {}
): Promise<Contract> {
  const deployedAddresses = loadDeployedAddresses(network.netConfig, contract);
  if (deployedAddresses.length > 0) {
    const redeploy = await confirm({
      message: `${contract} Impl合约已部署至${deployedAddresses[0]}等${deployedAddresses.length}个地址，需要重新部署吗？ `,
      default: false,
    });
    if (redeploy) {
      moveContractInfo(network.name, contract);
    } else {
      const address = await input({
        message: `输入${contract} Impl合约地址`,
        default: deployedAddresses[0],
        validate: (value = "") =>
          isAddress(value) || "Pass a valid address value",
      });
      return ethers.getContractAt(contract, address, network.wallet);
    }
  }

  return deployContractV2(ethers, network, contract, args, override);
}

export async function loadOrDeployProxyContract(
  ethers: HardhatEthersHelpers,
  network: Network,
  implContractName: string,
  implAddr: string,
  buildData: (network: Network, _interface: Interface) => Promise<string>,
  override: any = {}
): Promise<Contract> {
  const { netConfig, updateNetConfig } = network;
  const deployedAddresses = loadDeployedAddresses(
    network.netConfig,
    implContractName,
    true
  );
  if (deployedAddresses.length > 0) {
    const redeploy = await confirm({
      message: `${implContractName} Proxy合约已部署至${deployedAddresses[0]}等${deployedAddresses.length}个地址，需要重新部署吗？`,
      default: false,
    });
    if (redeploy) {
      moveContractInfo(network.name, implContractName, true);
    } else {
      const address = await input({
        message: `确认${implContractName} Proxy合约地址`,
        default: deployedAddresses[0],
        validate: (value = "") =>
          isAddress(value) || "Pass a valid address value",
      });
      return ethers.getContractAt(
        "TransparentUpgradeableProxy",
        address,
        network.wallet
      );
    }
  }

  const proxyAdmin = await input({
    message: "输入ProxyAdmin地址:",
    default: netConfig.proxyAdmin,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });
  netConfig.proxyAdmin = proxyAdmin;
  updateNetConfig(netConfig);

  const implContract = await ethers.getContractAt(
    implContractName,
    ZeroAddress
  );
  const data = await buildData(network, implContract.interface);
  return deployContractV2(
    ethers,
    network,
    "TransparentUpgradeableProxy",
    [implAddr, proxyAdmin, data],
    override,
    `${implContractName}-proxy`
  );
}

export async function deployContractV2(
  ethers: HardhatEthersHelpers,
  network: Network,
  contract: string,
  args: any[],
  override: any = {},
  alias = ""
): Promise<Contract> {
  const { netConfig, updateNetConfig } = network;
  override.nonce = await input({
    message: `准备部署${contract}，输入nonce:`,
    default: (
      await network.provider.getTransactionCount(network.wallet.address)
    ).toString(),
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  moveContractInfo(network.name, contract);

  const factory = await ethers.getContractFactory(contract, network.wallet);
  const deployTx = await factory.getDeployTransaction(...args);
  override.gasLimit = await network.wallet.estimateGas(deployTx);
  console.log("Estimated Gas:", green(override.gasLimit.toString()));

  const constructorFragment = factory.interface.deploy;
  const constructorArgumentsDefs = constructorFragment.inputs.map((f) => ({
    name: f.name,
    type: f.type,
  }));
  const deploy = await factory.deploy(...args, override);
  const deployed = await deploy.waitForDeployment();

  const address = await deployed.getAddress();
  const response = await deployed.deploymentTransaction();
  const tx = await response?.getTransaction();

  console.log(
    `${contract} deployed on ${blue(network.name)} at: ${yellow(address)}`
  );
  const info: ContractInfo = {
    contract,
    address,
    createdBy: network.wallet.address,
    createdAt: moment().format(),
    creationTx: tx?.hash,
    constructorArguments: args,
    constructorArgumentsDefs,
  };
  let key = contract;
  if (alias) {
    key = alias;
    saveContractInfo(network.name, alias, info);
  } else {
    saveContractInfo(network.name, contract, info);
  }
  saveDeployedAddress(network, key, info.address);
  return deployed;
}

export async function getContractReadOnly(
  ethers: HardhatEthersHelpers,
  rpc: string,
  contract: string,
  address: string
) {
  const provider = new JsonRpcProvider(rpc);

  return await ethers.getContractAt(contract, address);
}

export async function loadContractV2(
  ethers: HardhatEthersHelpers,
  network: Network,
  contract: string
) {
  const info = loadContractInfo(network.name, contract);

  if (info.address != "") {
    return await ethers.getContractAt(contract, info.address, network.wallet);
  }
  return null;
}
