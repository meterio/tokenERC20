import {
  Contract,
  BytesLike,
  Wallet,
  JsonRpcProvider,
  isBytesLike,
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
  if (!fs.lstatSync(path.dirname(filepath)).isDirectory()) {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
  }
}

type ContractInfo = {
  contract: string;
  address: string;
  createdBy: string;
  createdAt: string;
  creationTx?: string;
  constructorArguments: Array<string>;
  constructorArgumentsDefs?: Array<{ name: string; type: string }>;
  libraries?: Object;
};

export function saveContractInfo(
  network: string,
  name: string,
  info: ContractInfo
) {
  const nameItems = name.split(":");
  const contractName = nameItems.length > 1 ? nameItems[1] : nameItems[0];
  const filepath = path.join(deployDir, network, `${contractName}.json`);
  ensureDir(filepath);

  fs.writeFileSync(filepath, JSON.stringify(info, null, 2));
  console.log(`saved contract info:`, yellow(filepath));
}

export function loadContractInfo(network: string, name: string): ContractInfo {
  const nameItems = name.split(":");
  const contractName = nameItems.length > 1 ? nameItems[1] : nameItems[0];
  const filepath = path.join(deployDir, network, `${contractName}.json`);
  ensureDir(filepath);

  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath).toString()) as ContractInfo;
  }
  console.log(`load contract info:`, yellow(filepath));
  return {} as ContractInfo;
}

export function moveContractInfo(network: string, name: string) {
  const nameItems = name.split(":");
  const contractName = nameItems.length > 1 ? nameItems[1] : nameItems[0];
  const filepath = path.join(deployDir, network, `${contractName}.json`);
  ensureDir(filepath);

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

export function loadNetConfig(netName: string): any {
  const netConfigPath = path.join(deployDir, netName, "config.json");
  ensureDir(netConfigPath);

  if (!fs.existsSync(netConfigPath)) {
    return {};
  }
  console.log(`load network config:`, yellow(netConfigPath));
  return JSON.parse(fs.readFileSync(netConfigPath).toString());
}

export function saveNetConfig(netName: string, newNetConfig: object) {
  const netConfigPath = path.join(deployDir, netName, "config.json");
  ensureDir(netConfigPath);

  console.log(`saved network config:`, yellow(netConfigPath));
  fs.writeFileSync(netConfigPath, JSON.stringify(newNetConfig, null, 2));
}

export function getNetworkChoicesFromHardhat() {
  const networkChoices = Object.keys(hardhatConfig.networks).map((n) => ({
    name: `${n} (${
      hardhatConfig.networks[n as keyof typeof hardhatConfig.networks].chainId
    }) : ${
      hardhatConfig.networks[n as keyof typeof hardhatConfig.networks].url
    }`,
    value: n,
  }));
  return networkChoices;
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

export async function selectNetwork(name: string = ""): Promise<Network> {
  // const { config, configPath } = await setConfig();
  if (!fs.lstatSync(deployDir).isDirectory()) {
    fs.mkdirSync(deployDir);
  }

  let override: any = {};
  const netName = await select({
    message: `选择网络${green(name)}:`,
    choices: getNetworkChoicesFromHardhat(),
  });
  type StatusKey = keyof typeof hardhatConfig.networks;

  let netConfig = loadNetConfig(netName);
  netConfig.rpc = hardhatConfig.networks[netName as StatusKey].url;
  console.log(`使用 hardhat.config.ts 中配置的rpc: `, netConfig.rpc);

  const privateKey = await password({
    message: `输入网络${green(name)}的Private Key:`,
    validate: (value = "") =>
      isBytesLike(value) || "Pass a valid Private Key value",
    mask: "*",
  });

  const provider = new JsonRpcProvider(netConfig.rpc);
  const wallet = new Wallet(privateKey, provider);
  console.log("Signer:", yellow(wallet.address));

  const feeData = await provider.getFeeData();
  const defaultGasPrice = feeData.gasPrice;
  override.gasPrice = await input({
    message: "输入Gas price:",
    default: defaultGasPrice?.toString(),
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

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
    let hasRole = await contract.hasRole(checkRole, network.wallet.address);
    if (!hasRole) {
      throw new Error(red("签名人不具有DEFAULT_ADMIN_ROLE权限!"));
    }
  }
  const address = await contract.getAddress();
  override.nonce = await input({
    message: "输入nonce:",
    default: (
      await network.provider.getTransactionCount(network.wallet.address)
    ).toString(),
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  override.gasLimit = await contract[func].estimateGas(...args);
  console.log("Estimated Gas:", green(override.gasLimit.toString()));
  let response = await contract[func](...args, override);
  const receipt = await response.wait();
  console.log(
    `called ${blue(func)} at ${address} by tx:`,
    yellow(receipt.hash)
  );
}

export async function deployContractV2(
  ethers: HardhatEthersHelpers,
  network: Network,
  contract: string,
  args: any[],
  override: any = {}
): Promise<Contract> {
  override.nonce = await input({
    message: "输入nonce:",
    default: (
      await network.provider.getTransactionCount(network.wallet.address)
    ).toString(),
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  const oldInfo = loadContractInfo(network.netConfig.name, contract);
  if (oldInfo.address) {
    const redeploy = await confirm({
      message: `该合约已在${oldInfo.createdAt} 部署至 ${oldInfo.address}，确定要再次部署吗？ `,
    });
    if (redeploy) {
      moveContractInfo(network.netConfig.name, contract);
    } else {
      exit(1);
    }
  }

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
    `${contract} deployed on ${green(network.name)} at: ${yellow(address)}`
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
  saveContractInfo(network.name, contract, info);
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
