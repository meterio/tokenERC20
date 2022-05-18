/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { ILayerZeroReceiver } from "../ILayerZeroReceiver";

export class ILayerZeroReceiver__factory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ILayerZeroReceiver {
    return new Contract(address, _abi, signerOrProvider) as ILayerZeroReceiver;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "uint16",
        name: "_srcChainId",
        type: "uint16",
      },
      {
        internalType: "bytes",
        name: "_srcAddress",
        type: "bytes",
      },
      {
        internalType: "uint64",
        name: "_nonce",
        type: "uint64",
      },
      {
        internalType: "bytes",
        name: "_payload",
        type: "bytes",
      },
    ],
    name: "lzReceive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];