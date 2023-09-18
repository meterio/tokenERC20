import "hardhat-typechain";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import { task, types } from "hardhat/config";
import { BigNumber, constants, Signer, utils } from "ethers";
import { compileSetting, allowVerifyChain } from "./scripts/deployTool";
import { RPCS } from "./scripts/network";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";

import {
  deployContract,
  BN,
  getContract,
  getContractJson,
  MINTER_ROLE,
  expandTo18Decimals,
  saveFile,
  deployContractOverrides,
} from "./scripts/helper";
import { getSign } from "./scripts/permitSign";

const { setGlobalDispatcher, ProxyAgent } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

const dotenv = require("dotenv");
dotenv.config();
// import Colors = require("colors.ts");
// Colors.enable();

task("accounts", "Prints the list of accounts", async (taskArgs, bre) => {
  const accounts = await bre.ethers.getSigners();

  for (const account of accounts) {
    let address = await account.getAddress();
    console.log(
      address,
      (await bre.ethers.provider.getBalance(address)).toString()
    );
  }
});

export default {
  networks: {
    metertest: {
      url: `https://rpctest.meter.io`,
      chainId: 83,
      gasPrice: 500000000000,
      accounts: [process.env.METER_TEST_PRIVKEY],
    },
    metermain: {
      url: `https://rpc.meter.io`,
      chainId: 82,
      gasPrice: 500000000000,
      accounts: [process.env.MAINNET_CONTRACT_ADMIN_PRIVKEY],
    },
    theta: {
      url: `https://eth-rpc-api.thetatoken.org/rpc`,
      chainId: 361,
      gasPrice: 4000000000000,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    basetest: {
      url: `https://goerli.base.org`,
      chainId: 84531,
      accounts: [process.env.METER_TEST_PRIVKEY],
    },
    ganache: {
      url: `http:127.0.0.1:7545`,
      chainId: 1337,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_APIKEY,
  },
  solidity: {
    compilers: [compileSetting("0.8.19", 200)],
  },
  mocha: {
    timeout: 200000,
  },
};
