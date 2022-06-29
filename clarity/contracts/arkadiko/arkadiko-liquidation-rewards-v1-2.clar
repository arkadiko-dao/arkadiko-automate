(impl-trait .arkadiko-liquidation-rewards-trait-v2.liquidation-rewards-trait)
(use-trait ft-trait .sip-010-trait-ft-standard.sip-010-trait)

(define-public (add-reward (share-block uint) (token-is-stx bool) (token <ft-trait>) (total-amount uint))
  (add-reward-locked share-block u0 token-is-stx token total-amount)
)

(define-public (add-reward-locked (share-block uint) (unlock-block uint) (token-is-stx bool) (token <ft-trait>) (total-amount uint))
  (ok true)
)
