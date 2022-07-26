;; Add DIKO to liquidation pool every 1008 blocks

;; TODO - Update for mainnet
(impl-trait 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.arkadiko-automation-trait-v1.automation-trait)

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
