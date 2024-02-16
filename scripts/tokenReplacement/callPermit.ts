import { input } from "@inquirer/prompts";
import { ethers, network } from "hardhat";
import { selectNetwork, sendTransaction } from "../helper";
import { getAddress, isAddress } from "ethers";
import { signPermit } from "../signPermit";
import { sign } from "crypto";

const main = async () => {
  const srcNetwork = await selectNetwork("Src");
  let { wallet, provider } = srcNetwork;
  const { chainId } = provider._network;
  const owner = await wallet.getAddress();
  let tokenAddress = await input({
    message: "输入Token地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });
  tokenAddress = getAddress(tokenAddress);
  // const tokenAddress = "0xd86e243fc0007e6226b07c9a50c9d70d78299eb5"; //"0xd86e243fc0007e6226b07c9a50c9d70d78299eb5";
  // const spender = "0xFf9CA3249734Fe0bE9f07D7bba8e3104F921C5a4";

  let spender = await input({
    message: "输入spender:",
    default: wallet.address,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });
  spender = getAddress(spender);

  const amount = BigInt(
    await input({
      message: "输入数量(单位:wei):",
      default: "1000000000000000000",
      validate: (value = "") => value.length > 0 || "Pass a valid value",
    })
  );

  const token = await ethers.getContractAt(
    "ERC20MinterBurnerPauserPermitForReplacement",
    tokenAddress,
    wallet
  );

  const allowance = await token.allowance(owner, spender);
  const nonce = await token.nonces(owner);
  console.log(`Owner: ${owner}`);
  console.log(`Spender: ${spender}`);
  console.log(`Allowance before: `, allowance);
  console.log(`Nonce: ${nonce}`);
  const now = new Date().getTime();
  // const deadline = now + 60 * 60; // 60min
  const deadline = 1707353657981;
  console.log(`Deadline: ${deadline}`);

  const symbol = await token.symbol();
  let name = "PermitToken";
  let version = "1.0";
  if (symbol == "MTRG") {
    name = "MeterGov";
    version = "v1.0";
  }
  const signature = await signPermit(
    name,
    version,
    wallet,
    tokenAddress,
    owner,
    spender,
    amount,
    nonce,
    deadline,
    chainId
  );
  console.log(`Signature: ${signature}`);

  let allowanceBefore = await token.allowance(owner, spender);
  console.log(`Allowance Before:`, allowanceBefore);
  // return;

  await sendTransaction(srcNetwork, token, "permit", [
    owner,
    spender,
    amount,
    deadline,
    signature,
  ]);

  const allowanceAfter = await token.allowance(owner, spender);
  console.log(`Allowance After: ${allowanceAfter}`);
};

main();
