import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import {
  Contract,
  Signer,
  BytesLike,
  Wallet,
  JsonRpcProvider,
  ZeroAddress,
  isBytesLike,
  BigNumberish,
} from "ethers";
import { HardhatEthersHelpers } from "@nomicfoundation/hardhat-ethers/types";
import { Libraries } from "hardhat/types";
import { input, select, password } from "@inquirer/prompts";
import colors from "colors";
colors.enable();

export const yellow = colors.yellow;
export const green = colors.green;
export const red = colors.red;
export const blue = colors.blue;
export const bgWhite = colors.bgWhite;
export const bgYellow = colors.bgYellow;
export const defaultPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // mnemonic:test test test test test test test test test test test junk

export const json = "./scripts/oft.config.testnet.json";
export const config = JSON.parse(readFileSync(json).toString());

export function expandTo18Decimals(n: number): bigint {
  return BigInt(n) * BigInt(10) ** BigInt(18);
}

export function BN(n: number): bigint {
  return BigInt(n);
}
export const overrides: any = {
  gasLimit: 8000000,
};

export const MINTER_ROLE: BytesLike =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
export const DEFAULT_ADMIN_ROLE: BytesLike =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const gasLeft = BN(28975827); //1ba22d3

export function getContract(network: string, name: string) {
  const nameArr = name.split(":");
  const contractName = nameArr.length > 1 ? nameArr[1] : nameArr[0];
  const path = `./deployments/${network}/`;
  const latest = `${contractName}.json`;

  if (existsSync(path + latest)) {
    let json = JSON.parse(readFileSync(path + latest).toString());
    return json.address;
  } else {
    return ZeroAddress;
  }
}

export function getContractJson(network: string, name: string) {
  const nameArr = name.split(":");
  const contractName = nameArr.length > 1 ? nameArr[1] : nameArr[0];
  const path = `./deployments/${network}/`;
  const latest = `${contractName}.json`;

  if (existsSync(path + latest)) {
    return JSON.parse(readFileSync(path + latest).toString());
  } else {
    return "";
  }
}

export async function deployContract(
  ethers: HardhatEthersHelpers,
  name: string,
  network: string,
  signer: Signer,
  args: Array<any> = [],
  libraries: Libraries = {}
): Promise<Contract> {
  let address = getContract(network, name);
  // if (address == constants.AddressZero || network == "hardhat") {
  const factory = await ethers.getContractFactory(name, {
    signer: signer,
    libraries: libraries,
  });
  const contract = await factory.deploy(...args, overrides);
  const tx = contract.deploymentTransaction();
  console.log("Deploying:", name);
  console.log("  to", contract.address);
  console.log("  in", tx?.hash);
  await saveFile(network, name, contract, args, libraries);
  return contract.waitForDeployment();
  // } else {
  // console.log("Contract:", name);
  // console.log("  on", address.white);
  // return await ethers.getContractAt(name, address, signer);
  // }
}

export async function deployContractOverrides(
  ethers: HardhatEthersHelpers,
  name: string,
  network: string,
  signer: Signer,
  args: Array<any> = [],
  overrides: any = {}
): Promise<Contract> {
  let address = getContract(network, name);
  // if (address == constants.AddressZero || network == "hardhat") {
  const factory = await ethers.getContractFactory(name, {
    signer: signer,
  });
  const contract = await factory.deploy(...args, overrides);
  const tx = contract.deploymentTransaction();
  console.log("Deploying:", name);
  console.log("  to", contract.address);
  console.log("  in", tx?.hash);
  await saveFile(network, name, contract, args);
  return contract.waitForDeployment();
  // } else {
  // console.log("Contract:", name);
  // console.log("  on", address.white);
  // return await ethers.getContractAt(name, address, signer);
  // }
}

export async function saveFile(
  network: string,
  name: string,
  contract: Contract,
  args: Array<any> = [],
  libraries: Object = {}
) {
  const nameArr = name.split(":");
  const contractName = nameArr.length > 1 ? nameArr[1] : nameArr[0];
  const path = `./deployments/${network}/`;
  const file = `${contractName}.json`;

  mkdirSync(path, { recursive: true });

  if (contractName != name) {
    writeFileSync(
      path + file,
      JSON.stringify({
        address: contract.address,
        constructorArguments: args,
        libraries: libraries,
        contract: name,
      })
    );
  } else {
    writeFileSync(
      path + file,
      JSON.stringify({
        address: contract.address,
        constructorArguments: args,
        libraries: libraries,
      })
    );
  }
}

export function getChoices(config: any[]) {
  let result = [];
  for (let i = 0; i < config.length; i++) {
    result.push({
      name: config[i].name,
      value: i,
    });
  }
  return result;
}

export type Network = {
  name: string;
  provider: JsonRpcProvider;
  wallet: Wallet;
  override: any;
  netConfig: any;
  networkIndex: number;
};

export async function setNetwork(
  config: any[],
  name: string = ""
): Promise<Network> {
  let override: any = {};
  const networkIndex = await select({
    message: `选择网络${green(name)}:`,
    choices: getChoices(config),
  });
  const privateKey = await password({
    message: `输入网络${green(name)}的Private Key:`,
    validate: (value = "") =>
      isBytesLike(value) || "Pass a valid Private Key value",
    mask: "*",
  });

  const provider = new JsonRpcProvider(config[networkIndex].rpc);
  const wallet = new Wallet(privateKey, provider);
  console.log("Signer:", yellow(wallet.address));

  const feeData = await provider.getFeeData();
  const defaultGasPrice = feeData.gasPrice;
  override.gasPrice = await input({
    message: "输入Gas price:",
    default: defaultGasPrice?.toString(),
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  const netConfig = config[networkIndex];
  return { name, provider, wallet, override, netConfig, networkIndex };
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
  override.nonce = await input({
    message: "输入nonce:",
    default: (
      await network.provider.getTransactionCount(network.wallet.address)
    ).toString(),
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  override.gasLimit = await contract[func].estimateGas(...args);
  console.log("gasLimit:", green(override.gasLimit.toString()));
  let receipt = await contract[func](...args, override);
  await receipt.wait();
  console.log(`${blue(func)} tx:`, yellow(receipt.hash));
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

  const factory = await ethers.getContractFactory(contract, network.wallet);

  const deployTx = await factory.getDeployTransaction(...args);
  override.gasLimit = await network.wallet.estimateGas(deployTx);
  console.log("gasLimit:", green(override.gasLimit.toString()));
  const deploy = await factory.deploy(...args, override);
  const deployed = await deploy.waitForDeployment();

  const addr = await deployed.getAddress();
  console.log(`${contract} deployed:`, yellow(addr));
  return deployed;
}

export async function getContractV2(
  ethers: HardhatEthersHelpers,
  rpc: string,
  contract: string,
  address: string
) {
  const provider = new JsonRpcProvider(rpc);
  const wallet = new Wallet(defaultPrivateKey, provider);

  return await ethers.getContractAt(contract, address, wallet);
}
