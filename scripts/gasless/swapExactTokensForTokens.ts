import { input, password } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { selectNetwork, deployContractV2, loadNetConfig } from "../helper";
import { Wallet, isAddress, isBytesLike } from "ethers";
import { PermitRouterV2__factory } from "../../typechain-types";
import { signPermit } from "../signPermit";
import { exit } from "process";

const pathMap = {
  "0x228ebbee999c6a7ad74a6130e81b12f9fe237ba3": [
    "0xac4c5aa6983ca82b552388b1a889509af746e5c3",
    "0xacf06e5c551dd9c7981b7f107d8eda6b6f8bcaa1",
  ], // MTRG => MTRG-suUSD + MTR-suUSD
  "0x8bf591eae535f93a242d5a954d3cde648b48a5a8": [
    "0xacf06e5c551dd9c7981b7f107d8eda6b6f8bcaa1",
  ], // suUSD => suUSD-MTR
};
const main = async () => {
  const network = await selectNetwork();
  let { override, netConfig, provider, wallet } = network;
  const { chainId } = provider._network;

  const routerAddr = await input({
    message: "输入PermitRouterV2 地址:",
    default: "0xb1fa6159dc42fe5281d68502944b17d3929dbebe",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });
  const amount = await input({
    message: "输入amount(单位:Wei):",
    default: "1000000000000000000",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });
  const tokenIn = await input({
    message: "输入tokenIn 地址:",
    default: "0x228ebbee999c6a7ad74a6130e81b12f9fe237ba3",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });
  const tokenContract = await ethers.getContractAt(
    "ERC20MinterBurnerPauserPermitForReplacement",
    tokenIn,
    wallet
  );
  const symbol = await tokenContract.symbol();
  let name = "PermitToken";
  let version = "1.0";
  if (symbol == "MTRG") {
    name = "MeterGov";
    version = "v1.0";
  }
  // const nonce = BigInt(1);
  // const deadline = 1707353657981;
  const nonce = await tokenContract.nonces(wallet.address);
  const deadline = Math.floor(new Date().getTime() / 1000 + 60 * 60 * 24 * 7);
  const privateKey = await password({
    message: `输入sender的Private Key:`,
    validate: (value = "") =>
      isBytesLike(value) || "Pass a valid Private Key value",
    mask: "*",
  });
  console.log(`owner: ${wallet.address}, spender: ${routerAddr}`);
  console.log(`amount: ${amount}, nonce: ${nonce}`);
  console.log(`deadline: ${deadline}, chainId: ${chainId}`);
  const signature = await signPermit(
    name,
    version,
    wallet,
    tokenIn,
    wallet.address,
    routerAddr,
    BigInt(amount),
    nonce,
    deadline,
    chainId
  );
  console.log(`signature: ${signature}`);

  const sender = new Wallet(privateKey, provider);
  const contract = await ethers.getContractAt(
    "PermitRouterV2",
    routerAddr,
    sender
  );
  // const path = ["0xf803f4432d6b85bc7525f85f7a9cf7398b5ebe7d"]; // MTRG-MTR
  if (!pathMap.hasOwnProperty(tokenIn.toLowerCase())) {
    console.log("没有配置 path");
    exit(1);
  }
  const path = pathMap[tokenIn.toLowerCase() as keyof typeof pathMap];
  const amountsOuts = await contract.getAmountsOut(amount, tokenIn, path);
  const tx = await contract.swapExactTokensForTokens(
    wallet.address,
    amount,
    amountsOuts[amountsOuts.length - 1],
    deadline,
    tokenIn,
    path,
    signature
  );
  console.log(tx.hash);
};

main();
