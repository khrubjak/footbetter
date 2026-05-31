import type { MatchOdds } from '../../../common/types/match.types'

type Outcome = keyof MatchOdds

type BetRecommendation = {
  outcome: Outcome
  modelProbability: number
  bookmakerProbability: number
  decimalOdds: number
  edge: number
  expectedValue: number
  kellyFraction: number
} | null

export function findBestBet(
  bookmakerProbabilities: MatchOdds,
  modelProbabilities: MatchOdds,
): BetRecommendation {
  const outcomes: Outcome[] = ['home', 'draw', 'away']

  let best: BetRecommendation = null

  for (const outcome of outcomes) {
    const bookProb = bookmakerProbabilities[outcome]
    const modelProb = modelProbabilities[outcome]

    if (
      bookProb == null ||
      modelProb == null ||
      bookProb <= 0 ||
      bookProb >= 1 ||
      modelProb <= 0 ||
      modelProb >= 1
    ) {
      continue
    }

    // Convert bookmaker probability back to odds
    const odds = 1 / bookProb
    const edge = modelProb - bookProb

    // Expected value per unit staked
    const ev = modelProb * odds - 1

    if (ev <= 0) {
      continue
    }

    // Kelly criterion
    const b = odds - 1
    const p = modelProb
    const q = 1 - p

    const kelly = (b * p - q) / b

    if (kelly <= 0) {
      continue
    }

    const candidate: BetRecommendation = {
      outcome,
      modelProbability: modelProb,
      bookmakerProbability: bookProb,
      decimalOdds: odds,
      edge,
      expectedValue: ev,
      kellyFraction: kelly,
    }

    if (!best || candidate.expectedValue > best.expectedValue) {
      best = candidate
    }
  }

  return best
}
