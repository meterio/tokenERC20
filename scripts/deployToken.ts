import { input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { config, setNetwork, deployContractV2 } from "./helper";

const main = async () => {
  const network = await setNetwork(config);
  let { override } = network;

  const name = await input({
    message: "输入Token name:",
  });

  const symbol = await input({
    message: "输入Token symbol:",
  });

  const supply = await input({
    message: "输入初始供应量(单位:wei):",
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
