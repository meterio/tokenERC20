import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
// import "@openzeppelin/hardhat-upgrades";
import { compileSetting } from "./scripts/compilerConfig";
// import "@nomicfoundation/hardhat-verify";
import "@matterlabs/hardhat-zksync";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-verify";

// const { setGlobalDispatcher, ProxyAgent } = require("undici");
// const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
// setGlobalDispatcher(proxyAgent);

const dotenv = require("dotenv");
dotenv.config();
export default {
  defaultNetwork: "zklink",
  networks: {
    zklink: {
      url: "https://rpc.zklink.io",
      chainId: 810180,
      // safeTxServiceUrl: '',
      zksync: true,
      ethNetwork: "mainnet",
      verifyURL: "https://explorer.zklink.io/contract_verification",
    },
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
  },
  etherscan: {
    apiKey: {
      basemain: process.env.BASESCAN_API_KEY,
      ethereum: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      arbitrum: process.env.ARBISCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
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
  zksolc: {
    version: "1.3.22", // optional.
    settings: {
      // compilerPath: 'zksolc', // optional. Ignored for compilerSource "docker". Can be used if compiler is located in a specific folder
      // missingLibrariesPath: './.zksolc-libraries-cache/missingLibraryDependencies.json', // optional. This path serves as a cache that stores all the libraries that are missing or have dependencies on other libraries. A `hardhat-zksync-deploy` plugin uses this cache later to compile and deploy the libraries, especially when the `deploy-zksync:libraries` task is executed
      enableEraVMExtensions: false, // optional.  Enables Yul instructions available only for ZKsync system contracts and libraries. In the older versions of the plugin known as 'isSystem' flag
      forceEVMLA: false, // Compile with EVM legacy assembly codegen. In the older versions of the plugin known as a 'forceEvmla' flag
      optimizer: {
        enabled: true, // optional. True by default
        mode: "z", // optional. 3 by default, z to optimize bytecode size
        fallback_to_optimizing_for_size: false, // optional. Try to recompile with optimizer mode "z" if the bytecode is too large
      },
    },
  },
  mocha: {
    timeout: 200000,
  },
};
