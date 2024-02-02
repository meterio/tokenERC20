import { input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { selectNetwork, deployContractV2 } from "./helper";

const main = async () => {
  const network = await selectNetwork();
  let { override } = network;

  const name = await input({
    message: "输入Token name:",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  const symbol = await input({
    message: "输入Token symbol:",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  const decimals = await input({
    message: "输入Token decimals:",
    default: "18",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  await deployContractV2(
    ethers,
    network,
    "ERC20MinterBurnerPauserPermit",
    [name, symbol, decimals],
    override,
    symbol
  );
};

main();
