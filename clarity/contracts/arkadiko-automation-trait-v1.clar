(define-trait automation-trait
  (
    ;; read-only function to check if job should be ran
    (check-job () (response bool bool))

    ;; public function that runs the job logic
    (run-job () (response bool uint))
  )
)
