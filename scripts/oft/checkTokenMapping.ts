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

  const l2n = getLZ2NetworkMap();
  const dstEndpointId = netConfig.lzEndpointId;

  if (!dstNetwork.netConfig || !dstNetwork.netConfig.tokenMapping) {
    console.log("没有需要检查的 Token Mapping 配置");
    exit(-1);
  }

  console.log(`开始检查 ${Object.keys(netConfig.tokenMapping).length} 个Proxy`);

  for (const dstProxyAddress in netConfig.tokenMapping) {
    const tokenMapping = loadTokenMapping(netConfig, dstProxyAddress);
    console.log("------------------------------------");
    console.log(`检查Proxy ${dstProxyAddress}`);
    const dstProxy = ProxyOFT__factory.connect(dstProxyAddress, provider);

    const lanes = await dstProxy.getAllLane();
    console.log(`链上配置:`);
    for (const lane of lanes) {
      console.log(
        `  srcEid: ${lane[0]}, srcToken: ${lane[1]}, dstToken: ${lane[2]}`
      );
    }
    console.log("------------------------------------");

    let laneMap: { [key: string]: any } = {};
    for (const lane of lanes) {
      laneMap[`${lane[0]}-${lane[1]}`.toLowerCase()] = lane;
    }

    for (const srcEndpointId in tokenMapping) {
      console.log(`检查 srcEid: ${srcEndpointId}`);
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
      const rpc =
        hardhatConfig.networks[
          srcNetName as keyof typeof hardhatConfig.networks
        ].url;
      const srcProvider = new JsonRpcProvider(rpc);
      const srcProxy = ProxyOFT__factory.connect(trustedRemote, srcProvider);

      for (const srcToken in tokenMapping[srcEndpointId]) {
        console.log(`检查 srcToken: ${srcToken}`);
        const key = `${srcEndpointId}-${srcToken}`.toLowerCase();
        if (key in laneMap) {
          delete laneMap[key];
        }
        const dstToken = tokenMapping[srcEndpointId][srcToken];
        const laneName = `链路 ${yellow(srcNetName)}:${srcEndpointId} -> ${green(netConfig.name)}:${dstEndpointId} srcToken:${srcToken}, dstToken:${dstToken}`;
        const laneExist = await dstProxy.laneExist(srcEndpointId, srcToken);
        if (laneExist) {
          console.log(`${laneName} ${yellow("正向")} ${green("验证成功")} ✅`);
        } else {
          console.log(`${laneName} ${yellow("正向")} ${red("验证失败")} ❌`);
        }
        const reverseLaneExist = await srcProxy.laneExist(
          dstEndpointId,
          dstToken
        );
        if (reverseLaneExist) {
          console.log(`${laneName} ${yellow("反向")} ${green("验证成功")} ✅`);
        } else {
          console.log(`${laneName} ${yellow("反向")} ${red("验证失败")} ❌`);
        }
      }
    }

    if (Object.keys(laneMap).length > 0) {
      console.log(`以下tokenMapping配置不在本地config.json中 ❌：`);
      for (const key in laneMap) {
        const lane = laneMap[key];
        console.log(key);
        console.log(
          `  srcEid: ${lane[0]}, srcToken: ${lane[1]}, dstToken: ${lane[2]}`
        );
      }
    }
  }
};

main();
