import {
  xpToOutcomeProbs,
  type OutcomeProbabilities,
} from '../domain/probabilityPredictor.ts'
///import type { OutcomeProbabilities} "../domain/probabilityPredictor.js"
import {
  getRatingDifference,
  getBookmakerOdds,
} from '../domain/ratingCalculator.ts'

export type MatchInput = {
  xpDifference: number

  //Optional tuning overrides
  k?: number
  alpha?: number
  p0?: number
}

export type MatchPrediction = OutcomeProbabilities & {
  d: number
}

/**
 * Main pipeline:
 *
 * 1. Get rating difference (home - away)
 * 2. Convert rating diff → expected points difference (d)
 * 3. Feed into xP → probability model
 */
export function predictMatchOutcome(input: MatchInput): MatchPrediction {
  const { xpDifference, k = 1.2, alpha = 2.0, p0 = 0.28 } = input

  /**
   * 2. Convert rating difference into expected points difference (d)
   *
   * This is intentionally flexible:
   * - You can replace scaling factor later with calibration
   */
  const d = xpDifference * 0.35 // scaling factor (tunable)

  // 3. Convert to probabilities
  const probs = xpToOutcomeProbs({
    d,
    k,
    alpha,
    p0,
  })

  return {
    ...probs,
    d,
  }
}
