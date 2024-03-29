/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../../common";

export interface IMeterNativeInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "native_master"
      | "native_mtr_add"
      | "native_mtr_get"
      | "native_mtr_locked_add"
      | "native_mtr_locked_get"
      | "native_mtr_locked_sub"
      | "native_mtr_sub"
      | "native_mtr_totalBurned"
      | "native_mtr_totalSupply"
      | "native_mtrg_add"
      | "native_mtrg_get"
      | "native_mtrg_locked_add"
      | "native_mtrg_locked_get"
      | "native_mtrg_locked_sub"
      | "native_mtrg_sub"
      | "native_mtrg_totalBurned"
      | "native_mtrg_totalSupply"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "native_master",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtr_add",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtr_get",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtr_locked_add",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtr_locked_get",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtr_locked_sub",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtr_sub",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtr_totalBurned",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtr_totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtrg_add",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtrg_get",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtrg_locked_add",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtrg_locked_get",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtrg_locked_sub",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtrg_sub",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtrg_totalBurned",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "native_mtrg_totalSupply",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "native_master",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtr_add",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtr_get",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtr_locked_add",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtr_locked_get",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtr_locked_sub",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtr_sub",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtr_totalBurned",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtr_totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtrg_add",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtrg_get",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtrg_locked_add",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtrg_locked_get",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtrg_locked_sub",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtrg_sub",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtrg_totalBurned",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "native_mtrg_totalSupply",
    data: BytesLike
  ): Result;
}

export interface IMeterNative extends BaseContract {
  connect(runner?: ContractRunner | null): IMeterNative;
  waitForDeployment(): Promise<this>;

  interface: IMeterNativeInterface;

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

  native_master: TypedContractMethod<[addr: AddressLike], [string], "view">;

  native_mtr_add: TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  native_mtr_get: TypedContractMethod<[addr: AddressLike], [bigint], "view">;

  native_mtr_locked_add: TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  native_mtr_locked_get: TypedContractMethod<
    [addr: AddressLike],
    [bigint],
    "view"
  >;

  native_mtr_locked_sub: TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  native_mtr_sub: TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  native_mtr_totalBurned: TypedContractMethod<[], [bigint], "view">;

  native_mtr_totalSupply: TypedContractMethod<[], [bigint], "view">;

  native_mtrg_add: TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  native_mtrg_get: TypedContractMethod<[addr: AddressLike], [bigint], "view">;

  native_mtrg_locked_add: TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  native_mtrg_locked_get: TypedContractMethod<
    [addr: AddressLike],
    [bigint],
    "view"
  >;

  native_mtrg_locked_sub: TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  native_mtrg_sub: TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  native_mtrg_totalBurned: TypedContractMethod<[], [bigint], "view">;

  native_mtrg_totalSupply: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "native_master"
  ): TypedContractMethod<[addr: AddressLike], [string], "view">;
  getFunction(
    nameOrSignature: "native_mtr_add"
  ): TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "native_mtr_get"
  ): TypedContractMethod<[addr: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "native_mtr_locked_add"
  ): TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "native_mtr_locked_get"
  ): TypedContractMethod<[addr: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "native_mtr_locked_sub"
  ): TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "native_mtr_sub"
  ): TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "native_mtr_totalBurned"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "native_mtr_totalSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "native_mtrg_add"
  ): TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "native_mtrg_get"
  ): TypedContractMethod<[addr: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "native_mtrg_locked_add"
  ): TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "native_mtrg_locked_get"
  ): TypedContractMethod<[addr: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "native_mtrg_locked_sub"
  ): TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "native_mtrg_sub"
  ): TypedContractMethod<
    [addr: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "native_mtrg_totalBurned"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "native_mtrg_totalSupply"
  ): TypedContractMethod<[], [bigint], "view">;

  filters: {};
}
