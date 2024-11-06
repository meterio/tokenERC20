import { ethers } from "hardhat";
import { selectNetwork, selectProxyOFT } from "../helper";

const main = async () => {
  const srcNetwork = await selectNetwork("源链");
  let { wallet } = srcNetwork;

  const srcProxy = await selectProxyOFT(srcNetwork);

  const proxyOFT = await ethers.getContractAt(
    "ProxyOFT",
    srcProxy.address,
    wallet
  );

  const endpointAddr = await proxyOFT.lzEndpoint();
  console.log(`Endpoint Addr: ${endpointAddr}`);

  const endpoint = await ethers.getContractAt(
    "ILayerZeroEndpointUpgradeable",
    endpointAddr,
    wallet
  );

  const version = await endpoint.latestVersion();
  console.log(`Version: ${version}`);
};

main();
