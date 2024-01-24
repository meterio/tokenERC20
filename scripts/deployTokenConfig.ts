import { readFileSync, writeFileSync } from "fs";
import { ethers } from "hardhat";
import { config, setNetwork, deployContractV2 } from "./helper";

const main = async () => {
  const network = await setNetwork(config);
  let { override } = network;

  const tokens_json = "./scripts/tokens.json";
  const tokens_config = JSON.parse(readFileSync(tokens_json).toString());

  for (let i = 0; i < tokens_config.length; i++) {
    let token_config = tokens_config[i];
    tokens_config[i].address = (
      await deployContractV2(
        ethers,
        network,
        "ERC20MinterBurnerPauser",
        [token_config.name, token_config.symbol, token_config.supply],
        override
      )
    ).address;

    writeFileSync(tokens_json, JSON.stringify(tokens_config));
  }
};

main();
