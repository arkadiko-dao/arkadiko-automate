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

    let call = chain.callReadOnlyFn("arkadiko-job-registry-v1-1", "get-job-by-id", [types.uint(1)], deployer.address);
    call.result.expectTuple()['owner'].expectPrincipal('ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5');

    block = chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "run-job", [
        types.uint(1),
        types.principal(Utils.qualifiedName("job-diko-liquidation-pool")),
        types.principal(Utils.qualifiedName("arkadiko-job-executor-v1-1")),
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(false); // execution not required

    block = chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "register-job", [
        types.principal(Utils.qualifiedName("job-diko-liquidation-pool-2")),
        types.uint(100000),
        types.principal(Utils.qualifiedName("arkadiko-job-cost-calculation-v1-1")),
      ], wallet_1.address),
      Tx.contractCall("arkadiko-job-registry-v1-1", "credit-account", [
        types.principal(wallet_1.address),
        types.uint(1000000000),
        types.uint(1000000000),
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "run-job", [
        types.uint(2),
        types.principal(Utils.qualifiedName("job-diko-liquidation-pool-2")),
        types.principal(Utils.qualifiedName("arkadiko-job-executor-v1-1")),
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
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
        types.principal(Utils.qualifiedName("arkadiko-job-executor-v1-1")),
      ], wallet_1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(false);
  }
});

Clarinet.test({name: "job registry: do not run disabled job",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let     block = chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "register-job", [
        types.principal(Utils.qualifiedName("job-diko-liquidation-pool-2")),
        types.uint(100000),
        types.principal(Utils.qualifiedName("arkadiko-job-cost-calculation-v1-1")),
      ], wallet_1.address),
      Tx.contractCall("arkadiko-job-registry-v1-1", "credit-account", [
        types.principal(wallet_1.address),
        types.uint(1000000000),
        types.uint(1000000000),
      ], wallet_1.address),
      Tx.contractCall("arkadiko-job-registry-v1-1", "toggle-job-enabled", [
        types.uint(1)
      ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "run-job", [
        types.uint(1),
        types.principal(Utils.qualifiedName("job-diko-liquidation-pool-2")),
        types.principal(Utils.qualifiedName("arkadiko-job-executor-v1-1")),
      ], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(false);


  }
});
