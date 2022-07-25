;; Add DIKO to liquidation pool every 1008 blocks

;; TODO - Update for mainnet
(impl-trait 'ST3EQ88S02BXXD0T5ZVT3KW947CRMQ1C6DMQY8H19.arkadiko-automation-trait-v1.automation-trait)

(define-public (initialize)
  (ok true)
)

(define-read-only (check-job)
  (let (
    ;; TODO - Update for mainnet
    (end-epoch-block (unwrap-panic (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.arkadiko-liquidation-rewards-diko-v1-1 get-end-epoch-block)))
  )
    (asserts! (>= block-height end-epoch-block) (ok false))

    (ok true)
  )
)

(define-public (run-job)
  (begin
    (asserts! (unwrap-panic (check-job)) (ok false))

    ;; TODO - Update for mainnet
    (unwrap-panic (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.arkadiko-liquidation-rewards-diko-v1-1 add-rewards 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.arkadiko-liquidation-rewards-v1-2))
    
    (ok true)
  )
)
