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
    
    result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-2", 0.1, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(deployer, 2, "job-diko-liquidation-pool-2", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(true);
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

    let result = jobRegistry.registerJob(wallet_1, "job-diko-liquidation-pool-2", 0.1, "arkadiko-job-cost-calculation-v1-1");
    result.expectOk().expectBool(true);

    result = jobRegistry.creditAccount(wallet_1, 1000, 1000);
    result.expectOk().expectBool(true);

    result = jobRegistry.toggleJobEnabled(wallet_1, 1);
    result.expectOk().expectBool(true);

    result = jobRegistry.runJob(deployer, 1, "job-diko-liquidation-pool-2", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(false);
  }
});

Clarinet.test({name: "job registry: try stealing tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let jobRegistry = new JobRegistry(chain, deployer);

    // TODO: test is wrong
    let result = jobRegistry.runJob(wallet_1, 1, "job-diko-liquidation-pool", "arkadiko-job-executor-v1-1");
    result.expectOk().expectBool(false);
  }
});
