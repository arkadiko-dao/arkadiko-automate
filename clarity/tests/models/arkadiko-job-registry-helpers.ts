import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet/index.ts";

import * as Utils from './arkadiko-tests-utils.ts';

// ---------------------------------------------------------
// Job  Registry
// ---------------------------------------------------------

class JobRegistry {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  getJobById(jobId: number) {
    return this.chain.callReadOnlyFn("arkadiko-job-registry-v1-1", "get-job-by-id", [
      types.uint(jobId),
    ], this.deployer.address);
  }

  getAccountByOwner(owner: string) {
    return this.chain.callReadOnlyFn("arkadiko-job-registry-v1-1", "get-account-by-owner", [
      types.principal(owner),
    ], this.deployer.address);
  }

  registerJob(sender: Account, contract: string, fee: number, costCalculator: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "register-job", [
        types.principal(Utils.qualifiedName(contract)),
        types.uint(fee * 1000000),
        types.principal(Utils.qualifiedName(costCalculator)),
      ], sender.address),
    ]);
    return block.receipts[0].result;
  }

  runJob(sender: Account, jobId: number, contract: string, jobExecutor: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "run-job", [
        types.uint(jobId),
        types.principal(Utils.qualifiedName(contract)),
        types.principal(Utils.qualifiedName(jobExecutor)),
      ], sender.address),
    ]);
    return block.receipts[0].result;
  }

  creditAccount(sender: Account, diko: number, stx: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "credit-account", [
        types.principal(sender.address),
        types.uint(diko * 1000000),
        types.uint(stx * 1000000),
      ], sender.address),
    ]);
    return block.receipts[0].result;
  }

  withdrawAccount(sender: Account, diko: number, stx: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "withdraw-account", [
        types.uint(diko * 1000000),
        types.uint(stx * 1000000),
      ], sender.address),
    ]);
    return block.receipts[0].result;
  }
  
  toggleJobEnabled(sender: Account, jobId: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "toggle-job-enabled", [
        types.uint(jobId),
      ], sender.address),
    ]);
    return block.receipts[0].result;
  }

  setWithdrawEnabled(enabled: boolean) {
    let block = this.chain.mineBlock([
      Tx.contractCall("arkadiko-job-registry-v1-1", "set-withdraw-enabled", [
        types.bool(enabled),
      ], this.deployer.address),
    ]);
    return block.receipts[0].result;
  }
}
export { JobRegistry };
