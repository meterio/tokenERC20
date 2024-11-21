import {
  yellow,
  red,
  green,
  selectNetwork,
  loadTokenMapping,
  getLZ2NetworkMap,
  loadNetConfig,
} from "../helper";
import { ProxyOFT__factory } from "../../typechain-types";
import { JsonRpcProvider } from "ethers";
import { exit } from "process";
import hardhatConfig from "../../hardhat.config";

const main = async () => {
  const dstNetwork = await selectNetwork("", true);
  const { netConfig, provider } = dstNetwork;

  if (!dstNetwork.netConfig || !dstNetwork.netConfig.tokenMapping) {
    console.log("没有需要检查的 Token Mapping 配置");
    exit(-1);
  }

  const l2n = getLZ2NetworkMap();
  const dstEndpointId = netConfig.lzEndpointId;

  console.log(
    `开始检查 ${Object.keys(netConfig.tokenMapping).length} 个TokenMapping`
  );
  for (const dstProxyAddress in netConfig.tokenMapping) {
    const tokenMapping = loadTokenMapping(dstNetwork, dstProxyAddress);
    console.log(`检查 ${dstProxyAddress}`);
    const dstProxy = ProxyOFT__factory.connect(dstProxyAddress, provider);

    for (const srcEndpointId in tokenMapping) {
      const trustedRemote =
        await dstProxy.getTrustedRemoteAddress(srcEndpointId);
      if (!trustedRemote) {
        console.log("trustedRemote 没有配置");
        continue;
      }
      const srcNetName = l2n[srcEndpointId];
      if (!srcNetName) {
        console.log(`网络 ${srcNetName} 没有配置`);
        continue;
      }
      const srcNetConfig = loadNetConfig(l2n[srcEndpointId]);
      const rpc =
        hardhatConfig.networks[
          srcNetName as keyof typeof hardhatConfig.networks
        ].url;
      const srcProvider = new JsonRpcProvider(rpc);
      const srcProxy = ProxyOFT__factory.connect(trustedRemote, srcProvider);

      for (const srcToken in tokenMapping[srcEndpointId]) {
        console.log(`检查 ${srcToken}`);
        const laneExist = await dstProxy.laneExist(srcEndpointId, srcToken);
        if (laneExist) {
          console.log(
            `网络${green(netConfig.name)}链路(${srcEndpointId},${srcToken})${green("正向验证成功")}✅`
          );
        } else {
          console.log(
            `网络${green(netConfig.name)}链路(${srcEndpointId},${srcToken})${red("正向验证失败")}❌`
          );
        }
        const dstToken = tokenMapping[srcEndpointId][srcToken];
        const reverseLaneExist = await srcProxy.laneExist(
          dstEndpointId,
          dstToken
        );
        if (reverseLaneExist) {
          console.log(
            `网络${green(netConfig.name)}链路(${srcEndpointId},${srcToken})${yellow("反向验证成功")}✅`
          );
        } else {
          console.log(
            `网络${green(netConfig.name)}链路(${srcEndpointId},${srcToken})${red("反向验证失败")}❌`
          );
        }
      }
    }
  }
};

main();
