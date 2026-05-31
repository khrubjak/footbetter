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

export function predictMatchOutcome(input: MatchInput): MatchPrediction {
  const { xpDifference, k = 1.2, alpha = 2.0, p0 = 0.31 } = input
  const d = xpDifference * 0.35 // scaling factor (tunable)

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
