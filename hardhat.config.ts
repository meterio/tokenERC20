import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
// import "@openzeppelin/hardhat-upgrades";
import { compileSetting } from "./scripts/compilerConfig";
import "@nomicfoundation/hardhat-verify";

// const { setGlobalDispatcher, ProxyAgent } = require("undici");
// const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
// setGlobalDispatcher(proxyAgent);
// import "@matterlabs/hardhat-zksync";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-deploy";
// import "@matterlabs/hardhat-zksync-verify";

const dotenv = require("dotenv");
dotenv.config();
export default {
  defaultNetwork: "bsctest",
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
    arbitrumsepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      gasPrice: 500000000000,
    },
    basesepolia: {
      url: "https://sepolia.base.org",
      chainId: 84532,
      gasPrice: 500000000000,
    },
    sepolia: {
      url: `https://ethereum-sepolia.blockpi.network/v1/rpc/${process.env.BLOCKPI_SEPOLIA_KEY}`,
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
      url: `https://bartio.rpc.berachain.com`,
      chainId: 80084,
      accounts: [],
    },
    b2main: {
      url: "https://rpc.bsquared.network/",
      chainId: 223,
      ethNetwork: "b2main",
    },
    berabartio: {
      url: "https://bartio.rpc.berachain.com",
      chainId: 80084,
    },
    core: {
      url: "https://rpc.coredao.org/",
      chainId: 1116,
      ethNetwork: "core",
      txServiceUrl: "https://safe.coredao.org/txs",
    },
    coretest: {
      url: "https://rpc.test.btcs.network",
      chainId: 1115,
      ethNetwork: "core",
    },
    coretest2: {
      url: "https://rpc.test2.btcs.network",
      chainId: 1114,
      ethNetwork: "core",
    },
    merlin: {
      url: "https://merlin.blockpi.network/v1/rpc/public",
      chainId: 4200,
    },
    merlintest: {
      url: "https://testnet-rpc.merlinchain.io",
      chainId: 686868,
    },
    bsctest: {
      url: "https://bsc-testnet.public.blastapi.io",
      chainId: 97,
    },
    zklink: {
      url: "https://rpc.zklink.io",
      chainId: 810180,
      // safeTxServiceUrl: '',
      zksync: true,
      ethNetwork: "zklink",
      verifyURL: "https://explorer.zklink.io/contract_verification",
    },
    zklinksepolia: {
      url: "https://sepolia.rpc.zklink.io",
      chainId: 810181,
      zksync: true,
      ethNetwork: "sepolia",
      verifyURL: "https://sepolia.explorer.zklink.io/contract_verification",
      // safeTxServiceUrl: '',
    },
    zksyncsepolia: {
      url: "https://sepolia.era.zksync.dev",
      chainId: 300,
      zksync: true,
      ethNetwork: "sepolia",
    },
    monadtest: {
      url: "https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6",
      chainId: 10143,
    },
    beramain: {
      url: "https://rpc.berachain.com",
      chainId: 80094,
    },
    bitlayer: {
      url: "https://rpc.bitlayer.org",
      chainId: 200901,
      // safeTxServiceUrl: '',
      ethNetwork: "bitlayer",
      verifyURL: "https://api.btrscan.com/scan/api"
    }
  },
  sourcify: {
    enabled: false,
  },
  etherscan: {
    apiKey: {
      basemain: process.env.BASESCAN_API_KEY,
      ethereum: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      arbitrum: process.env.ARBISCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
      core: process.env.CORESCAN_API_KEY,
      b2main: "no-api-key-needed",
      merlin: "no-api-key-needed",
      beratest: "beratest", // apiKey is not required, just set a placeholder
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
      baseSepolia: process.env.BASESCAN_API_KEY,
      beramain: process.env.BERASCAN_API_KEY,
    },
    customChains: [
      {
        network: "beratest",
        chainId: 80084,
        urls: {
          apiURL:
            "https://api.routescan.io/v2/network/testnet/evm/80084/etherscan",
          browserURL: "https://bartio.beratrail.io/",
        },
      },
      {
        network: "arbitrum",
        chainId: 42161,
        urls: {
          apiURL: `https://api.arbiscan.io/api`,
          browserURL: "https://arbiscan.io/",
        },
      },
      {
        network: "core",
        chainId: 1116,
        urls: {
          apiURL: `https://openapi.coredao.org/api`,
          browserURL: "https://scan.coredao.org",
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
        network: "merlin",
        chainId: 4200,
        urls: {
          apiURL: "https://scan.merlinchain.io/api",
          browserURL: "https://scan.merlinchain.io",
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
      {
        network: "beramain",
        chainId: 80094,
        urls: {
          apiURL: "https://api.berascan.com/api",
          browserURL: "https://berascan.com/",
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
