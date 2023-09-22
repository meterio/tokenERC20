/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { LockedMeterGovERC20 } from "../LockedMeterGovERC20";

export class LockedMeterGovERC20__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<LockedMeterGovERC20> {
    return super.deploy(overrides || {}) as Promise<LockedMeterGovERC20>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): LockedMeterGovERC20 {
    return super.attach(address) as LockedMeterGovERC20;
  }
  connect(signer: Signer): LockedMeterGovERC20__factory {
    return super.connect(signer) as LockedMeterGovERC20__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LockedMeterGovERC20 {
    return new Contract(address, _abi, signerOrProvider) as LockedMeterGovERC20;
  }
}

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50600180546001600160a01b0319166a4d657465724e61746976651790556102258061003d6000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806306fdde0314610051578063313ce5671461008d57806370a082311461009c57806395d89b41146100bd575b600080fd5b60408051808201909152600e81526d29ba30b5b2b226b2ba32b923b7bb60911b60208201525b6040516100849190610158565b60405180910390f35b60405160128152602001610084565b6100af6100aa3660046101a6565b6100e3565b604051908152602001610084565b60408051808201909152600a8152695354414b45444d54524760b01b6020820152610077565b6001546040516398c6fb8d60e01b81526001600160a01b03838116600483015260009216906398c6fb8d90602401602060405180830381865afa15801561012e573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061015291906101d6565b92915050565b600060208083528351808285015260005b8181101561018557858101830151858201604001528201610169565b506000604082860101526040601f19601f8301168501019250505092915050565b6000602082840312156101b857600080fd5b81356001600160a01b03811681146101cf57600080fd5b9392505050565b6000602082840312156101e857600080fd5b505191905056fea264697066735822122010bc56e5dd58e06de066bb815fe4af5e6dc1b69d31915eba33c7577f9cbe598964736f6c63430008130033";