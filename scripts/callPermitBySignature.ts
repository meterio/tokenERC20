import { input } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { loadContractV2, selectNetwork } from "./helper";
import { isAddress } from "ethers";
import { getSign } from "./permitSign";

const main = async () => {
  const srcNetwork = await selectNetwork("Src");
  let { wallet, netConfig, override, provider } = srcNetwork;
  const { chainId } = provider._network;
  const c = await loadContractV2(
    ethers,
    srcNetwork,
    "ERC20MinterBurnerPauserPermit"
  );
  const ci = (await ethers.getContractFactory("ERC20MinterBurnerPauserPermit"))
    .interface;
  console.log("ci", ci);
  const cf = ci.deploy;
  console.log("cf", cf);

  console.log(cf?.inputs);

  const owner = wallet.address;

  const tokenAddress = await input({
    message: "输入Token地址:",
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const spender = await input({
    message: "输入spender:",
    default: wallet.address,
    validate: (value = "") => isAddress(value) || "Pass a valid address value",
  });

  const amount = BigInt(
    await input({
      message: "输入数量(单位:wei):",
      default: "1000000000000000000",
      validate: (value = "") => value.length > 0 || "Pass a valid value",
    })
  );

  const token = await ethers.getContractAt(
    "ERC20MinterBurnerPauserPermit",
    tokenAddress,
    wallet
  );

  const allowance = await token.allowance(wallet.address, spender);
  const nonce = await token.nonces(owner);
  console.log(`Allowance before: `, allowance);
  console.log(`Nonce: `, nonce);
  const now = new Date().getTime();
  const deadline = now + 60 * 60; // 60min

  const signature = await getSign(
    wallet,
    tokenAddress,
    owner,
    spender,
    amount,
    nonce,
    deadline,
    chainId
  );
  const response = await token.permitBySignature(
    owner,
    spender,
    amount,
    deadline,
    signature
  );
  const receipt = await response.wait();
  console.log(response);
  console.log(receipt);
  const allowanceAfter = await token.allowance(wallet.address, spender);
  console.log(`Allowance After: ${allowanceAfter}`);
  console.log(`Allowance Diff:${allowanceAfter - allowance}`);
};

main();
