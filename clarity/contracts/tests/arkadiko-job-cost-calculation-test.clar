(impl-trait .arkadiko-job-cost-calculation-trait-v1.cost-calculation-trait)

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED u403)

(define-data-var cost-in-diko uint u9990000) ;; 9.99 DIKO

(define-public (calculate-cost (contract principal))
  (ok (var-get cost-in-diko))
)

(define-public (set-cost-in-diko (diko uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (ok (var-set cost-in-diko diko))
  )
)
