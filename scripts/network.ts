const dotenv = require("dotenv");
dotenv.config();
export const RPCS = {
  hardhat: {
    allowUnlimitedContractSize: false,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  ganache: {
    url: `http://127.0.0.1:7545`,
    chainId: 1337,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  goerli: {
    url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  sepolia: {
    url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  bsctest: {
    url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
    chainId: 97,
    gasPrice: 20000000000,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  bscmain: {
    url: `https://bsc-dataseed.binance.org`,
    chainId: 56,
    gasPrice: 20000000000,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  metertest: {
    url: `https://rpctest.meter.io`,
    chainId: 83,
    gasPrice: 500000000000,
    accounts: [process.env.TESTNET_CONTRACT_ADMIN_PRIVKEY],
  },
  metermain: {
    url: `https://rpc.meter.io`,
    chainId: 82,
    gasPrice: 500000000000,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  polygon: {
    url: `https://rpc-mainnet.maticvigil.com`,
    chainId: 137,
    gasPrice: 5000000000,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  mumbai: {
    url: `https://rpc-mumbai.maticvigil.com`,
    chainId: 80001,
    gasPrice: 1000000000,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  ftmtest: {
    url: `https://rpc.testnet.fantom.network`,
    chainId: 4002,
    gasPrice: 20000000000,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  ftmmain: {
    url: `https://rpcapi.fantom.network`,
    chainId: 250,
    gasPrice: 60000000000,
    accounts: {
      mnemonic: process.env.MNEMONIC,
    },
  },
  abitrum: {
    url: `https://arb1.arbitrum.io/rpc`,
    chainId: 42161,
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
};
