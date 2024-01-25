export const allowVerifyChain = [
  "mainnet",
  "ropsten",
  "rinkeby",
  "goerli",
  "kovan",
  "bsctest",
  "bscmain",
  "hecotest",
  "hecomain",
  "maticmain",
  "ftmtest",
  "ftmmain",
  "hoomain",
];

type AddressMap = { [name: string]: string };

export function compileSetting(version: string, runs: number) {
  return {
    version: version,
    settings: {
      optimizer: {
        enabled: true,
        runs: runs,
      },
      outputSelection: {
        "*": {
          "*": [
            "abi",
            "evm.bytecode",
            "evm.deployedBytecode",
            "evm.methodIdentifiers",
            "metadata",
            "storageLayout",
          ],
          "": ["ast"],
        },
      },
    },
  };
}
