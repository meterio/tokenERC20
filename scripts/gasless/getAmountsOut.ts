import { input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { selectNetwork, deployContractV2, loadNetConfig } from "../helper";
import { isAddress } from "ethers";
import { PermitRouterV2__factory } from "../../typechain-types";

const main = async () => {
  const network = await selectNetwork();
  let { override, netConfig, provider } = network;

  const addr = await input({
    message: "输入PermitRouterV2 地址:",
    default: "",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });
  const amountIn = await input({
    message: "输入amountIn(单位:Wei):",
    default: "1000000000000000000",
    validate: (value = "") => value.length > 0 || "Pass a valid value",
  });
  const tokenIn = await input({
    message: "输入tokenIn 地址:",
    default: "0x228ebbee999c6a7ad74a6130e81b12f9fe237ba3",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });
  const path = ["0xf803f4432d6b85bc7525f85f7a9cf7398b5ebe7d"];

  const contract = PermitRouterV2__factory.connect(addr, provider);
  const amountsOut = await contract.getAmountsOut.staticCall(
    amountIn,
    tokenIn,
    path
  );
  console.log(amountsOut);
};

main();
