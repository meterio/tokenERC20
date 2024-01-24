import { input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { config, setNetwork, deployContractV2 } from "./helper";

const main = async () => {
  const network = await setNetwork(config);
  let { override } = network;

  const name = await input({
    message: "输入Token name:",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  const symbol = await input({
    message: "输入Token symbol:",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  const supply = await input({
    message: "输入初始供应量(单位:wei):",
    default: "0",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });

  await deployContractV2(
    ethers,
    network,
    "ERC20MinterBurnerPauser",
    [name, symbol, supply],
    override
  );
};

main();
