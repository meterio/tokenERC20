import "hardhat-typechain";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import { task } from "hardhat/config";
import { Signer, utils } from "ethers";
import { compileSetting, allowVerifyChain } from "./scripts/deployTool";
import { RPCS } from "./scripts/network";

import {
  deployContract,
  BN,
  getContract,
  getContractJson,
  MINTER_ROLE,
  expandTo18Decimals
} from "./scripts/helper";
import { getSign } from "./scripts/permitSign"

import {
  ERC20MintablePauseable,
  ERC20MintablePauseableUpgradeable,
  PermitRouter,
  MeterERC20
} from './typechain'


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

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseableUpgradeable",
        getContract(network.name, "ERC20MintablePauseableUpgradeable"),
        signers[0]
      )) as ERC20MintablePauseableUpgradeable;
      let nonce = 1;
      let deadline = Math.floor(Date.now() / 1000) + 999;
      const chainId = network.name == "ganache" ? 1 : await signers[0].getChainId();

      let signature = await getSign(
        signers[0] as Signer,
        token.address,
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
      let pair = "0x0d7365300E85fC87EF4dA53aB05f1637dD4f73CC"; // MeterSwap LP Token (MLP:MTR-MTRG)
      let token0 = "0x5729cB3716a315d0bDE3b5e489163bf8b9659436"; // MTRG
      let token1 = "0x228ebBeE999c6a7ad74A6130E81b12f9Fe237Ba3"; // MTRG
      let token2 = "0x687A6294D0D6d63e751A059bf1ca68E4AE7B13E2"; // MTR
      const deployer = signers[0];

      const router = await deployContract(
        ethers,
        "PermitRouter",
        network.name,
        deployer,
        [pair, token0, token1, token2, 300]
      ) as PermitRouter;
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


      const router = (await ethers.getContractAt(
        "PermitRouter",
        getContract(network.name, "PermitRouter"),
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
          spender: router.address,
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
        router.address,
        value,
        nonce,
        deadline,
        chainId
      );

      console.log(
        {
          owner: deployer.address,
          spender: router.address,
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
export default {
  networks: {
    metertest: {
      url: `https://rpctest.meter.io`,
      chainId: 83,
      gasPrice: 500000000000,
      // accounts: [''],
    },
    metermain: {
      url: `https://rpc.meter.io`,
      chainId: 82,
      gasPrice: 500000000000,
      accounts: [process.env.MAINNET_CONTRACT_ADMIN_PRIVKEY],
    },


  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_APIKEY,
  },
  solidity: {
    compilers: [compileSetting("0.8.7", 200)],
  },
  mocha: {
    timeout: 200000,
  },
};
