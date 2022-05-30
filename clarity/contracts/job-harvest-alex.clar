;; Harvest ALEX from the STX/xBTC pool
;; Turn ALEX into STX on STX/ALEX pair
(impl-trait .arkadiko-automation-trait-v1.automation-trait)
(use-trait ft-trait .sip-010-trait-ft-standard.sip-010-trait)

(define-constant ERR-NOT-REGISTERED u999)
(define-constant ERR-ALREADY-INITIALIZED u998)

(define-data-var contract-owner principal tx-sender)
(define-data-var last-execution uint block-height)
(define-data-var execution-interval uint u525)
(define-data-var reward-cycle uint u28)
(define-data-var initialized bool false)

(define-map registered-tokens { token: principal } { registered: bool })

(define-read-only (get-registered-token (token principal))
  (default-to
    {
      registered: false
    }
    (map-get? registered-tokens { token: token })
  )
)

(define-public (initialize)
  (begin
    (asserts! (not (var-get initialized)) (err ERR-ALREADY-INITIALIZED))
    (var-set initialized true)

    (ok true)
  )
)

(define-read-only (check-job)
  (begin
    (asserts! (> block-height (+ (var-get last-execution) (var-get execution-interval))) (err false))

    (ok true)
  )
)

(define-public (run-job)
  (begin
    (asserts! (unwrap-panic (check-job)) (ok false))
    ;; (try!
    ;;   (contract-call? 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.staking-helper claim-staking-reward
    ;;     'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.fwp-wstx-wbtc-50-50-v1-01
    ;;     (list u28)
    ;;   )
    ;; )

    (ok true)
  )
)

(define-public (withdraw-token (token <ft-trait>) (amount uint))
  (begin
    (asserts! (get registered (get-registered-token (contract-of token))) (err ERR-NOT-REGISTERED))

    (as-contract (contract-call? token transfer amount tx-sender (var-get contract-owner) none))
  )
)
