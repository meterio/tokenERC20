import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import {
  Contract,
  Signer,
  BigNumber,
  ContractTransaction,
  BytesLike,
  BigNumberish,
  utils,
  constants,
  Overrides,
} from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { Libraries } from "hardhat/types";

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18));
}

export function BN(n: number): BigNumber {
  return BigNumber.from(n);
}
export const overrides: any = {
  gasLimit: 8000000,
};

export const MINTER_ROLE: BytesLike =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

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
    return constants.AddressZero;
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
  if (address == constants.AddressZero || network == "hardhat") {
    const factory = await ethers.getContractFactory(name, {
      signer: signer,
      libraries: libraries,
    });
    const contract = await factory.deploy(...args, overrides);
    console.log("Deploying:", name);
    console.log("  to", contract.address);
    console.log("  in", contract.deployTransaction.hash);
    await saveFile(network, name, contract, args, libraries);
    return contract.deployed();
  } else {
    console.log("Contract:", name);
    console.log("  on", address.white);
    return await ethers.getContractAt(name, address, signer);
  }
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
