import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
// import "@openzeppelin/hardhat-upgrades";
import { compileSetting } from "./scripts/compilerConfig";
import "@nomicfoundation/hardhat-verify";

// const { setGlobalDispatcher, ProxyAgent } = require("undici");
// const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
// setGlobalDispatcher(proxyAgent);

const dotenv = require("dotenv");
dotenv.config();
export default {
  networks: {
    metertest: {
      url: `https://rpctest.meter.io`,
      chainId: 83,
      gasPrice: 500000000000,
      accounts: [],
    },
    meterstage: {
      url: `http://rpc-stage.meter.io`,
      chainId: 82,
      gasPrice: 500000000000,
      accounts: [],
    },
    metermain: {
      url: `https://rpc.meter.io`,
      chainId: 82,
      gasPrice: 500000000000,
      accounts: [],
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 11155111,
      gasPrice: 4000000000000,
      accounts: [],
    },
    ethereum: {
      url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // public infura endpoint
      chainId: 1,
      gasPrice: 4000000000000,
      accounts: [],
    },
    basetest: {
      url: `https://goerli.base.org`,
      chainId: 84531,
      accounts: [],
    },
    basemain: {
      url: `https://base.publicnode.com`,
      chainId: 8453,
      accounts: [],
    },
    arbitrum: {
      url: `https://arb1.arbitrum.io/rpc`,
      chainId: 42161,
      accounts: [],
    },
    beratest: {
      url: `https://bartio.rpc.berachain.com/`,
      chainId: 80084,
      accounts: [],
    },
    b2main: {
      url: "https://rpc.bsquared.network/",
      chainId: 223,
      ethNetwork: "b2main",
    },
  },
  sourcify: {
    enabled: false,
  },
  etherscan: {
    apiKey: {
      basemain: process.env.BASESCAN_API_KEY,
      ethereum: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      arbitrum: process.env.ARBISCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
      b2main: "no-api-key-needed",
    },
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
        network: "b2main",
        chainId: 223,
        urls: {
          apiURL: "https://explorer.bsquared.network/api",
          browserURL: "https://explorer.bsquared.network/",
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
