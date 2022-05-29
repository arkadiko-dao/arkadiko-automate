;; Harvest ALEX from the STX/xBTC pool
;; Turn ALEX into STX on STX/ALEX pair
(impl-trait .arkadiko-automation-trait-v1.automation-trait)

(define-data-var last-execution uint block-height)
(define-data-var execution-interval uint u525)
(define-data-var reward-cycle uint u28)

(define-public (initialize)
  (ok true)
)

(define-read-only (check-job)
  (begin
    (asserts! (> block-height (+ (var-get last-execution) (var-get execution-interval))) (ok false))

    (ok true)
  )
)

(define-public (run-job)
  (begin
    ;; (try!
    ;;   (contract-call? 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.staking-helper claim-staking-reward
    ;;     'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.fwp-wstx-wbtc-50-50-v1-01
    ;;     (list u28)
    ;;   )
    ;; )

    (ok false)
  )
)
