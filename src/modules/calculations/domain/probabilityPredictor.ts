/**
 * xP → Win/Draw/Loss probability model (score-free)
 *
 * Based on:
 * 1. d = xP_home - xP_away
 * 2. Draw probability decays with |d|
 * 3. Remaining probability split via logistic tilt
 */

export type XPModelParams = {
  d: number // expected points difference (home - away)
  k: number // draw decay factor
  alpha: number // outcome sensitivity
  p0?: number // baseline draw probability at d = 0 (default 0.28)
}

export type OutcomeProbabilities = {
  home: number
  draw: number
  away: number
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x))
}

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/**
 * Core model:
 * P_draw(d) = p0 * exp(-k * |d|)
 * P_home = (1 - P_draw) * sigmoid(alpha * d)
 * P_away = remaining
 */
export function xpToOutcomeProbs(params: XPModelParams): OutcomeProbabilities {
  const { d, k, alpha, p0 = 0.28 } = params

  // 1. Draw probability (shrinks with mismatch)
  const draw = p0 * Math.exp(-k * Math.abs(d))

  // 2. Remaining probability mass
  const remaining = 1 - draw

  // 3. Directional split via logistic
  const homeShare = logistic(alpha * d)

  const home = remaining * homeShare
  const away = remaining - home

  return {
    home: clamp01(home),
    draw: clamp01(draw),
    away: clamp01(away),
  }
}
