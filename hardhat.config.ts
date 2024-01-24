import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import { task } from "hardhat/config";
import { compileSetting } from "./scripts/deployTool";

import { deployContract } from "./scripts/helper";
import { ProxyOFT, ProxyOFT__factory } from "./typechain-types";
// import "@nomicfoundation/hardhat-verify";

// const { setGlobalDispatcher, ProxyAgent } = require("undici");
// const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
// setGlobalDispatcher(proxyAgent);

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

/* 
npx hardhat oft-proxy \
--lz 0x1381c573b97bf393a81fa42760dd21e109d8092b \
--pa 0x1381c573b97bf393a81fa42760dd21e109d8092b \
--admin 0x1381c573b97bf393a81fa42760dd21e109d8092b \
--network metermain
*/
task("oft-proxy", "deploy token proxy contract")
  .addParam("lz", "lz endpoint")
  .addParam("pa", "proxy admin")
  .addParam("admin", "contract admin")
  .setAction(async ({ lz, pa, admin }, { ethers, run, network }) => {
    await run("compile");
    const signers = await ethers.getSigners();

    const impl = (await deployContract(
      ethers,
      "ProxyOFT",
      network.name,
      signers[0],
      []
    )) as ProxyOFT;

    const data = impl.interface.encodeFunctionData("initialize", [lz, admin]);

    console.log("data:", data);
  });

/* 
npx hardhat oft-proxy-data \
--lz 0x1381c573b97bf393a81fa42760dd21e109d8092b \
--pa 0x1381c573b97bf393a81fa42760dd21e109d8092b \
--admin 0x1381c573b97bf393a81fa42760dd21e109d8092b \
--network metermain
*/
task("oft-proxy-data", "deploy token proxy contract")
  .addParam("lz", "lz endpoint")
  .addParam("pa", "proxy admin")
  .addParam("admin", "contract admin")
  .setAction(async ({ lz, pa, admin }, { ethers, run, network }) => {
    await run("compile");
    const signers = await ethers.getSigners();

    const impl = new ProxyOFT__factory();

    const data = impl.interface.encodeFunctionData("initialize", [lz, admin]);

    console.log("data:", data);
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
    sepolia: {
      url: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 11155111,
      gasPrice: 4000000000000,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    ethereum: {
      url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // public infura endpoint
      chainId: 1,
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
    basemain: {
      url: `https://base.publicnode.com`,
      chainId: 8453,
      accounts: [process.env.METER_TEST_PRIVKEY],
    },
    abitrum: {
      url: `https://arb1.arbitrum.io/rpc`,
      chainId: 42161,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
  },
  etherscan: {
    apiKey: process.env.BASESCAN_API_KEY,
    customChains: [
      {
        network: "arbitrum",
        chainId: 42161,
        urls: {
          apiURL: `https://api.arbiscan.io/api`,
          browserURL: "https://arbiscan.io/",
        },
      },
      {
        network: "goerli",
        chainId: 5,
        urls: {
          apiURL: `https://api-goerli.etherscan.io/api`,
          browserURL: "https://goerli.etherscan.io",
        },
      },
      {
        network: "basemain",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
  solidity: {
    compilers: [compileSetting("0.7.0", 200), compileSetting("0.8.19", 200)],
  },
  mocha: {
    timeout: 200000,
  },
};
