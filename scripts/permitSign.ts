import { Signer, VoidSigner } from "ethers";
import { BytesLike } from "@ethersproject/bytes";
export async function getSign(
  wallet: Signer,
  verifyingContract: string,
  owner: string,
  spender: string,
  value: bigint,
  nonce: bigint,
  deadline: number,
  chainId: bigint
): Promise<string> {
  const name = "PermitToken";
  const version = "1.0";
  let signature = await wallet.signTypedData(
    { name, version, chainId, verifyingContract },
    {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    {
      owner: owner,
      spender: spender,
      value: value,
      nonce: nonce,
      deadline: deadline,
    }
  );
  return signature;
}
