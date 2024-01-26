import { input } from "@inquirer/prompts";
import { ethers, network } from "hardhat";
import { selectNetwork, sendTransaction } from "./helper";
import { isAddress } from "ethers";

const main = async () => {
  const srcNetwork = await selectNetwork("Src");
  let { wallet } = srcNetwork;

  const tokenAddress = await input({
    message: "输入Token地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const token = await ethers.getContractAt(
    "ERC20MinterBurnerPauserPermitForReplacement",
    tokenAddress,
    wallet
  );
  await sendTransaction(srcNetwork, token, "initialize", [
  ]);
};

main();
