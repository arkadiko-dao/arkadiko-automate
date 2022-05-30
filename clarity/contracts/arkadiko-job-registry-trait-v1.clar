(use-trait automation-trait .arkadiko-automation-trait-v1.automation-trait)
(use-trait cost-trait .arkadiko-job-cost-calculation-trait-v1.cost-calculation-trait)

(define-trait job-registry-trait
  (
    (register-job (principal <cost-trait>) (response bool uint))
    (run-job (uint <automation-trait>) (response bool uint))
  )
)
