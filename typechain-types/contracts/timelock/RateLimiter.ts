/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  FunctionFragment,
  Interface,
  EventFragment,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
} from "../../common";

export declare namespace RateLimiter {
  export type ConfigStruct = {
    isEnabled: boolean;
    capacity: BigNumberish;
    rate: BigNumberish;
  };

  export type ConfigStructOutput = [
    isEnabled: boolean,
    capacity: bigint,
    rate: bigint
  ] & { isEnabled: boolean; capacity: bigint; rate: bigint };
}

export interface RateLimiterInterface extends Interface {
  getEvent(
    nameOrSignatureOrTopic: "ConfigChanged" | "TokensConsumed"
  ): EventFragment;
}

export namespace ConfigChangedEvent {
  export type InputTuple = [config: RateLimiter.ConfigStruct];
  export type OutputTuple = [config: RateLimiter.ConfigStructOutput];
  export interface OutputObject {
    config: RateLimiter.ConfigStructOutput;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TokensConsumedEvent {
  export type InputTuple = [tokens: BigNumberish];
  export type OutputTuple = [tokens: bigint];
  export interface OutputObject {
    tokens: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface RateLimiter extends BaseContract {
  connect(runner?: ContractRunner | null): RateLimiter;
  waitForDeployment(): Promise<this>;

  interface: RateLimiterInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getEvent(
    key: "ConfigChanged"
  ): TypedContractEvent<
    ConfigChangedEvent.InputTuple,
    ConfigChangedEvent.OutputTuple,
    ConfigChangedEvent.OutputObject
  >;
  getEvent(
    key: "TokensConsumed"
  ): TypedContractEvent<
    TokensConsumedEvent.InputTuple,
    TokensConsumedEvent.OutputTuple,
    TokensConsumedEvent.OutputObject
  >;

  filters: {
    "ConfigChanged(tuple)": TypedContractEvent<
      ConfigChangedEvent.InputTuple,
      ConfigChangedEvent.OutputTuple,
      ConfigChangedEvent.OutputObject
    >;
    ConfigChanged: TypedContractEvent<
      ConfigChangedEvent.InputTuple,
      ConfigChangedEvent.OutputTuple,
      ConfigChangedEvent.OutputObject
    >;

    "TokensConsumed(uint256)": TypedContractEvent<
      TokensConsumedEvent.InputTuple,
      TokensConsumedEvent.OutputTuple,
      TokensConsumedEvent.OutputObject
    >;
    TokensConsumed: TypedContractEvent<
      TokensConsumedEvent.InputTuple,
      TokensConsumedEvent.OutputTuple,
      TokensConsumedEvent.OutputObject
    >;
  };
}