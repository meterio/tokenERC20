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
  saveFile
} from "./scripts/helper";
import { getSign } from "./scripts/permitSign"

import {
  ERC20MintablePauseable,
  ERC20MintablePauseableUpgradeable,
  PermitRouter,
  PermitRouterV2,
  MeterERC20,
  SimpleERC20,
  MeterMaker,
  Exchange
} from './typechain'

const { setGlobalDispatcher, ProxyAgent } = require('undici')
const proxyAgent = new ProxyAgent('http://127.0.0.1:7890')
setGlobalDispatcher(proxyAgent)

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

task("approve", "approve contract")
  .addParam("token", "token address")
  .addParam("spender", "spender address")
  .addOptionalParam("amount", "amount", constants.MaxUint256, types.string)
  .addParam("rpc", "rpc connect")
  .addParam("pk", "proxy admin private key")
  .setAction(
    async ({ token, spender, amount, rpc, pk }, { ethers, run, network }) => {
      await run("compile");

      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const wallet = new ethers.Wallet(pk, provider);
      const t = await ethers.getContractAt("ERC20MintablePauseable", token, wallet) as ERC20MintablePauseable;
      let receipt = await t.approve(spender, amount);
      console.log("approve tx:", receipt.hash);

    }
  );

// npx hardhat upgrade --params ["USDT","USDT","1000000000000000000000000000","0xa5F1e2596DC1e878a6a039f41330d9A97c771bE9"] --network metermain
task("upgrade", "deploy upgrade contract")
  .addParam("contract", "contract name")
  .addParam("params", "params")
  .setAction(
    async ({ contract, params }, { ethers, run, network, upgrades }) => {
      await run("compile");
      const signers = await ethers.getSigners();

      const _token = await ethers.getContractFactory(contract)

      const token = await upgrades.deployProxy(_token, JSON.parse(params), {
        initializer: "initialize"
      });
      await token.deployed();

      console.log("Deploying:", contract);
      console.log("  to", token.address);
      console.log("  in", token.deployTransaction.hash);
      await saveFile(network.name, contract, token, [], {});
    }
  );
// npx hardhat deploy-upgrade --name "USDT" --symbol "USDT" --supply 1000000000000000000000000000 --owner 0xa5F1e2596DC1e878a6a039f41330d9A97c771bE9 --network metermain
task("deploy-upgrade", "deploy upgrade contract")
  .addParam("name", "Token name")
  .addParam("symbol", "Token symbol")
  .addParam("supply", "Token initialSupply require decimal")
  .addParam("owner", "Token will mint to owner address")
  .setAction(
    async ({ name, symbol, supply, owner }, { run }) => {
      await run("upgrade", {
        contract: "ERC20MintablePauseableUpgradeable", params: JSON.stringify([name,
          symbol,
          supply,
          owner])
      });
    }
  );
// npx hardhat deploy-system --network metermain
task("deploy-system", "deploy system contract")
  .setAction(
    async ({ }, { ethers, run, network, upgrades }) => {
      await run("upgrade", {
        contract: "MeterERC20Upgradeable", params: '[]'
      });
      await run("upgrade", {
        contract: "MeterGovERC20Upgradeable", params: '[]'
      });
    }
  );
// npx hardhat update --contract ERC20MintablePauseableUpgradeable --addresss <proxy contract address> --network metermain
task("update", "update contract")
  .addParam("contract", "contract name")
  .addParam("address", "proxy contract address")
  .setAction(
    async ({ contract, address }, { ethers, run, upgrades }) => {
      await run("compile");
      const contractFactory = await ethers.getContractFactory(contract)
      const instant = await upgrades.upgradeProxy(address, contractFactory);
      console.log("Contract address:", instant.address);
    }
  );
// npx hardhat update-mtrg --addresss <proxy contract address> --network metermain
task("update-mtrg", "update MTRG contract")
  .addParam("address", "proxy contract address")
  .setAction(
    async ({ address }, { run }) => {
      await run("update", {
        contract: "MeterGovERC20Upgradeable",
        address: address
      })
    }
  );
// npx hardhat deploy --name ttt --symbol ttt --supply 1000000000000000000000000 --owner 0x319a0cfD7595b0085fF6003643C7eD685269F851 --network metermain
task("deploy", "deploy contract")
  .addParam("name", "Token name")
  .addParam("symbol", "Token symbol")
  .addParam("supply", "Token initialSupply require decimal")
  .addParam("owner", "Token will mint to owner address")
  .setAction(
    async ({ name, symbol, supply, owner }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();

      const token = await deployContract(
        ethers,
        "ERC20MintablePauseable",
        network.name,
        signers[0],
        [name, symbol, supply, owner]
      ) as ERC20MintablePauseable;

    }
  );
// npx hardhat setBlackList --account 0x319a0cfD7595b0085fF6003643C7eD685269F851 --network metermain
task("setBlackList", "set BlackList")
  .addParam("account", "black list account")
  .setAction(
    async ({ account }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseableUpgradeable",
        getContract(network.name, "ERC20MintablePauseableUpgradeable"),
        signers[0]
      )) as ERC20MintablePauseableUpgradeable;

      await token.setBlackList(account);
    }
  );
// npx hardhat getBlackList --account 0x319a0cfD7595b0085fF6003643C7eD685269F851 --network metermain
task("getBlackList", "get BlackList")
  .addParam("account", "black list account")
  .setAction(
    async ({ account }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseableUpgradeable",
        getContract(network.name, "ERC20MintablePauseableUpgradeable"),
        signers[0]
      )) as ERC20MintablePauseableUpgradeable;

      let result = await token.getBlackList(account);
      console.log(result);
    }
  );
// npx hardhat mint --to 0x319a0cfD7595b0085fF6003643C7eD685269F851 --amount 10000000000000000000000 --network metermain
task("mint", "mint token")
  .addParam("to", "mint to address")
  .addParam("amount", "mint amount")
  .setAction(
    async ({ to, amount }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseableUpgradeable",
        getContract(network.name, "ERC20MintablePauseableUpgradeable"),
        signers[0]
      )) as ERC20MintablePauseableUpgradeable;

      await token.mint(to, amount);
    }
  );
// npx hardhat pause
task("pause", "pause contract")
  .setAction(
    async (taskArgs, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseableUpgradeable",
        getContract(network.name, "ERC20MintablePauseableUpgradeable"),
        signers[0]
      )) as ERC20MintablePauseableUpgradeable;

      await token.pause();
    }
  );
// npx hardhat unpause
task("unpause", "unpause contract")
  .setAction(
    async (taskArgs, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseableUpgradeable",
        getContract(network.name, "ERC20MintablePauseableUpgradeable"),
        signers[0]
      )) as ERC20MintablePauseableUpgradeable;

      await token.unpause();
    }
  );
// npx hardhat grant --account 0x319a0cfD7595b0085fF6003643C7eD685269F851 --network metermain
task("grant", "grant minter Role")
  .addParam("account", "account")
  .setAction(
    async ({ account }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseableUpgradeable",
        getContract(network.name, "ERC20MintablePauseableUpgradeable"),
        signers[0]
      )) as ERC20MintablePauseableUpgradeable;

      await token.grantRole(MINTER_ROLE, account);
    }
  );
// npx hardhat revoke --account 0x319a0cfD7595b0085fF6003643C7eD685269F851 --network metermain
task("revoke", "revoke minter Role")
  .addParam("account", "account")
  .setAction(
    async ({ account }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseableUpgradeable",
        getContract(network.name, "ERC20MintablePauseableUpgradeable"),
        signers[0]
      )) as ERC20MintablePauseableUpgradeable;

      await token.revokeRole(MINTER_ROLE, account);
    }
  );
// npx hardhat info --network metermain
task("info", "token info")
  .setAction(
    async ({ }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseableUpgradeable",
        getContract(network.name, "ERC20MintablePauseableUpgradeable"),
        signers[0]
      )) as ERC20MintablePauseableUpgradeable;

      console.log("name:", await token.name());
      console.log("symbol:", await token.symbol());
      console.log("totalSupply:", await token.totalSupply());
    }
  );
// npx hardhat permit --spender 0x319a0cfD7595b0085fF6003643C7eD685269F851 --value 10000000000000000000000 --network metermain
task("permit", "revoke minter Role")
  .addParam("spender", "spender")
  .addParam("value", "value")
  .setAction(
    async ({ spender, value }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();
      const tokenAddr = getContract(network.name, "ERC20MintablePauseableUpgradeable");

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseableUpgradeable",
        tokenAddr,
        signers[0]
      )) as ERC20MintablePauseableUpgradeable;
      const nonce = (await token.nonces(signers[0].address)).toNumber();
      let deadline = Math.floor(Date.now() / 1000) + 999;
      const chainId = network.name == "ganache" ? 1 : await signers[0].getChainId();

      let signature = await getSign(
        signers[0] as Signer,
        tokenAddr,
        signers[0].address,
        spender,
        value,
        nonce,
        deadline,
        chainId
      );
      let receipt = await token.permit(
        signers[0].address,
        spender,
        value,
        deadline,
        signature
      );
      console.log(await receipt.wait());
    }
  );
// npx hardhat veri
task("veri", "verify contracts").setAction(
  async ({ }, { ethers, run, network }) => {
    if (allowVerifyChain.indexOf(network.name) > -1) {
      await run(
        "verify:verify",
        getContractJson(network.name, "ERC20MintablePauseableUpgradeable")
      );
    }
  }
);

task("cf", "contracts factory").setAction(
  async ({ }, { ethers, run, network }) => {
    const [wallet] = await ethers.getSigners();

    await wallet.sendTransaction({
      to: "0xea94f5adc525050c8d48303453df4a2d0c1922d9",
      value: utils.parseEther("0.032"),
      nonce: BN(0)
    })
    let code = "0x601f80600e600039806000f350fe60003681823780368234f58015156014578182fd5b80825250506014600cf3"
    let tx = "0xf87f8085174876e800830186a08080ad601f80600e600039806000f350fe60003681823780368234f58015156014578182fd5b80825250506014600cf3011ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222"
    let receipt = await ethers.provider.sendTransaction(tx);
    console.log(await receipt.wait());
    let BYTECODE = "0x6080604052348015600f57600080fd5b5060848061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063c3cafc6f14602d575b600080fd5b6033604f565b604051808260ff1660ff16815260200191505060405180910390f35b6000602a90509056fea165627a7a72305820ab7651cb86b8c1487590004c2444f26ae30077a6b96c6bc62dda37f1328539250029"

    let address = await wallet.call({
      to: "0x26db0703e359696c4d99f8279ffd59000761c575",
      data: BYTECODE
    })
    console.log("address: ", address);
    receipt = await wallet.sendTransaction({
      to: "0x26db0703e359696c4d99f8279ffd59000761c575",
      data: BYTECODE
    })
    console.log(await receipt.wait());
    let result = await wallet.call({
      to: address,
      data: "0xc3cafc6f"
    })
    console.log(result);
  }
);

// npx hardhat deployRouter --network metermain
task("deployRouter", "gas less swap")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      // Testnet
      // let pair = "0x87d244897695a5a0481057f217dbadda5c8d6a7e"; // MeterSwap LP Token (MLP:MTR-MTRG)
      // let token0 = "0x69d0E2BDC045A57cd0304A5a831E43651B4050FD"; // MTRG
      // let token1 = "0x8A419Ef4941355476cf04933E90Bf3bbF2F73814"; // MTRG
      // let token2 = "0x4cb6cef87d8cadf966b455e8bd58fff32aba49d1"; // MTR    
      // Mainnet  
      let pair = "0xf803f4432d6b85bc7525f85f7a9cf7398b5ebe7d"; // VolatileV1 AMM - WMTR/MTRG (vAMM-WMTR/MTRG)
      let token0 = "0x228ebBeE999c6a7ad74A6130E81b12f9Fe237Ba3"; // MTRG
      let token1 = "0x160361ce13ec33C993b5cCA8f62B6864943eb083"; // WMTR
      const deployer = signers[0];

      const router = await deployContract(
        ethers,
        "PermitRouter",
        network.name,
        deployer,
        [pair, token0, token1, 300]
      ) as PermitRouter;

    });

// npx hardhat dr2 --network metermain
task("dr2", "gas less swap")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      // Testnet
      // let tokenIn = "0xe8876830e7cc85dae8ce31b0802313caf856886f"; // weth
      // let wmtr = "0xfac315d105e5a7fe2174b3eb1f95c257a9a5e271"; // wmtr
      // let path = [
      //   "0x97ba33a5e37de9df6d7ad24518a1a03b50b58172", // weth/mtrg
      //   "0x425b00d2b14df1744423441b6ed2d46b1bc36c63" // mtrg/wmtr
      // ];
      // // Mainnet  
      let tokenIn = "0x983147fb73a45fc7f8b4dfa1cd61bdc7b111e5b6"; // weth
      let wmtr = "0x160361ce13ec33C993b5cCA8f62B6864943eb083"; // WMTR
      let path = [
        "0x1211650c69649222340672d35c6b8f9aca93564d", // weth/mtrg
        "0xf803f4432d6b85bc7525f85f7a9cf7398b5ebe7d" // mtrg/wmtr
      ];
      const deployer = signers[0];

      const router = await deployContract(
        ethers,
        "PermitRouterV2",
        network.name,
        deployer,
        [300, tokenIn, wmtr, path]
      ) as PermitRouterV2;

      console.log("getAmountsOut:", await router.getAmountsOut('1000000000000000000'));
    });

// npx hardhat deployRouter --network metermain
task("metermaker", "deploy MeterMaker")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      // Mainnet  
      let vault = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"; // Black hole
      let pair = "0xf803f4432d6b85bc7525f85f7a9cf7398b5ebe7d"; // VolatileV1 AMM - WMTR/MTRG (vAMM-WMTR/MTRG)
      let token1 = "0x160361ce13ec33C993b5cCA8f62B6864943eb083"; // MTR
      let token0 = "0x228ebBeE999c6a7ad74A6130E81b12f9Fe237Ba3"; // MTRG
      const deployer = signers[0];

      const router = await deployContract(
        ethers,
        "MeterMaker",
        network.name,
        deployer,
        [vault, pair, token0, token1]
      ) as MeterMaker;

    });
// npx hardhat gasLess --network metermain
task("gasLess", "gas less swap")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      let pair = "0x87d244897695a5a0481057f217dbadda5c8d6a7e"; // MeterSwap LP Token (MLP:MTR-MTRG)
      let token0 = "0x69d0E2BDC045A57cd0304A5a831E43651B4050FD"; // MTRG
      let token1 = "0x8A419Ef4941355476cf04933E90Bf3bbF2F73814"; // MTRG
      let token2 = "0x4cb6cef87d8cadf966b455e8bd58fff32aba49d1"; // MTR
      const deployer = signers[0];

      // const router = await deployContract(
      //   ethers,
      //   "PermitRouter",
      //   network.name,
      //   deployer,
      //   [pair, token0, token1, token2]
      // ) as PermitRouter;
      const routerAddr = getContract(network.name, "PermitRouter");

      const router = (await ethers.getContractAt(
        "PermitRouter",
        routerAddr,
        deployer
      )) as PermitRouter;

      let token = (await ethers.getContractAt(
        "MeterGovERC20",
        token0,
        deployer
      )) as MeterERC20;

      const nonce = (await token.nonces(deployer.address)).toNumber();
      const deadline = Math.floor(Date.now() / 1000) + 999;
      const chainId = network.name == "ganache" ? 1 : await signers[0].getChainId();
      const value = expandTo18Decimals(1);

      console.log(
        {
          signer: deployer.address,
          token: token0,
          owner: deployer.address,
          spender: routerAddr,
          value: value.toString(),
          nonce: nonce,
          deadline: deadline,
          chainId: chainId
        }
      )

      let signature = await getSign(
        deployer as Signer,
        token0,
        deployer.address,
        routerAddr,
        value,
        nonce,
        deadline,
        chainId
      );

      console.log(
        {
          owner: deployer.address,
          spender: routerAddr,
          value: value.toString(),
          deadline: deadline,
          signature: signature
        }
      )

      // let receipt = await token.estimateGas.permit(
      //   deployer.address,
      //   router.address,
      //   value,
      //   deadline,
      //   signature
      // );

      let receipt = await router.swapExactTokensForTokens(
        deployer.address,
        value,
        0,
        deadline,
        signature
      )
      console.log(await receipt.wait());
    }
  );

// npx hardhat gl2 --network metermain
task("gl2", "gas less swap")
  .setAction(
    async ({ contract }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];

      const routerAddr = getContract(network.name, "PermitRouterV2");

      const router = (await ethers.getContractAt(
        "PermitRouterV2",
        routerAddr,
        deployer
      )) as PermitRouterV2;
      const tokenIn = await router.tokenIn();

      let token = (await ethers.getContractAt(
        "MeterGovERC20",
        tokenIn,
        deployer
      )) as MeterERC20;

      const nonce = (await token.nonces(deployer.address)).toNumber();
      const deadline = Math.floor(Date.now() / 1000) + 999;
      const chainId = network.name == "ganache" ? 1 : await signers[0].getChainId();
      const value = BigNumber.from('500000000000000');

      let signature = await getSign(
        deployer as Signer,
        tokenIn,
        deployer.address,
        routerAddr,
        value,
        nonce,
        deadline,
        chainId
      );

      console.log(
        {
          owner: deployer.address,
          spender: routerAddr,
          value: value.toString(),
          deadline: deadline,
          signature: signature
        }
      )

      // let gas = await router.estimateGas.swapExactTokensForTokens(
      //   deployer.address,
      //   value,
      //   0,
      //   deadline,
      //   signature
      // )
      // console.log(gas.toString());

      let receipt = await router.swapExactTokensForTokens(
        deployer.address,
        value,
        0,
        deadline,
        signature
      )
      console.log(await receipt.wait());
    }
  );
task("deploy-simple", "deploy contract")
  .addParam("name", "Token name")
  .addParam("symbol", "Token symbol")
  .addParam("supply", "Token initialSupply require decimal")
  .setAction(
    async ({ name, symbol, supply }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();

      const token = await deployContract(
        ethers,
        "SimpleERC20",
        network.name,
        signers[0],
        [name, symbol, supply]
      ) as SimpleERC20;

    }
  );
task("de", "deploy Exchange")
  .setAction(
    async ({ name, symbol, supply }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const _tokenIn = "0xe6a991ffa8cfe62b0bf6bf72959a3d4f11b2e0f5";
      const _tokenOut = "0xae6f0539e33f624ac685cce9ba57cc1d948d909d";
      const _exchangeRate = 10300

      const token = await deployContract(
        ethers,
        "Exchange",
        network.name,
        signers[0],
        [_tokenIn, _tokenOut, _exchangeRate]
      ) as Exchange;

    }
  );
export default {
  networks: {
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
      accounts: [process.env.MAINNET_CONTRACT_ADMIN_PRIVKEY],
    },
    theta: {
      url: `https://eth-rpc-api.thetatoken.org/rpc`,
      chainId: 361,
      gasPrice: 4000000000000,
      accounts: [process.env.THETA_ADMIN_PRIVKEY],
    },
    ganache: {
      url: `http:127.0.0.1:7545`,
      chainId: 1337,
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
    }

  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_APIKEY,
  },
  solidity: {
    compilers: [compileSetting("0.8.11", 200)],
  },
  mocha: {
    timeout: 200000,
  },
};
