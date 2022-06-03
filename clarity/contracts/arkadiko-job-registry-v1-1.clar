;; Arkadiko Automate - Job Registry
;; Keeps track of DIKO balances of principals running registered jobs
;; Each time a job is ran, DIKO is debited from the principal's account
(impl-trait .arkadiko-job-registry-trait-v1.job-registry-trait)
(use-trait automation-trait .arkadiko-automation-trait-v1.automation-trait)
(use-trait cost-trait .arkadiko-job-cost-calculation-trait-v1.cost-calculation-trait)

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED u403)
(define-constant ERR-NOT-REGISTERED u404)

(define-data-var last-job-id uint u0)
(define-data-var cost-contract principal .arkadiko-job-cost-calculation-v1-1)
(define-data-var minimum-fee uint u1000) ;; 0.001 STX min fee
(define-data-var minimum-diko uint u100000000) ;; 100 DIKO

(define-map accounts { owner: principal } { diko: uint })
(define-map jobs { job-id: uint } { registered: bool, owner: principal, contract: principal, cost: uint, fee: uint })

(define-read-only (get-job-by-id (id uint))
  (default-to
    {
      registered: false,
      owner: tx-sender,
      contract: tx-sender,
      cost: u0,
      fee: u0
    }
    (map-get? jobs { job-id: id })
  )
)

(define-read-only (get-account-by-owner (owner principal))
  (default-to
    {
      diko: u0
    }
    (map-get? accounts { owner: owner })
  )
)

(define-read-only (has-minimum-diko (owner principal))
  (>= (get diko (get-account-by-owner owner)) (var-get minimum-diko))
)

;; read-only function to check if we should run the job
(define-public (should-run (job-id uint) (job <automation-trait>))
  (let (
    (job-entry (get-job-by-id job-id))
  )
    (asserts! (is-eq (contract-of job) (get contract job-entry)) (err ERR-NOT-REGISTERED))
    (asserts! (> (get cost job-entry) u0) (err ERR-NOT-REGISTERED))
    (asserts! (unwrap! (contract-call? job check-job) (ok false)) (ok false))
    (asserts! (has-minimum-diko (get owner job-entry)) (ok false))

    (ok true)
  )
)

(define-public (register-job (contract principal) (fee uint) (used-cost-contract <cost-trait>))
  (let (
    (job-id (+ u1 (var-get last-job-id)))
    (cost (contract-call? used-cost-contract calculate-cost contract))
    (min-fee (min-of (var-get minimum-fee) fee))
  )
    (asserts! (is-eq (var-get cost-contract) (contract-of used-cost-contract)) (err ERR-NOT-AUTHORIZED))
    (map-set jobs { job-id: job-id } { registered: true, owner: tx-sender, contract: contract, cost: (unwrap-panic cost), fee: min-fee })
    (var-set last-job-id job-id)
    (ok true)
  )
)

(define-public (run-job (job-id uint) (job <automation-trait>))
  (begin
    (asserts! (is-eq true (unwrap! (should-run job-id job) (ok false))) (ok false))

    (try! (contract-call? job run-job))
    (debit-account job-id)
  )
)

(define-public (credit-account (owner principal) (amount uint))
  (let (
    (account (get-account-by-owner owner))
  )
    (try! (contract-call? .arkadiko-token transfer amount tx-sender (as-contract tx-sender) none))

    (map-set accounts { owner: owner } { diko: (+ amount (get diko account)) })
    (ok true)
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;
;; private functions  ;;
;;;;;;;;;;;;;;;;;;;;;;;;

;; Debits DIKO from the principal's account
(define-private (debit-account (job-id uint))
  (let (
    (job-entry (get-job-by-id job-id))
    (sender tx-sender)
  )
    (try! (as-contract (contract-call? .arkadiko-token transfer (get cost job-entry) tx-sender sender none)))

    (ok true)
  )
)

(define-private (min-of (a uint) (b uint))
  (if (< a b)
    a
    b
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;
;; admin functions    ;;
;;;;;;;;;;;;;;;;;;;;;;;;

(define-public (set-cost-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (ok (var-set cost-contract contract))
  )
)

(define-public (set-minimum-fee (fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (ok (var-set minimum-fee fee))
  )
)

(define-public (set-minimum-diko (diko uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (ok (var-set minimum-diko diko))
  )
)
