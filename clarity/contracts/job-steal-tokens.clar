;; Add DIKO to liquidation pool every 1008 blocks
(impl-trait .arkadiko-automation-trait-v1.automation-trait)
(use-trait ft-trait .sip-010-trait-ft-standard.sip-010-trait)

(define-constant ERR-NOT-REGISTERED u999)
(define-constant ERR-ALREADY-INITIALIZED u998)

(define-data-var initialized bool false)

(define-public (initialize)
  (begin
    (asserts! (not (var-get initialized)) (err ERR-ALREADY-INITIALIZED))
    (var-set initialized true)

    (ok true)
  )
)

(define-read-only (check-job)
  (let (
    (end-epoch-block u1000);; (contract-call? 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-liquidation-rewards-diko-v1-1 get-end-epoch-block))
  )
    (asserts! (>= block-height end-epoch-block) (ok false))

    (ok true)
  )
)

(define-public (run-job)
  (begin
    (asserts! (unwrap-panic (check-job)) (ok false))

    ;; (try! (contract-call? 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-liquidation-rewards-diko-v1-1 add-rewards 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-liquidation-rewards-v1-1))
    (ok true)
  )
)
