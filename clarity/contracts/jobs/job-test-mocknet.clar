;; Add DIKO to liquidation pool every 1008 blocks

;; TODO - Update for mainnet
(impl-trait 'ST3EQ88S02BXXD0T5ZVT3KW947CRMQ1C6DMQY8H19.arkadiko-automation-trait-v1.automation-trait)

(define-data-var end-block uint (+ block-height u6)) 

(define-public (initialize)
  (ok true)
)

(define-read-only (check-job)
  (begin
    (asserts! (>= block-height (var-get end-block)) (ok false))

    (ok true)
  )
)

(define-public (run-job)
  (begin
    (asserts! (unwrap-panic (check-job)) (ok false))

    (var-set end-block (+ (var-get end-block) u6))

    (ok true)
  )
)
