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
  EventFragment,
  AddressLike,
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
  TypedContractMethod,
} from "../../common";

export interface LzAppUpgradeableInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "DEFAULT_ADMIN_ROLE"
      | "DEFAULT_PAYLOAD_SIZE_LIMIT"
      | "forceResumeReceive"
      | "getConfig"
      | "getRoleAdmin"
      | "getRoleMember"
      | "getRoleMemberCount"
      | "getTrustedRemoteAddress"
      | "grantRole"
      | "hasRole"
      | "isTrustedRemote"
      | "lzEndpoint"
      | "lzReceive"
      | "minDstGasLookup"
      | "precrime"
      | "renounceRole"
      | "revokeRole"
      | "setConfig"
      | "setMinDstGas"
      | "setPrecrime"
      | "setReceiveVersion"
      | "setSendVersion"
      | "setTrustedRemote"
      | "setTrustedRemoteAddress"
      | "supportsInterface"
      | "trustedRemoteLookup"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "Initialized"
      | "RoleAdminChanged"
      | "RoleGranted"
      | "RoleRevoked"
      | "SetMinDstGas"
      | "SetMinDstGasLookup"
      | "SetPrecrime"
      | "SetTrustedRemote"
      | "SetTrustedRemoteAddress"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "DEFAULT_PAYLOAD_SIZE_LIMIT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "forceResumeReceive",
    values: [BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getConfig",
    values: [BigNumberish, BigNumberish, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getRoleAdmin",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getRoleMember",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getRoleMemberCount",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getTrustedRemoteAddress",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "grantRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "hasRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "isTrustedRemote",
    values: [BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "lzEndpoint",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lzReceive",
    values: [BigNumberish, BytesLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "minDstGasLookup",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "precrime", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setConfig",
    values: [BigNumberish, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setMinDstGas",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setPrecrime",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setReceiveVersion",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setSendVersion",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setTrustedRemote",
    values: [BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setTrustedRemoteAddress",
    values: [BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "trustedRemoteLookup",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "DEFAULT_PAYLOAD_SIZE_LIMIT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "forceResumeReceive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getConfig", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getRoleAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRoleMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRoleMemberCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTrustedRemoteAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hasRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isTrustedRemote",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lzEndpoint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "lzReceive", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "minDstGasLookup",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "precrime", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setConfig", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setMinDstGas",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPrecrime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setReceiveVersion",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setSendVersion",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTrustedRemote",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTrustedRemoteAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "trustedRemoteLookup",
    data: BytesLike
  ): Result;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoleAdminChangedEvent {
  export type InputTuple = [
    role: BytesLike,
    previousAdminRole: BytesLike,
    newAdminRole: BytesLike
  ];
  export type OutputTuple = [
    role: string,
    previousAdminRole: string,
    newAdminRole: string
  ];
  export interface OutputObject {
    role: string;
    previousAdminRole: string;
    newAdminRole: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoleGrantedEvent {
  export type InputTuple = [
    role: BytesLike,
    account: AddressLike,
    sender: AddressLike
  ];
  export type OutputTuple = [role: string, account: string, sender: string];
  export interface OutputObject {
    role: string;
    account: string;
    sender: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoleRevokedEvent {
  export type InputTuple = [
    role: BytesLike,
    account: AddressLike,
    sender: AddressLike
  ];
  export type OutputTuple = [role: string, account: string, sender: string];
  export interface OutputObject {
    role: string;
    account: string;
    sender: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetMinDstGasEvent {
  export type InputTuple = [
    _dstChainId: BigNumberish,
    _type: BigNumberish,
    _minDstGas: BigNumberish
  ];
  export type OutputTuple = [
    _dstChainId: bigint,
    _type: bigint,
    _minDstGas: bigint
  ];
  export interface OutputObject {
    _dstChainId: bigint;
    _type: bigint;
    _minDstGas: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetMinDstGasLookupEvent {
  export type InputTuple = [
    _dstChainId: BigNumberish,
    _type: BigNumberish,
    _dstGasAmount: BigNumberish
  ];
  export type OutputTuple = [
    _dstChainId: bigint,
    _type: bigint,
    _dstGasAmount: bigint
  ];
  export interface OutputObject {
    _dstChainId: bigint;
    _type: bigint;
    _dstGasAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetPrecrimeEvent {
  export type InputTuple = [precrime: AddressLike];
  export type OutputTuple = [precrime: string];
  export interface OutputObject {
    precrime: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetTrustedRemoteEvent {
  export type InputTuple = [_srcChainId: BigNumberish, _srcAddress: BytesLike];
  export type OutputTuple = [_srcChainId: bigint, _srcAddress: string];
  export interface OutputObject {
    _srcChainId: bigint;
    _srcAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetTrustedRemoteAddressEvent {
  export type InputTuple = [
    _remoteChainId: BigNumberish,
    _remoteAddress: BytesLike
  ];
  export type OutputTuple = [_remoteChainId: bigint, _remoteAddress: string];
  export interface OutputObject {
    _remoteChainId: bigint;
    _remoteAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface LzAppUpgradeable extends BaseContract {
  connect(runner?: ContractRunner | null): LzAppUpgradeable;
  waitForDeployment(): Promise<this>;

  interface: LzAppUpgradeableInterface;

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

  DEFAULT_ADMIN_ROLE: TypedContractMethod<[], [string], "view">;

  DEFAULT_PAYLOAD_SIZE_LIMIT: TypedContractMethod<[], [bigint], "view">;

  forceResumeReceive: TypedContractMethod<
    [_srcChainId: BigNumberish, _srcAddress: BytesLike],
    [void],
    "nonpayable"
  >;

  getConfig: TypedContractMethod<
    [
      _version: BigNumberish,
      _chainId: BigNumberish,
      arg2: AddressLike,
      _configType: BigNumberish
    ],
    [string],
    "view"
  >;

  getRoleAdmin: TypedContractMethod<[role: BytesLike], [string], "view">;

  getRoleMember: TypedContractMethod<
    [role: BytesLike, index: BigNumberish],
    [string],
    "view"
  >;

  getRoleMemberCount: TypedContractMethod<[role: BytesLike], [bigint], "view">;

  getTrustedRemoteAddress: TypedContractMethod<
    [_remoteChainId: BigNumberish],
    [string],
    "view"
  >;

  grantRole: TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;

  hasRole: TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [boolean],
    "view"
  >;

  isTrustedRemote: TypedContractMethod<
    [_srcChainId: BigNumberish, _srcAddress: BytesLike],
    [boolean],
    "view"
  >;

  lzEndpoint: TypedContractMethod<[], [string], "view">;

  lzReceive: TypedContractMethod<
    [
      _srcChainId: BigNumberish,
      _srcAddress: BytesLike,
      _nonce: BigNumberish,
      _payload: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  minDstGasLookup: TypedContractMethod<
    [arg0: BigNumberish, arg1: BigNumberish],
    [bigint],
    "view"
  >;

  precrime: TypedContractMethod<[], [string], "view">;

  renounceRole: TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;

  revokeRole: TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;

  setConfig: TypedContractMethod<
    [
      _version: BigNumberish,
      _chainId: BigNumberish,
      _configType: BigNumberish,
      _config: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  setMinDstGas: TypedContractMethod<
    [
      _dstChainId: BigNumberish,
      _packetType: BigNumberish,
      _minGas: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  setPrecrime: TypedContractMethod<
    [_precrime: AddressLike],
    [void],
    "nonpayable"
  >;

  setReceiveVersion: TypedContractMethod<
    [_version: BigNumberish],
    [void],
    "nonpayable"
  >;

  setSendVersion: TypedContractMethod<
    [_version: BigNumberish],
    [void],
    "nonpayable"
  >;

  setTrustedRemote: TypedContractMethod<
    [_srcChainId: BigNumberish, _path: BytesLike],
    [void],
    "nonpayable"
  >;

  setTrustedRemoteAddress: TypedContractMethod<
    [_remoteChainId: BigNumberish, _remoteAddress: BytesLike],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  trustedRemoteLookup: TypedContractMethod<
    [arg0: BigNumberish],
    [string],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "DEFAULT_ADMIN_ROLE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "DEFAULT_PAYLOAD_SIZE_LIMIT"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "forceResumeReceive"
  ): TypedContractMethod<
    [_srcChainId: BigNumberish, _srcAddress: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getConfig"
  ): TypedContractMethod<
    [
      _version: BigNumberish,
      _chainId: BigNumberish,
      arg2: AddressLike,
      _configType: BigNumberish
    ],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "getRoleAdmin"
  ): TypedContractMethod<[role: BytesLike], [string], "view">;
  getFunction(
    nameOrSignature: "getRoleMember"
  ): TypedContractMethod<
    [role: BytesLike, index: BigNumberish],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "getRoleMemberCount"
  ): TypedContractMethod<[role: BytesLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getTrustedRemoteAddress"
  ): TypedContractMethod<[_remoteChainId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "grantRole"
  ): TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "hasRole"
  ): TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "isTrustedRemote"
  ): TypedContractMethod<
    [_srcChainId: BigNumberish, _srcAddress: BytesLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "lzEndpoint"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "lzReceive"
  ): TypedContractMethod<
    [
      _srcChainId: BigNumberish,
      _srcAddress: BytesLike,
      _nonce: BigNumberish,
      _payload: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "minDstGasLookup"
  ): TypedContractMethod<
    [arg0: BigNumberish, arg1: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "precrime"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceRole"
  ): TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "revokeRole"
  ): TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setConfig"
  ): TypedContractMethod<
    [
      _version: BigNumberish,
      _chainId: BigNumberish,
      _configType: BigNumberish,
      _config: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setMinDstGas"
  ): TypedContractMethod<
    [
      _dstChainId: BigNumberish,
      _packetType: BigNumberish,
      _minGas: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setPrecrime"
  ): TypedContractMethod<[_precrime: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setReceiveVersion"
  ): TypedContractMethod<[_version: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setSendVersion"
  ): TypedContractMethod<[_version: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setTrustedRemote"
  ): TypedContractMethod<
    [_srcChainId: BigNumberish, _path: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setTrustedRemoteAddress"
  ): TypedContractMethod<
    [_remoteChainId: BigNumberish, _remoteAddress: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "trustedRemoteLookup"
  ): TypedContractMethod<[arg0: BigNumberish], [string], "view">;

  getEvent(
    key: "Initialized"
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "RoleAdminChanged"
  ): TypedContractEvent<
    RoleAdminChangedEvent.InputTuple,
    RoleAdminChangedEvent.OutputTuple,
    RoleAdminChangedEvent.OutputObject
  >;
  getEvent(
    key: "RoleGranted"
  ): TypedContractEvent<
    RoleGrantedEvent.InputTuple,
    RoleGrantedEvent.OutputTuple,
    RoleGrantedEvent.OutputObject
  >;
  getEvent(
    key: "RoleRevoked"
  ): TypedContractEvent<
    RoleRevokedEvent.InputTuple,
    RoleRevokedEvent.OutputTuple,
    RoleRevokedEvent.OutputObject
  >;
  getEvent(
    key: "SetMinDstGas"
  ): TypedContractEvent<
    SetMinDstGasEvent.InputTuple,
    SetMinDstGasEvent.OutputTuple,
    SetMinDstGasEvent.OutputObject
  >;
  getEvent(
    key: "SetMinDstGasLookup"
  ): TypedContractEvent<
    SetMinDstGasLookupEvent.InputTuple,
    SetMinDstGasLookupEvent.OutputTuple,
    SetMinDstGasLookupEvent.OutputObject
  >;
  getEvent(
    key: "SetPrecrime"
  ): TypedContractEvent<
    SetPrecrimeEvent.InputTuple,
    SetPrecrimeEvent.OutputTuple,
    SetPrecrimeEvent.OutputObject
  >;
  getEvent(
    key: "SetTrustedRemote"
  ): TypedContractEvent<
    SetTrustedRemoteEvent.InputTuple,
    SetTrustedRemoteEvent.OutputTuple,
    SetTrustedRemoteEvent.OutputObject
  >;
  getEvent(
    key: "SetTrustedRemoteAddress"
  ): TypedContractEvent<
    SetTrustedRemoteAddressEvent.InputTuple,
    SetTrustedRemoteAddressEvent.OutputTuple,
    SetTrustedRemoteAddressEvent.OutputObject
  >;

  filters: {
    "Initialized(uint8)": TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    "RoleAdminChanged(bytes32,bytes32,bytes32)": TypedContractEvent<
      RoleAdminChangedEvent.InputTuple,
      RoleAdminChangedEvent.OutputTuple,
      RoleAdminChangedEvent.OutputObject
    >;
    RoleAdminChanged: TypedContractEvent<
      RoleAdminChangedEvent.InputTuple,
      RoleAdminChangedEvent.OutputTuple,
      RoleAdminChangedEvent.OutputObject
    >;

    "RoleGranted(bytes32,address,address)": TypedContractEvent<
      RoleGrantedEvent.InputTuple,
      RoleGrantedEvent.OutputTuple,
      RoleGrantedEvent.OutputObject
    >;
    RoleGranted: TypedContractEvent<
      RoleGrantedEvent.InputTuple,
      RoleGrantedEvent.OutputTuple,
      RoleGrantedEvent.OutputObject
    >;

    "RoleRevoked(bytes32,address,address)": TypedContractEvent<
      RoleRevokedEvent.InputTuple,
      RoleRevokedEvent.OutputTuple,
      RoleRevokedEvent.OutputObject
    >;
    RoleRevoked: TypedContractEvent<
      RoleRevokedEvent.InputTuple,
      RoleRevokedEvent.OutputTuple,
      RoleRevokedEvent.OutputObject
    >;

    "SetMinDstGas(uint16,uint16,uint256)": TypedContractEvent<
      SetMinDstGasEvent.InputTuple,
      SetMinDstGasEvent.OutputTuple,
      SetMinDstGasEvent.OutputObject
    >;
    SetMinDstGas: TypedContractEvent<
      SetMinDstGasEvent.InputTuple,
      SetMinDstGasEvent.OutputTuple,
      SetMinDstGasEvent.OutputObject
    >;

    "SetMinDstGasLookup(uint16,uint256,uint256)": TypedContractEvent<
      SetMinDstGasLookupEvent.InputTuple,
      SetMinDstGasLookupEvent.OutputTuple,
      SetMinDstGasLookupEvent.OutputObject
    >;
    SetMinDstGasLookup: TypedContractEvent<
      SetMinDstGasLookupEvent.InputTuple,
      SetMinDstGasLookupEvent.OutputTuple,
      SetMinDstGasLookupEvent.OutputObject
    >;

    "SetPrecrime(address)": TypedContractEvent<
      SetPrecrimeEvent.InputTuple,
      SetPrecrimeEvent.OutputTuple,
      SetPrecrimeEvent.OutputObject
    >;
    SetPrecrime: TypedContractEvent<
      SetPrecrimeEvent.InputTuple,
      SetPrecrimeEvent.OutputTuple,
      SetPrecrimeEvent.OutputObject
    >;

    "SetTrustedRemote(uint16,bytes)": TypedContractEvent<
      SetTrustedRemoteEvent.InputTuple,
      SetTrustedRemoteEvent.OutputTuple,
      SetTrustedRemoteEvent.OutputObject
    >;
    SetTrustedRemote: TypedContractEvent<
      SetTrustedRemoteEvent.InputTuple,
      SetTrustedRemoteEvent.OutputTuple,
      SetTrustedRemoteEvent.OutputObject
    >;

    "SetTrustedRemoteAddress(uint16,bytes)": TypedContractEvent<
      SetTrustedRemoteAddressEvent.InputTuple,
      SetTrustedRemoteAddressEvent.OutputTuple,
      SetTrustedRemoteAddressEvent.OutputObject
    >;
    SetTrustedRemoteAddress: TypedContractEvent<
      SetTrustedRemoteAddressEvent.InputTuple,
      SetTrustedRemoteAddressEvent.OutputTuple,
      SetTrustedRemoteAddressEvent.OutputObject
    >;
  };
}