(define-trait job-registry-trait
  (
    ;; public function to charge for the job
    (debit-account (uint) (response bool bool))
  )
)
