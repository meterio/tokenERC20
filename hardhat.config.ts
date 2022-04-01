import "hardhat-typechain";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { task } from "hardhat/config";
import { ContractTransaction, BytesLike, utils, Signer } from "ethers";
import { compileSetting, allowVerifyChain } from "./scripts/deployTool";
import { RPCS } from "./scripts/network";

import {
  deployContract,
  BN,
  getContract,
  getContractJson,
  MINTER_ROLE,
} from "./scripts/helper";
import { getSign } from "./scripts/permitSign"

import { ERC20MintablePauseable, ERC20MintablePauseableUpgradeable } from './typechain'
import { makeUpgradeProxy } from "@openzeppelin/hardhat-upgrades/dist/upgrade-proxy";


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

// npx hardhat deploy --name ttt --symbol ttt --supply 1000000000000000000000000 --owner 0x319a0cfD7595b0085fF6003643C7eD685269F851
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
      ) as ERC20MintablePauseableUpgradeable;

    }
  );
// npx hardhat setBlackList --account 0x319a0cfD7595b0085fF6003643C7eD685269F851
task("setBlackList", "set BlackList")
  .addParam("account", "black list account")
  .setAction(
    async ({ account }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseable",
        getContract(network.name, "ERC20MintablePauseable"),
        signers[0]
      )) as ERC20MintablePauseable;

      await token.setBlackList(account);
    }
  );
// npx hardhat getBlackList --account 0x319a0cfD7595b0085fF6003643C7eD685269F851
task("getBlackList", "get BlackList")
  .addParam("account", "black list account")
  .setAction(
    async ({ account }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseable",
        getContract(network.name, "ERC20MintablePauseable"),
        signers[0]
      )) as ERC20MintablePauseable;

      await token.getBlackList(account);
    }
  );
// npx hardhat mint --to 0x319a0cfD7595b0085fF6003643C7eD685269F851 amount 10000000000000000000000
task("mint", "mint token")
  .addParam("to", "mint to address")
  .addParam("amount", "mint amount")
  .setAction(
    async ({ to, amount }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseable",
        getContract(network.name, "ERC20MintablePauseable"),
        signers[0]
      )) as ERC20MintablePauseable;

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
        "ERC20MintablePauseable",
        getContract(network.name, "ERC20MintablePauseable"),
        signers[0]
      )) as ERC20MintablePauseable;

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
        "ERC20MintablePauseable",
        getContract(network.name, "ERC20MintablePauseable"),
        signers[0]
      )) as ERC20MintablePauseable;

      await token.unpause();
    }
  );
// npx hardhat grant --account 0x319a0cfD7595b0085fF6003643C7eD685269F851
task("grant", "grant minter Role")
  .addParam("account", "account")
  .setAction(
    async ({ account }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseable",
        getContract(network.name, "ERC20MintablePauseable"),
        signers[0]
      )) as ERC20MintablePauseable;

      await token.grantRole(MINTER_ROLE, account);
    }
  );
// npx hardhat revoke --account 0x319a0cfD7595b0085fF6003643C7eD685269F851
task("revoke", "revoke minter Role")
  .addParam("account", "account")
  .setAction(
    async ({ account }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseable",
        getContract(network.name, "ERC20MintablePauseable"),
        signers[0]
      )) as ERC20MintablePauseable;

      await token.revokeRole(MINTER_ROLE, account);
    }
  );
// npx hardhat permit --spender 0x319a0cfD7595b0085fF6003643C7eD685269F851 --value 10000000000000000000000
task("permit", "revoke minter Role")
  .addParam("spender", "spender")
  .addParam("value", "value")
  .setAction(
    async ({ spender, value }, { ethers, run, network }) => {

      await run("compile");
      const signers = await ethers.getSigners();

      let token = (await ethers.getContractAt(
        "ERC20MintablePauseable",
        getContract(network.name, "ERC20MintablePauseable"),
        signers[0]
      )) as ERC20MintablePauseable;
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
        getContractJson(network.name, "ERC20MintablePauseable")
      );
    }
  }
);

export default {
  networks: RPCS,
  etherscan: {
    apiKey: process.env.ETHERSCAN_APIKEY,
  },
  solidity: {
    compilers: [compileSetting("0.8.4", 200)],
  },
  mocha: {
    timeout: 200000,
  },
};
