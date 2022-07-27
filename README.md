# Arkadiko Automate
https://www.arkadiko.finance/

Smart Contract Automation simplified, like IFTTT model (If This Happens, Then Execute That).

Execute actions based on certain events
- Block Height or Block Height Interval
- Based on Oracle/AMM data (if price drops/goes over, do X)
- Custom on-chain activity (if address X sends STX)
- Block Number

## Examples

1. Every 524 blocks, harvest ALEX farming rewards and sell for STX/USDA/... (need LP tokens on contract)
2. Whenever atALEX goes under the ALEX/atALEX ratio, buy atALEX
3. When the price of USDA goes under 75 cents, buy X STX
4. When a Megapont Ape drops under 2000 STX, buy it
5. Every 1008 blocks, add DIKO rewards to liquidation pool
6. Bid (X%) higher on Gamma when I no longer have the highest bid
7. Arbitrage?
8. Stop Loss Protection on Arkadiko Vaults
9. Initiate PoX Stacking
10. Unlock STX tokens from PoX
11. Update Oracle (from RedStone)

## Setup - Clarinet
1. Copy `.env.example.clarinet` in web folder to `.env`
2. Copy `.env.example.clarinet` in scripts folder to `.env`
3. Run `clarinet integrate` in clarity folder, wait for services to start
4. Deploy contracts using scripts `node deploy-dependencies.js`, `node deploy-contracts.js`
5. Deploy test jobs using `node deploy-jobs-mocknet.js`
6. Run `yarn dev` in web folder to start webserver
7. Go to `http://localhost:9000/test` to get STX and DIKO
8. Use UI to fund your account with STX and DIKO
9. Use UI to register job with contract name `ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG.job-diko-liquidation-pool-clarinet`
10. Use UI to register job with contract name `ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG.job-test-clarinet`
11. Deploy jobs with `node deploy-jobs-clarinet.js`
12. Use script to execute job `node main.js`

## Setup - Mocknet
1. Clone repo `https://github.com/stacks-network/stacks-blockchain-docker`
2. In mocknet folder, create .env file `cp sample.env .env`
3. In mocknet folder, open new .env file and insert `STACKS_CHAIN_ID=2147483648` on L14
4. In mocknet folder, open `conf/mocknet/Config.toml` and add contents from `clarinet/settings/Mocknet.toml`
5. In mocknet folder, run `./manage.sh -n mocknet -a start` to start mocknet
6. Copy `.env.example.mocknet` in web folder to `.env`
7. Copy `.env.example.mocknet` in scripts folder to `.env`
8. Deploy contracts using scripts `node deploy-dependencies.js`, `node deploy-contracts.js`
9. Deploy test jobs using `node deploy-jobs-mocknet.js`
10. Run `yarn dev` in web folder to start webserver
11. Go to `http://localhost:9000/test` to get STX and DIKO
12. Use UI to fund your account with STX and DIKO
13. Use UI to register job with contract name `ST3KCNDSWZSFZCC6BE4VA9AXWXC9KEB16FBTRK36T.job-diko-liquidation-pool-mocknet`
14. Use UI to register job with contract name `ST3KCNDSWZSFZCC6BE4VA9AXWXC9KEB16FBTRK36T.job-test-mocknet`
15. Deploy jobs with `node deploy-jobs-mocknet.js`
16. Use script to execute job `node main.js`


