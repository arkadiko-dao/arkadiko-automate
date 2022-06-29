;; Add DIKO to liquidation pool every 1008 blocks
(impl-trait .arkadiko-automation-trait-v1.automation-trait)
(use-trait ft-trait .sip-010-trait-ft-standard.sip-010-trait)

(define-constant CONTRACT-OWNER tx-sender)

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
  (ok true)
)

(define-public (run-job)
  (begin
    (try! (stx-transfer? u1 tx-sender CONTRACT-OWNER))
    (ok true)
  )
)
