const hre = require("hardhat");

const main = async () => {
  await hre.run("compile");

  const address = "0x7f5a7aE2688A7ba6a9B36141335044c058a08b3E";
  await hre.run("verify:verify", {
    address,
    contract: "contracts/proxy/ProxyAdmin.sol:SumerProxyAdmin",
    constructorArguments: [],
  });
  console.log("ProxyAdmin:", address);
};

main();
