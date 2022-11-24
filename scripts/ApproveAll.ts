import { task } from "hardhat/config";
import { types } from "hardhat/config";
import { readFileSync } from "fs";
import { IERC20 } from "../typechain";
import { constants } from "ethers";


/**
npx hardhat aa \
--json "config json file" \
--rpc http://127.0.0.1:7545 \
--pk <admin private key> \
--gasprice 1000000000
 */
task("aa", "approve all sdrToken contract")
    .addParam("json", "config json file")
    .addParam("rpc", "rpc connect")
    .addParam("pk", "proxy admin private key")
    .addOptionalParam("gasprice", "gas price", 0, types.int)
    .setAction(
        async ({ json, rpc, pk, gasprice }, { ethers, run, network }) => {
            await run("compile");

            let config = JSON.parse(readFileSync(json).toString());
            let provider = new ethers.providers.JsonRpcProvider(rpc);
            const wallet = new ethers.Wallet(pk, provider);
            
        }
    );
