import { input } from "@inquirer/prompts";
import { ethers, network } from "hardhat";
import { selectNetwork, sendTransaction } from "./helper";
import { isAddress } from "ethers";
import { getSign } from "./permitSign";

const main = async () => {
  const srcNetwork = await selectNetwork("Src");
  let { wallet, provider } = srcNetwork;
  const { chainId } = provider._network;
  const owner = wallet.address;

  const tokenAddress = await input({
    message: "输入Token地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const spender = await input({
    message: "输入spender:",
    default: wallet.address,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const amount = BigInt(
    await input({
      message: "输入数量(单位:wei):",
      default: "1000000000000000000",
      validate: (value = "") => value.length > 0 || "Pass a valid value",
    })
  );

  const token = await ethers.getContractAt(
    "ERC20MinterBurnerPauserPermit",
    tokenAddress,
    wallet
  );

  const allowance = await token.allowance(wallet.address, spender);
  const nonce = await token.nonces(owner);
  console.log(`Allowance before: `, allowance);
  const now = new Date().getTime();
  const deadline = now + 60 * 60; // 60min

  const signature = await getSign(
    wallet,
    tokenAddress,
    owner,
    spender,
    amount,
    nonce,
    deadline,
    chainId
  );

  await sendTransaction(srcNetwork, token, "permit", [
    owner,
    spender,
    amount,
    deadline,
    signature,
  ]);

  const allowanceAfter = await token.allowance(wallet.address, spender);
  console.log(`Allowance After: ${allowanceAfter}`);
};

main();
