import {
  BaseContract,
  Wallet,
  JsonRpcProvider,
  Overrides,
  isBytesLike,
  isAddress,
  Signer,
} from "ethers";
import { HardhatEthersHelpers } from "@nomicfoundation/hardhat-ethers/types";
import { input, select, password, confirm } from "@inquirer/prompts";
import colors from "colors";
import {
  getNetworkChoicesFromHardhat,
  loadNetConfigFromHardhat,
  capitalizeFirstLetter,
  yellow,
  green,
  blue,
  loadNetConfig,
} from "./helper";
import Safe from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  OperationType,
} from "@safe-global/safe-core-sdk-types";
import SafeApiKit from "@safe-global/api-kit";

colors.enable();

export const equalIgnoreCase = (a: string, b: string) => {
  return a.toLowerCase() == b.toLowerCase();
};

import * as SAFE_WALLETS from "./safe_wallets.json";

// eslint-disable-next-line @typescript-eslint/no-redeclare
interface BigInt {
  /** Convert to BigInt to string form in JSON.stringify */
  toJSON: () => string;
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export class SafeHelper {
  ethersHelper!: HardhatEthersHelpers;
  apiKit!: SafeApiKit;
  safeAddress!: string;
  safe!: Safe;
  provider!: JsonRpcProvider;
  signer!: Signer;
  calls: string[] = [];
  transactions: MetaTransactionData[] = [];
  netConfig!: any;
  addressMap!: { [key: string]: string };
  createCall?: BaseContract;

  constructor() {}

  async init(ethersHelper: HardhatEthersHelpers) {
    this.ethersHelper = ethersHelper;
    const networkName = await select({
      message: `选择网络:`,
      choices: getNetworkChoicesFromHardhat(),
    });
    let privateKey = "";
    const envName = `${networkName.toUpperCase()}_PRIVKEY`;
    if (envName in process.env) {
      privateKey = process.env[envName]!;
    }
    let answer = "no";
    if (privateKey) {
      let wallet = new Wallet(privateKey);
      const addr = await wallet.getAddress();
      answer = await select({
        message: `使用 ${blue(networkName.toUpperCase() + "_PRIVKEY")} env中配置的Signer: ${yellow(addr)}`,
        choices: [
          { name: "Yes", value: "yes" },
          { name: "No", value: "no" },
        ],
      });
    }
    if (!privateKey || answer == "no") {
      privateKey = await password({
        message: `输入网络${green(networkName)}的Private Key:`,
        validate: (value = "") =>
          isBytesLike(value) || "Pass a valid Private Key value",
        mask: "*",
      });
    }
    const safeAddress = await input({
      message: `输入网络 ${green(networkName)} 的Safe Wallet地址:`,
      validate: (value = "") => isAddress(value) || "Pass a valid address",
      default: SAFE_WALLETS[networkName as keyof typeof SAFE_WALLETS] || "",
    });
    this.safeAddress = safeAddress;
    this.netConfig = {
      ...loadNetConfigFromHardhat(networkName),
      ...loadNetConfig(networkName),
      name: networkName,
    };
    const provider = new JsonRpcProvider(this.netConfig.url);
    const wallet = new Wallet(privateKey, provider);
    this.provider = provider;
    this.signer = wallet;
    console.log("Signer:", yellow(wallet.address));
    const defaultGasPrice = (await provider.getFeeData()).gasPrice;

    this.safe = await Safe.init({
      provider: this.netConfig.url,
      signer: privateKey,
      safeAddress,
      contractNetworks: {
        "223": {
          safeSingletonAddress: "0x76667330c237Fb40f28d74563cdAAae4b06C23Ec",
          safeProxyFactoryAddress: "0xd9d2Ba03a7754250FDD71333F444636471CACBC4",
          createCallAddress: "0x8BbCaE989A0Bdf15c8E783357a0E5848e36233d0",
          multiSendAddress: "0x7B21BBDBdE8D01Df591fdc2dc0bE9956Dde1e16C",
          multiSendCallOnlyAddress:
            "0x32228dDEA8b9A2bd7f2d71A958fF241D79ca5eEC",
          signMessageLibAddress: "0x309C7b0A0D2f250Be322739753386911E1187C4E",
          fallbackHandlerAddress: "0xcB4a8d3609A7CCa2D9c063a742f75c899BF2f7b5",
          simulateTxAccessorAddress:
            "0xB59bD9861a97F9c309B7b73338503507580625D2",
          safeWebAuthnSignerFactoryAddress: "",
          safeWebAuthnSharedSignerAddress: "",
        },
        "4200": {
          safeSingletonAddress: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
          safeProxyFactoryAddress: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
          createCallAddress: "0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4",
          multiSendAddress: "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761",
          multiSendCallOnlyAddress:
            "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
          signMessageLibAddress: "0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2",
          fallbackHandlerAddress: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
          simulateTxAccessorAddress:
            "0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da",
          safeWebAuthnSignerFactoryAddress: "",
          safeWebAuthnSharedSignerAddress: "",
        },
      },
    });

    const txServiceUrl =
      this.netConfig.chainId == 82
        ? "https://safe.meter.io/txs/api"
        : this.netConfig.chainId == 810180
          ? "https://transaction.safe.zklink.io/api"
          : this.netConfig.chainId == 223
            ? "https://safe-gateway.bsquared.network/txs/api"
            : this.netConfig.chainId == 4200
              ? "https://safewallet.merlinsecurity.io/txs/api"
              : this.netConfig.chainId == 1116
                ? "https://safetx.coredao.org/api"
                : undefined;
    console.log(`txServiceUrl: ${txServiceUrl}`);
    this.apiKit = new SafeApiKit({
      chainId: BigInt(this.netConfig.chainId),
      txServiceUrl,
    });
  }

  async appendSafeTxForCall(
    contract: BaseContract,
    funcName: string,
    args: any[],
    override: Overrides = {}
  ): Promise<MetaTransactionData> {
    const func = contract.getFunction(funcName);
    const data = contract.interface.encodeFunctionData(func.fragment, args);
    const safeTx = {
      to: await contract.getAddress(),
      value: String(override.value || "0"),
      data,
      operation: OperationType.Call,
    };
    const argStrs = args.map((a) => String(a));
    console.log(
      `append safe call ${this.transactions.length + 1}: ${await contract.getAddress()}.${funcName}(${argStrs.join(
        ", "
      )})`
    );
    const addr = await contract.getAddress();
    this.calls.push(`call ${addr}.${funcName}(${argStrs.join(", ")})`);
    this.transactions.push(safeTx);
    return safeTx;
  }

  async proposeSafeTx() {
    if (this.transactions.length <= 0) {
      return;
    }
    console.log(`Propose safe tx with:`);
    for (let i = 0; i < this.calls.length; i++) {
      console.log(`${i + 1}: ${this.calls[i]}`);
    }
    const yes = await confirm({
      message: `确定提交至 ${yellow(this.netConfig.name)} 吗？`,
      default: true,
    });
    if (yes) {
      const safeTransaction = await this.safe.createTransaction({
        transactions: this.transactions,
      });

      const safeTxHash = await this.safe.getTransactionHash(safeTransaction);
      const signature = await this.safe.signHash(safeTxHash);

      const proposeData = {
        safeAddress: await this.safe.getAddress(),
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: await this.signer.getAddress(),
        senderSignature: signature.data,
      };
      console.log(`propose data: ${JSON.stringify(proposeData, null, 2)}`);

      // Propose transaction to the service
      await this.apiKit.proposeTransaction(proposeData);
    }
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getAddress(name: string) {
    if (name == "owner" || name == "admin" || name == "_admin") {
      return this.safeAddress;
    }
    const cleanName = name.replace(/^_+|_+$/g, "");
    const capName = capitalizeFirstLetter(cleanName);

    if (cleanName in this.addressMap) {
      return this.addressMap[cleanName];
    }
    if (capName in this.addressMap) {
      return this.addressMap[capName];
    }
  }
}
