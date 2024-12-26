import { input, confirm } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { selectNetwork, selectProxyOFT, yellow, blue, green } from "../helper";
import { isAddress, Wallet } from "ethers";
import { BaseProxyOFT, Timelock } from "../../typechain-types";
import { bigint } from "hardhat/internal/core/params/argumentTypes";

const EXECUTOR_ROLE =
  "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63";
const PROPOSER_ROLE =
  "0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1";

const listRoleMember = async (
  proxy: Timelock,
  role: string,
  roleName: string
): Promise<void> => {
  console.log(`List ${roleName} : ${role} members`);
  const n = await proxy.getRoleMemberCount(role);
  for (let i = 0; i < n; i++) {
    const addr = await proxy.getRoleMember(role, i);
    console.log(`  ${i}: ${addr}`);
  }
};

const configRole = async (
  proxy: Timelock,
  role: string,
  roleName: string
): Promise<void> => {
  await listRoleMember(proxy, role, roleName);

  const yes = await confirm({
    message: `需要增加 ${roleName} 吗？`,
    default: false,
  });

  if (!yes) return;

  const newAddr = await input({
    message: `输入新增的 ${roleName} 地址：`,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const tx = await proxy.grantRole(role, newAddr);
  const receipt = await tx.wait();
  console.log(`${roleName} 新增 ${newAddr} tx: ${receipt?.hash}`);
};

const configLimitWindow = async (proxy: Timelock) => {
  const curWindow = await proxy.limitWindow();
  console.log(`LimitWindow is ${curWindow}`);

  const yes = await confirm({
    message: `需要修改 LimitWindow:${curWindow} 吗？`,
    default: false,
  });

  if (!yes) return;

  const newWindow = await input({
    message: `输入新的 LimitWindow (seconds):`,
    validate: (value = "") =>
      !Number.isNaN(Number(value)) || "Pass a valid number",
  });

  const tx = await proxy.setLimitWindow(Number(newWindow));
  const receipt = await tx.wait();
  console.log(`LimitWindow 修改为：${newWindow} tx: ${receipt?.hash}`);
};

const configAssetLimiters = async (
  proxy: Timelock,
  lanes: BaseProxyOFT.LaneDetailStructOutput[],
  wallet: Wallet
) => {
  let limiters: { [key: string]: any } = {};
  for (const lane of lanes) {
    const token = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
      lane.dstToken,
      wallet
    );
    const dstDecimals = await token.decimals();
    const dstSymbol = await token.symbol();
    const unitFactor = BigInt(10) ** dstDecimals;

    const state = await proxy.currentState(lane.dstToken);
    let yes = false;
    if (state.isEnabled) {
      yes = await confirm({
        message: `对Lane ${yellow(dstSymbol)} (srcEid: ${lane.srcEid}, srcToken: ${lane.srcToken}, dstToken: ${lane.dstToken}) ${green("修改链上")} RateLimiter(capacity:${state.capacity / unitFactor}, rate:${state.rate / unitFactor}):`,
        default: false,
      });
    } else {
      if (lane.dstToken in limiters) {
        yes = await confirm({
          message: `对Lane ${yellow(dstSymbol)} (srcEid: ${lane.srcEid}, srcToken: ${lane.srcToken}, dstToken: ${lane.dstToken}) ${green("修改待配置")} RateLimiter(capacity:${limiters[lane.dstToken].capacity / unitFactor}):`,
          default: false,
        });
      } else {
        yes = await confirm({
          message: `对Lane ${yellow(dstSymbol)} (srcEid: ${lane.srcEid}, srcToken: ${lane.srcToken}, dstToken: ${lane.dstToken}) ${green("新增")} RateLimiter:`,
          default: true,
        });
      }
    }

    if (!yes) continue;

    const newCapacity = await input({
      message: `输入新的 Capacity (will multiply unit factor 10**${dstDecimals} afterwards):`,
      default: "1",
      validate: (value = "") =>
        !Number.isNaN(Number(value)) || "Pass a valid number",
    });
    const enabled = await confirm({ message: "Enabled?", default: true });

    limiters[lane.dstToken] = {
      asset: lane.dstToken,
      capacity: BigInt(newCapacity) * BigInt(unitFactor.toString()),
      isEnabled: enabled,
    };
  }

  for (const limiter of Object.values(limiters)) {
    console.log(
      `Setting Rate Limiter (asset: ${limiter.asset}, capacity: ${limiter.capacity})`
    );
  }
  const tx = await proxy.setAssetLimiter(Object.values(limiters));
  const receipt = await tx.wait();
  console.log(`Done tx:${receipt?.hash}`);
};

const main = async () => {
  const network = await selectNetwork();
  let { wallet, netConfig } = network;

  const proxyOFT = await selectProxyOFT(netConfig);

  const proxyOFTContract = await ethers.getContractAt(
    "ProxyOFT",
    proxyOFT.address,
    wallet
  );

  const lanes = await proxyOFTContract.getAllLane();

  const timelockProxyAddr = netConfig[`Timelock-proxy`];

  const timelockProxy = await ethers.getContractAt(
    "Timelock",
    timelockProxyAddr,
    wallet
  );

  await configRole(timelockProxy, PROPOSER_ROLE, "Proposer");

  await configRole(timelockProxy, EXECUTOR_ROLE, "Executor");

  await configLimitWindow(timelockProxy);

  await configAssetLimiters(timelockProxy, lanes, wallet);

  console.log(`Done.`);
};

main();
