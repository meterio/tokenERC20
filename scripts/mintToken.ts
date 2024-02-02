import { input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { selectNetwork, sendTransaction } from "./helper";
import { isAddress } from "ethers";

const main = async () => {
  const srcNetwork = await selectNetwork("Src");
  let { wallet } = srcNetwork;

  const tokenAddress = await input({
    message: "输入Token地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const receiver = await input({
    message: "输入receiver:",
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
    "ERC20MinterBurnerPauser",
    tokenAddress,
    wallet
  );

  await sendTransaction(srcNetwork, token, "mint", [receiver, amount]);
};

main();
