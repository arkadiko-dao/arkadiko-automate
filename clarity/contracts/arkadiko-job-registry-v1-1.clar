;; Arkadiko Automate - Job Registry
;; Keeps track of DIKO balances of principals running registered jobs
;; Each time a job is ran, DIKO is debited from the principal's account
(impl-trait .arkadiko-job-registry-trait-v1.job-registry-trait)
(use-trait automation-trait .arkadiko-automation-trait-v1.automation-trait)
(use-trait cost-trait .arkadiko-job-cost-calculation-trait-v1.cost-calculation-trait)

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED u403)

(define-data-var last-job-id uint u0)
(define-data-var cost-contract principal .arkadiko-job-cost-calculation-v1-1)
(define-map accounts { owner: principal } { diko: uint })
(define-map jobs { job-id: uint } { registered: bool, owner: principal, contract: principal, cost: uint })

(define-read-only (get-job-by-id (id uint))
  (default-to
    {
      registered: false,
      owner: tx-sender,
      contract: tx-sender,
      cost: u0
    }
    (map-get? jobs { job-id: id })
  )
)

;; Debits DIKO from the principal's account
;; TODO: amount of DIKO is based on cost of the job
;; See costs-2 contract to calculate cost? 
(define-public (debit-account (job-id uint))
  (ok true)
)

(define-public (register-job (contract principal) (used-cost-contract <cost-trait>))
  (let (
    (job-id (+ u1 (var-get last-job-id)))
    (cost (contract-call? used-cost-contract calculate-cost contract))
  )
    (asserts! (is-eq (var-get cost-contract) (contract-of used-cost-contract)) (err ERR-NOT-AUTHORIZED))
    (map-set jobs { job-id: job-id } { registered: true, owner: tx-sender, contract: contract, cost: (unwrap-panic cost) })
    (ok true)
  )
)

(define-public (run-job (job-id uint) (job <automation-trait>))
  (let (
    (job-entry (get-job-by-id job-id))
    (cost-in-diko (* (get cost job-entry) u1000000))
  )
    (asserts! (is-eq (contract-of job) (get contract job-entry)) (ok false))
    (try! (contract-call? job run-job))
    ;; (try! (as-contract (contract-call? 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token transfer cost-in-diko tx-sender contract-caller none)))

    (ok true)
  )
)

(define-public (set-cost-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-NOT-AUTHORIZED))

    (ok (var-set cost-contract contract))
  )
)
