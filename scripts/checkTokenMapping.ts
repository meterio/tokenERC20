import { ethers } from "hardhat";
import { getContractV2, green, setConfig, yellow } from "./helper";
import { writeFileSync } from "fs";

const main = async () => {
  const { config, configPath } = await setConfig();
  for (let i = 0; i < config.length; i++) {
    if (config[i].lzChainId && config[i].proxy) {
      config[i].tokenMapping = {};
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      console.log(`当前链: ${green(config[i].name)} Token Mapping配置:`);

      let proxyContract = await getContractV2(
        ethers,
        config[i].rpc,
        "ProxyOFT",
        config[i].proxy
      );

      let allLanes = await proxyContract.getAllLane();
      for (let j = 0; j < allLanes.length; j++) {
        if (!config[i].tokenMapping[allLanes[j].srcChainId]) {
          config[i].tokenMapping[allLanes[j].srcChainId] = {};
          writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
        console.log(`链路${yellow((j + 1).toString())}:`);
        console.log(
          `   srcChainId: ${yellow(allLanes[j].srcChainId.toString())}`
        );
        console.log(`   srcToken: ${green(allLanes[j].srcToken)}`);
        console.log(`   dstToken: ${green(allLanes[j].dstToken)}`);

        config[i].tokenMapping[allLanes[j].srcChainId][allLanes[j].srcToken] =
          allLanes[j].dstToken;
        writeFileSync(configPath, JSON.stringify(config, null, 2));
        for (let k = 0; k < config.length; k++) {
          if (config[k].lzChainId == allLanes[j].srcChainId) {
            let dstProxyContract = await getContractV2(
              ethers,
              config[k].rpc,
              "ProxyOFT",
              config[k].proxy
            );
            let laneExist = await dstProxyContract.laneExist(
              config[i].lzChainId,
              allLanes[j].dstToken
            );
            if (laneExist) {
              console.log(`目标网络${green(config[k].name)}反向验证成功✅`);
            } else {
              console.log(`目标网络${green(config[k].name)}反向验证失败❌`);
            }
          }
        }
      }
      console.log("========================================");
    }
  }
};

main();
