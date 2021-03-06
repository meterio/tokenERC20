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
import { Contract, ContractTransaction } from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface ISafeMintInterface extends ethers.utils.Interface {
  functions: {};

  events: {
    "ArbitrateProject(string,address,uint8)": EventFragment;
    "AuditProject(string,address,uint256,string,uint8)": EventFragment;
    "ChallengeProject(string,address,uint256,string)": EventFragment;
    "EditProject(string,uint256,uint256,string)": EventFragment;
    "SaveProject(string,address,address,uint256,uint256,uint256,string,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ArbitrateProject"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AuditProject"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ChallengeProject"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "EditProject"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SaveProject"): EventFragment;
}

export class ISafeMint extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: ISafeMintInterface;

  functions: {};

  callStatic: {};

  filters: {
    ArbitrateProject(
      name: string | null,
      arbitrator: string | null,
      status: null
    ): EventFilter;

    AuditProject(
      name: string | null,
      auditor: string | null,
      auditPrice: null,
      comments: null,
      status: null
    ): EventFilter;

    ChallengeProject(
      name: string | null,
      challenger: string | null,
      challengePrice: null,
      comments: null
    ): EventFilter;

    EditProject(
      name: string | null,
      startTime: null,
      endTime: null,
      ipfsAddress: null
    ): EventFilter;

    SaveProject(
      name: string | null,
      owner: string | null,
      projectContract: string | null,
      startTime: null,
      endTime: null,
      projectPrice: null,
      ipfsAddress: null,
      projectId: null
    ): EventFilter;
  };

  estimateGas: {};

  populateTransaction: {};
}
