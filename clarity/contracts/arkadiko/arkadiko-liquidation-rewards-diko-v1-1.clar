(use-trait liquidation-rewards-trait .arkadiko-liquidation-rewards-trait-v2.liquidation-rewards-trait)


(define-data-var end-epoch-block uint (+ block-height u100)) 

(define-read-only (get-end-epoch-block)
  (ok (var-get end-epoch-block))
)

(define-public (add-rewards (liquidation-rewards <liquidation-rewards-trait>))
  (ok u123)
)
