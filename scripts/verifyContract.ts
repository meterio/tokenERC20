import { findContractPath, loadContractInfoByAddress } from "./helper";

const hre = require("hardhat");
const { input } = require("@inquirer/prompts");
const { isAddress } = require("ethers");

const main = async () => {
  await hre.run("compile");

  const contractAddress = await input({
    message: "输入需要verify的合约地址:",
    default: "",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });
  const info = loadContractInfoByAddress(hre.network.name, contractAddress);
  const contractPath = findContractPath(info.contract);

  console.log(`准备verify合约 ${contractAddress}`);
  console.log(`contract path: ${contractPath}`);
  console.log(`constructorArguments: ${info.constructorArguments}`);
  await hre.run("verify:verify", {
    address: contractAddress,
    contract: contractPath,
    constructorArguments: info.constructorArguments,
  });
};

main();
