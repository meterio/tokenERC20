import { loadContractInfo } from "../helper";

const hre = require("hardhat");

const main = async () => {
  await hre.run("compile");

  const info = loadContractInfo(hre.network.name, "PermitRouterV2");

  await hre.run("verify:verify", {
    address: info.address,
    contract: "contracts/gasless/PermitRouterV2.sol:PermitRouterV2",
    constructorArguments: info.constructorArguments,
  });
};

main();
