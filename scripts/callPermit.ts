import { input, select } from "@inquirer/prompts";
import { ethers } from "hardhat";
import { setNetwork, sendTransaction, getChoices, green } from "./helper";
import { formatUnits, isAddress } from "ethers";
import { getSign } from "./permitSign";

const main = async () => {
  const srcNetwork = await setNetwork("Src");
  let { wallet, netConfig, override, provider } = srcNetwork;
  const { chainId } = provider._network;

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

  const allowance = await token.allowance(wallet.address, netConfig.proxy);
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
  const response = await token.permit(
    owner,
    spender,
    amount,
    deadline,
    signature
  );
  console.log(response);
};

main();
