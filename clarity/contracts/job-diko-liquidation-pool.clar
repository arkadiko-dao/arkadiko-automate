;; Add DIKO to liquidation pool every 1008 blocks
(impl-trait .arkadiko-automation-trait-v1.automation-trait)
(use-trait ft-trait .sip-010-trait-ft-standard.sip-010-trait)

(define-constant ERR-NOT-REGISTERED u999)
(define-constant ERR-ALREADY-INITIALIZED u998)

(define-data-var initialized bool false)

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
