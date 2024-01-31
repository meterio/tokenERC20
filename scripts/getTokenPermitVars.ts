import { input } from "@inquirer/prompts";
import { ethers, network } from "hardhat";
import { selectNetwork, sendTransaction } from "./helper";
import { isAddress } from "ethers";
import { getSign } from "./permitSign";

const main = async () => {
  const srcNetwork = await selectNetwork("Src", true);
  let { provider } = srcNetwork;
  const { chainId } = provider._network;

  const tokenAddress = await input({
    message: "输入Token地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const token = (
    await ethers.getContractAt(
      "ERC20MinterBurnerPauserPermitForReplacement",
      tokenAddress
    )
  ).connect(provider);

  /*
  bytes32 public _CACHED_DOMAIN_SEPARATOR;
  uint256 public _CACHED_CHAIN_ID;

  bytes32 public _HASHED_NAME;
  bytes32 public _HASHED_VERSION;
  bytes32 public _TYPE_HASH;
  */

  const cachedDomainSeparator = await token._CACHED_DOMAIN_SEPARATOR();
  const cachedChainId = await token._CACHED_CHAIN_ID();
  const hashedName = await token._HASHED_NAME();
  const hashedVersion = await token._HASHED_VERSION();
  const typeHash = await token._TYPE_HASH();
  const permitHash = await token._PERMIT_TYPEHASH();
  const domainSeparator = await token.DOMAIN_SEPARATOR();
  const nonce = await token.nonces(
    "0x0205c2D862cA051010698b69b54278cbAf945C0b"
  );
  const gchainId = await token.getChainID();

  console.log(`cachedDomainSeparator: ${cachedDomainSeparator}`);
  console.log(`domainSeparator: ${domainSeparator}`);
  console.log(`cachedChainId: ${cachedChainId}`);
  console.log(`hashedName: ${hashedName}`);
  console.log(`hashedVersion: ${hashedVersion}`);
  console.log(`typeHash: ${typeHash}`);
  console.log(`_PERMIT_TYPEHASH: ${permitHash}`);
  console.log(`nonce: `, nonce);
  console.log(`chainId: `, gchainId);

  let allowance = await token.allowance(
    "0x0205c2D862cA051010698b69b54278cbAf945C0b",
    "0x14b27D8DC12E59a9904DaC6d17D33B8de2E80e66"
  );
  console.log(`1.allowance: ${allowance}`);
  allowance = await token.allowance(
    "0x0205c2D862cA051010698b69b54278cbAf945C0b",
    "0x14b27D8DC12E59a9904DaC6d17D33B8de2E80e66"
  );
  console.log(`2.allowance: ${allowance}`);
  allowance = await token.allowance(
    "0x0205c2D862cA051010698b69b54278cbAf945C0b",
    "0x14b27D8DC12E59a9904DaC6d17D33B8de2E80e66"
  );
  console.log(`3.allowance: ${allowance}`);
};

main();
