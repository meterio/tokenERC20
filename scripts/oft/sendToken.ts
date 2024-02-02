import { input, select } from "@inquirer/prompts";
import { ethers } from "hardhat";
import {
  selectNetwork,
  sendTransaction,
  green,
  getNetworkChoicesFromHardhat,
  loadNetConfig,
  selectProxyOFT,
} from "../helper";
import { formatUnits, isAddress } from "ethers";

const main = async () => {
  const srcNetwork = await selectNetwork("源链");
  let { wallet, override } = srcNetwork;

  const srcProxy = await selectProxyOFT(srcNetwork);

  const dstNetwork = await select({
    message: `选择目标链:`,
    choices: getNetworkChoicesFromHardhat(),
  });
  const dstNetConfig = loadNetConfig(dstNetwork);

  const tokenAddress = await input({
    message: "输入Token地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const toAddress = await input({
    message: "输入接收地址:",
    default: wallet.address,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const amount = BigInt(
    await input({
      message: "输入发送数量(单位:wei):",
      default: "1000000000000000000",
      validate: (value = "") => value.length > 0 || "Pass a valid value",
    })
  );

  const token = await ethers.getContractAt(
    "ERC20MinterBurnerPauser",
    tokenAddress,
    wallet
  );

  const allowance = await token.allowance(wallet.address, srcProxy.address);
  if (allowance < amount) {
    console.log(
      `Approve ${amount} token(${tokenAddress}) to ${srcProxy.address}`
    );
    await sendTransaction(srcNetwork, token, "approve(address,uint256)", [
      srcProxy.address,
      amount,
    ]);
  }

  const proxyOFT = await ethers.getContractAt(
    "ProxyOFT",
    srcProxy.address,
    wallet
  );

  override.value = (
    await proxyOFT.estimateSendFee(
      tokenAddress,
      dstNetConfig.lzEndpointId,
      toAddress,
      amount
    )
  ).nativeFee;

  console.log(`跨链手续费:${green(formatUnits(override.value.toString()))}`);

  await sendTransaction(
    srcNetwork,
    proxyOFT,
    "sendFrom(address,uint16,bytes,uint256)",
    [tokenAddress, dstNetConfig.lzEndpointId, toAddress, amount],
    override
  );
};

main();
