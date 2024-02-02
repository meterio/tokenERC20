import { green, getAllNetConfigs, yellow, saveNetConfig } from "../helper";
import { ProxyOFT__factory } from "../../typechain-types";
import { JsonRpcProvider } from "ethers";

const main = async () => {
  const netConfigs = await getAllNetConfigs();
  for (let i = 0; i < netConfigs.length; i++) {
    let srcNetConfig = netConfigs[i];
    if (srcNetConfig.lzEndpointId && srcNetConfig.proxy) {
      srcNetConfig.tokenMapping = {};
      saveNetConfig(srcNetConfig.name, srcNetConfig);

      console.log(`当前链: ${green(srcNetConfig.name)} Token Mapping配置:`);

      const proxyContract = ProxyOFT__factory.connect(
        srcNetConfig.proxy,
        new JsonRpcProvider(srcNetConfig.rpc)
      );
      // let proxyContract = await getContractV2(
      //   ethers,
      //   srcNetConfig.rpc,
      //   "ProxyOFT",
      //   srcNetConfig.proxy
      // );

      let allLanes = await proxyContract.getAllLane();
      for (let j = 0; j < allLanes.length; j++) {
        const lane = allLanes[j];
        if (!srcNetConfig.tokenMapping[Number(lane.srcChainId)]) {
          srcNetConfig.tokenMapping[Number(lane.srcChainId)] = {};
          saveNetConfig(srcNetConfig.name, srcNetConfig);
          // writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
        console.log(`链路${yellow((j + 1).toString())}:`);
        console.log(`   srcChainId: ${yellow(lane.srcChainId.toString())}`);
        console.log(`   srcToken: ${green(lane.srcToken)}`);
        console.log(`   dstToken: ${green(lane.dstToken)}`);

        srcNetConfig.tokenMapping[Number(lane.srcChainId)][lane.srcToken] =
          lane.dstToken;
        saveNetConfig(srcNetConfig.name, srcNetConfig);
        // writeFileSync(configPath, JSON.stringify(config, null, 2));
        for (let k = 0; k < netConfigs.length; k++) {
          let dstNetConfig = netConfigs[k];
          if (dstNetConfig.lzEndpointId == lane.srcChainId) {
            let dstProxyContract = ProxyOFT__factory.connect(
              dstNetConfig.proxy,
              new JsonRpcProvider(dstNetConfig.rpc)
            );
            let laneExist = await dstProxyContract.laneExist(
              srcNetConfig.lzEndpointId,
              lane.dstToken
            );
            if (laneExist) {
              console.log(`目标网络${green(dstNetConfig.name)}反向验证成功✅`);
            } else {
              console.log(`目标网络${green(dstNetConfig.name)}反向验证失败❌`);
            }
          }
        }
      }
      console.log("========================================");
    }
  }
};

main();
