import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.31.0/index.ts";

import { 
  JobRegistry,
} from './models/arkadiko-job-registry-helpers.ts';

import * as Utils from './models/arkadiko-tests-utils.ts';

Clarinet.test({name: "job registry: register job",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool", 0.1, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    let call = await jobRegistry.getJobById(1);
    call.result.expectTuple()['enabled'].expectBool(true);
    call.result.expectTuple()['owner'].expectPrincipal('ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5');
    call.result.expectTuple()['contract'].expectPrincipal(Utils.qualifiedName("job-diko-liquidation-pool"));
    call.result.expectTuple()['cost'].expectUintWithDecimals(10);
    call.result.expectTuple()['fee'].expectUintWithDecimals(0.1);
    call.result.expectTuple()['last-executed'].expectUint(0);
    call.result.expectTuple()['executions'].expectUint(0);

    call = await jobRegistry.getContractInfo();
    call.result.expectTuple()['last-job-id'].expectUint(1);
    call.result.expectTuple()['cost-contract'].expectPrincipal(Utils.qualifiedName("arkadiko-job-cost-calculation-v1-1"));
    call.result.expectTuple()['executor-contract'].expectPrincipal(Utils.qualifiedName("arkadiko-job-executor-v1-1"));
    call.result.expectTuple()['minimum-fee'].expectUintWithDecimals(0.001);
    call.result.expectTuple()['contract-enabled'].expectBool(true);
    call.result.expectTuple()['withdraw-enabled'].expectBool(true);

    result = jobRegistry.shouldRun(1, "job-diko-liquidation-pool");
    result.expectOk().expectBool(false); // execution not required

    result = jobRegistry.runJob(deployer, 1, "job-diko-liquidation-pool", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(false); // execution not required
  }
});

Clarinet.test({name: "job registry: register and run job",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectOk().expectBool(true);

    result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool", 0.1, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(deployer, 1, "job-diko-liquidation-pool", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(false); // execution not required
    
    result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-test", 0.1, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(deployer, 2, "job-diko-liquidation-pool-test", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(true);

    let call = await jobRegistry.getContractInfo();
    call.result.expectTuple()['last-job-id'].expectUint(2);

    call = await jobRegistry.getAccountByOwner(wallet_1.address);
    call.result.expectTuple()['diko'].expectUintWithDecimals(990);
    call.result.expectTuple()['stx'].expectUintWithDecimals(999.9);
    call.result.expectTuple()['jobs'].expectList()[0].expectUint(1);
    call.result.expectTuple()['jobs'].expectList()[1].expectUint(2);
  }
});

Clarinet.test({name: "job registry: running job decreases owner balance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectOk().expectBool(true);

    result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-test", 0.1, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(deployer, 1, "job-diko-liquidation-pool-test", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(true);

    let call = await jobRegistry.getAccountByOwner(wallet_1.address);
    call.result.expectTuple()['diko'].expectUintWithDecimals(990);
    call.result.expectTuple()['stx'].expectUintWithDecimals(999.9);
  }
});

Clarinet.test({name: "job registry: running job increases executions counter",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectOk().expectBool(true);

    result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-test", 0.1, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(deployer, 1, "job-diko-liquidation-pool-test", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(true);

    let call = await jobRegistry.getJobById(1);
    call.result.expectTuple()['executions'].expectUint(1);

    result = jobRegistry.runJob(deployer, 1, "job-diko-liquidation-pool-test", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(true);

    call = await jobRegistry.getJobById(1);
    call.result.expectTuple()['executions'].expectUint(2);
  }
});

Clarinet.test({name: "job registry: try running unregistered job",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.runJob(deployer, 1, "job-diko-liquidation-pool", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(false); // execution not required
  }
});

Clarinet.test({name: "job registry: do not run disabled job",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-test", 0.1, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectOk().expectBool(true);

    result = jobRegistry.toggleJobEnabled(wallet_1, 1);
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(deployer, 1, "job-diko-liquidation-pool-test", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(false);
  }
});

Clarinet.test({name: "job registry: credit account and withdraw",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let call = await jobRegistry.getAccountByOwner(wallet_1.address);
    call.result.expectTuple()['diko'].expectUintWithDecimals(0);
    call.result.expectTuple()['stx'].expectUintWithDecimals(0);

    let result = jobRegistry.creditAccount(wallet_1, 0, 0);
    result.expectOk().expectBool(true);

    call = await jobRegistry.getAccountByOwner(wallet_1.address);
    call.result.expectTuple()['diko'].expectUintWithDecimals(0);
    call.result.expectTuple()['stx'].expectUintWithDecimals(0);

    result = jobRegistry.creditAccount(wallet_1, 1000, 0);
    result.expectOk().expectBool(true);

    call = await jobRegistry.getAccountByOwner(wallet_1.address);
    call.result.expectTuple()['diko'].expectUintWithDecimals(1000);
    call.result.expectTuple()['stx'].expectUintWithDecimals(0);

    result = jobRegistry.creditAccount(wallet_1, 0, 1000);
    result.expectOk().expectBool(true);

    call = await jobRegistry.getAccountByOwner(wallet_1.address);
    call.result.expectTuple()['diko'].expectUintWithDecimals(1000);
    call.result.expectTuple()['stx'].expectUintWithDecimals(1000);

    result = jobRegistry.setWithdrawEnabled(false);
    result.expectOk().expectBool(true);

    // Withdraw not enabled 
    result = jobRegistry.withdrawAccount(wallet_1, 0, 1000);
    result.expectErr().expectUint(406);

    result = jobRegistry.setWithdrawEnabled(true);
    result.expectOk().expectBool(true);

    call = await jobRegistry.getContractInfo();
    call.result.expectTuple()['withdraw-enabled'].expectBool(true);

    // Withdraw too much
    result = jobRegistry.withdrawAccount(wallet_1, 2000, 1000);
    result.expectErr().expectUint(403);

    call = await jobRegistry.getAccountByOwner(wallet_1.address);
    call.result.expectTuple()['diko'].expectUintWithDecimals(1000);
    call.result.expectTuple()['stx'].expectUintWithDecimals(1000);

    // Withdraw half diko
    result = jobRegistry.withdrawAccount(wallet_1, 500, 0);
    result.expectOk().expectBool(true);

    // Withdraw half stx
    result = jobRegistry.withdrawAccount(wallet_1, 0, 500);
    result.expectOk().expectBool(true);

    // Withdraw all
    result = jobRegistry.withdrawAccount(wallet_1, 500, 500);
    result.expectOk().expectBool(true);

    call = await jobRegistry.getAccountByOwner(wallet_1.address);
    call.result.expectTuple()['diko'].expectUintWithDecimals(0);
    call.result.expectTuple()['stx'].expectUintWithDecimals(0);
  }
});

Clarinet.test({name: "job registry: register job with fee below minimum",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool", 0.00001, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    let call = await jobRegistry.getJobById(1);
    call.result.expectTuple()['fee'].expectUintWithDecimals(0.001);

    result = jobRegistry.setMinimumFee(0.005);
    result.expectOk().expectBool(true);

    call = await jobRegistry.getContractInfo();
    call.result.expectTuple()['minimum-fee'].expectUintWithDecimals(0.005);

    result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool", 0.00001, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    call = await jobRegistry.getJobById(2);
    call.result.expectTuple()['fee'].expectUintWithDecimals(0.005);

    call = await jobRegistry.getJobById(1);
    call.result.expectTuple()['fee'].expectUintWithDecimals(0.001);
  }
});

Clarinet.test({name: "job registry: only job and contract owner can toggle job enabled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-test", 0.1, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.toggleJobEnabled(deployer, 1);
    result.expectOk().expectBool(true);

    result = jobRegistry.toggleJobEnabled(wallet_2, 1);
    result.expectErr().expectUint(403);
  }
});

Clarinet.test({name: "job registry: disable contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool", 0.01, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectOk().expectBool(true);

    result = jobRegistry.setContractEnabled(false);
    result.expectOk().expectBool(true);

    let call = await jobRegistry.getContractInfo();
    call.result.expectTuple()['contract-enabled'].expectBool(false);

    result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool", 0.01, "arkadiko-job-cost-calculation-v1-1");
    result.expectErr().expectUint(405);

    result = jobRegistry.shouldRun(1, "job-diko-liquidation-pool");
    result.expectErr().expectUint(405);

    result = jobRegistry.runJob(wallet_1, 1, "job-diko-liquidation-pool", "arkadiko-job-executor-v1-1");
    result.expectErr().expectUint(405);

    result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectErr().expectUint(405);

    result = jobRegistry.withdrawAccount(wallet_1, 500, 0);
    result.expectErr().expectUint(405);
  }
});

Clarinet.test({name: "job registry: update cost contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.setCostContract("arkadiko-job-cost-calculation-test");
    result.expectOk().expectBool(true);

    let call = await jobRegistry.getContractInfo();
    call.result.expectTuple()['cost-contract'].expectPrincipal(Utils.qualifiedName("arkadiko-job-cost-calculation-test"));

    result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-test", 0.01, "arkadiko-job-cost-calculation-v1-1");
    result.expectErr().expectUint(403);

    result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-test", 0.01, "arkadiko-job-cost-calculation-test");
    result.expectOk().expectBool(true);

    call = await jobRegistry.getJobById(1);
    call.result.expectTuple()['cost'].expectUintWithDecimals(9.99);
  }
});

Clarinet.test({name: "job registry: can not run job if account balance too low",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-test", 0.01, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(wallet_1, 1, "job-diko-liquidation-pool-test", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(false);

    result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(wallet_1, 1, "job-diko-liquidation-pool-test", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(true);
  }
});

Clarinet.test({name: "job registry: run job with wrong contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-test", 0.01, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectOk().expectBool(true);

    result = jobRegistry.shouldRun(1, "job-diko-liquidation-pool");
    result.expectErr().expectUint(404);

    result = jobRegistry.runJob(wallet_1, 1, "job-diko-liquidation-pool", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(false);
  }
});

Clarinet.test({name: "job registry: run job with wrong executor",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-test", 0.01, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(wallet_1, 1, "job-diko-liquidation-pool-test", "arkadiko-job-executor-test");
    result.expectErr().expectUint(403);
  }
});

Clarinet.test({name: "job registry: try stealing tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    let result = jobRegistry.registerJob(wallet_1, "job-steal-tokens", 0.01, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(wallet_1, 1, "job-steal-tokens", "arkadiko-job-executor-v1-1");
    result.expectErr().expectUint(1);
  }
});
