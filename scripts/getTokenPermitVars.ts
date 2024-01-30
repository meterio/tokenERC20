import { input } from "@inquirer/prompts";
import { ethers, network } from "hardhat";
import { selectNetwork, sendTransaction } from "./helper";
import { isAddress } from "ethers";
import { getSign } from "./permitSign";

const main = async () => {
  const srcNetwork = await selectNetwork("Src");
  let { provider } = srcNetwork;
  const { chainId } = provider._network;

  const tokenAddress = await input({
    message: "输入Token地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const token = await ethers.getContractAt(
    "ERC20MinterBurnerPauserPermitForReplacement",
    tokenAddress
  );

  /*
  bytes32 public _CACHED_DOMAIN_SEPARATOR;
  uint256 public _CACHED_CHAIN_ID;

  bytes32 public _HASHED_NAME;
  bytes32 public _HASHED_VERSION;
  bytes32 public _TYPE_HASH;
  */
  // const domainSeparator = await token._CACHED_DOMAIN_SEPARATOR();
  // const cachedChainId = await token._CACHED_CHAIN_ID();
  // const hashedName = await token._HASHED_NAME();
  // const hashedVersion = await token._HASHED_VERSION();
  // const typeHash = await token._TYPE_HASH();
  const permitHash = await token._PERMIT_TYPEHASH();
  // const chainid = await token._getChainId();

  // console.log(`domainSeparator: ${domainSeparator}`);
  // console.log(`cachedChainId: ${cachedChainId}`);
  // console.log(`hashedName: ${hashedName}`);
  // console.log(`hashedVersion: ${hashedVersion}`);
  // console.log(`typeHash: ${typeHash}`);
  console.log(`_PERMIT_TYPEHASH: ${permitHash}`);
  // console.log(`chainId: `, chainid);
};

main();
