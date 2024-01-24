import { input, select } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  config,
  setNetwork,
  sendTransaction,
  getChoices,
  green,
} from "./helper";
import { ERC20MinterBurnerPauser, ProxyOFT } from "../typechain";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

const main = async () => {
  const srcNetwork = await setNetwork(config, "Src");
  let { wallet, netConfig, override } = srcNetwork;

  const dstNetworkIndex = await select({
    message: `选择目标链网络:`,
    choices: getChoices(config),
  });

  const tokenAddress = await input({
    message: "输入Token地址:",
    validate: (value = "") =>
      ethers.utils.isAddress(value) || "Pass a valid address value",
  });

  const toAddress = await input({
    message: "输入接收地址:",
    default: wallet.address,
    validate: (value = "") =>
      ethers.utils.isAddress(value) || "Pass a valid address value",
  });

  const amount = BigNumber.from(
    await input({
      message: "输入发送数量(单位:wei):",
      default: "1000000000000000000",
      validate: (value = "") => value.length > 0 || "Pass a valid value",
    })
  );

  const token = (await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenAddress,
    wallet
  )) as ERC20MinterBurnerPauser;

  const allowance = await token.allowance(wallet.address, netConfig.proxy);
  if (allowance.lt(amount)) {
    console.log("Approve:");
    await sendTransaction(srcNetwork, token, "approve(address,uint256)", [
      netConfig.proxy,
      amount,
    ]);
  }

  const proxyOFT = (await ethers.getContractAt(
    "ProxyOFT",
    netConfig.proxy,
    wallet
  )) as ProxyOFT;

  override.value = (
    await proxyOFT.estimateSendFee(
      tokenAddress,
      config[dstNetworkIndex].lzChainId,
      toAddress,
      amount
    )
  ).nativeFee;

  console.log(`跨链手续费:${green(formatUnits(override.value.toString()))}`);

  await sendTransaction(
    srcNetwork,
    proxyOFT,
    "sendFrom(address,uint16,bytes,uint256)",
    [tokenAddress, config[dstNetworkIndex].lzChainId, toAddress, amount],
    override
  );
};

main();
