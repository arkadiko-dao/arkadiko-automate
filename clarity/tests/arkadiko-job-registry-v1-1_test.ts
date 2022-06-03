import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.31.0/index.ts";

import * as Utils from './models/arkadiko-tests-utils.ts';

Clarinet.test({name: "job registry: register and run job",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "register-job", [
        types.principal(Utils.qualifiedName("job-diko-liquidation-pool")),
        types.uint(100000),
        types.principal(Utils.qualifiedName("arkadiko-job-cost-calculation-v1-1")),        
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "run-job", [
        types.uint(1),
        types.principal(Utils.qualifiedName("job-diko-liquidation-pool")),
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(false); // execution not required
  }
});

Clarinet.test({name: "job registry: try running unregistered job",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "run-job", [
        types.uint(1),
        types.principal(Utils.qualifiedName("job-diko-liquidation-pool")),
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(false);
  }
});

// Clarinet.test({name: "dual yield: mint for recipient",
//   async fn(chain: Chain, accounts: Map<string, Account>) {
//     let deployer = accounts.get("deployer")!;
//     let wallet_1 = accounts.get("wallet_1")!;

//     let block = chain.mineBlock([
//       Tx.contractCall("arkadiko-alex-dual-yield-v1-1", "mint", [
//         types.uint(100),
//         types.principal(deployer.address)
//       ], wallet_1.address),
//     ]);
//     block.receipts[0].result.expectErr().expectUint(32401);

//     block = chain.mineBlock([
//       Tx.contractCall("arkadiko-alex-dual-yield-v1-1", "mint", [
//         types.uint(100),
//         types.principal(deployer.address)
//       ], deployer.address),
//     ]);
//     block.receipts[0].result.expectErr().expectUint(1); // not enough DIKO in contract

//     // mint for 1 cycle
//     block = chain.mineBlock([
//       Tx.contractCall("arkadiko-governance-v2-1", "add-contract-address", [
//         types.ascii("arkadiko-alex-dual-yield-v1-1"),
//         types.principal(deployer.address),
//         types.principal(Utils.qualifiedName("arkadiko-alex-dual-yield-v1-1")),
//         types.bool(true),
//         types.bool(true)
//       ], deployer.address)
//     ]);
//     block.receipts[0].result.expectOk().expectBool(true);
//     block = chain.mineBlock([
//       Tx.contractCall("arkadiko-alex-dual-yield-v1-1", "mint-diko", [
//         types.uint(1),
//       ], deployer.address),
//     ]);
//     block.receipts[0].result.expectOk().expectBool(true);

//     let call = chain.callReadOnlyFn("arkadiko-token", "get-balance", [types.principal(deployer.address)], deployer.address);
//     call.result.expectOk().expectUint(890000000000);

//     block = chain.mineBlock([
//       Tx.contractCall("arkadiko-alex-dual-yield-v1-1", "mint", [
//         types.uint(100),
//         types.principal(deployer.address)
//       ], deployer.address),
//     ]);
//     block.receipts[0].result.expectOk().expectUint(100);

//     call = chain.callReadOnlyFn("arkadiko-token", "get-balance", [types.principal(deployer.address)], deployer.address);
//     call.result.expectOk().expectUint(890000000100);

//     block = chain.mineBlock([
//       Tx.contractCall("arkadiko-alex-dual-yield-v1-1", "toggle-shutdown", [], deployer.address),
//     ]);
//     block.receipts[0].result.expectOk().expectBool(true);
//     block = chain.mineBlock([
//       Tx.contractCall("arkadiko-alex-dual-yield-v1-1", "mint", [
//         types.uint(100),
//         types.principal(deployer.address)
//       ], deployer.address),
//     ]);
//     block.receipts[0].result.expectErr().expectUint(320001);

//     block = chain.mineBlock([
//       Tx.contractCall("arkadiko-alex-dual-yield-v1-1", "toggle-shutdown", [], deployer.address),
//     ]);
//     block = chain.mineBlock([
//       Tx.contractCall("arkadiko-alex-dual-yield-v1-1", "mint", [
//         types.uint(100),
//         types.principal(deployer.address)
//       ], deployer.address),
//     ]);
//     block.receipts[0].result.expectOk().expectUint(100);

//     block = chain.mineBlock([
//       Tx.contractCall("arkadiko-alex-dual-yield-v1-1", "mint", [
//         types.uint(13500000000),
//         types.principal(deployer.address)
//       ], deployer.address),
//     ]);
//     block.receipts[0].result.expectErr().expectUint(320002);
//   }
// });
