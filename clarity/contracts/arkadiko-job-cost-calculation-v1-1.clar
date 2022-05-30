(impl-trait .arkadiko-job-cost-calculation-trait-v1.cost-calculation-trait)

;; TODO: calculate cost
;; https://explorer.stacks.co/txid/0xece8e369310b5ff9b92ef11181ae0d2457ac0c821376d4a96c4998763e22ad04?chain=mainnet
;; hard-coded to 10 DIKO right now
(define-public (calculate-cost (contract principal))
  (ok u10000000)
)
