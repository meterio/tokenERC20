import { input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { selectNetwork, MINTER_ROLE, sendTransaction } from "./helper";
import { isAddress } from "ethers";

const main = async () => {
  const network = await selectNetwork();
  let { override, wallet } = network;

  const tokenAddress = await input({
    message: "输入Account:",
    validate: (value = "") => isAddress(value) || "Pass a valid value",
    default: "0x4b770584943e2b7788D2C6307d0B95E4Ab215445",
  });

  const account = await input({
    message: "输入Account:",
    validate: (value = "") => isAddress(value) || "Pass a valid value",
    default: "0xd6200eda6BBD223c9C8166455d1Da6427972B6F4",
  });

  const token = await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenAddress,
    wallet
  );

  await sendTransaction(network, token, "grantRole", [MINTER_ROLE, account]);
};

main();
