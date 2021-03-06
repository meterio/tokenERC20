/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface IEIP712Interface extends ethers.utils.Interface {
  functions: {
    "permit(address,address,uint256,uint256,bytes)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "permit",
    values: [string, string, BigNumberish, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(functionFragment: "permit", data: BytesLike): Result;

  events: {};
}

export class IEIP712 extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IEIP712Interface;

  functions: {
    permit(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "permit(address,address,uint256,uint256,bytes)"(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  permit(
    owner: string,
    spender: string,
    value: BigNumberish,
    deadline: BigNumberish,
    signature: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "permit(address,address,uint256,uint256,bytes)"(
    owner: string,
    spender: string,
    value: BigNumberish,
    deadline: BigNumberish,
    signature: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    permit(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "permit(address,address,uint256,uint256,bytes)"(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    permit(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "permit(address,address,uint256,uint256,bytes)"(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    permit(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "permit(address,address,uint256,uint256,bytes)"(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
