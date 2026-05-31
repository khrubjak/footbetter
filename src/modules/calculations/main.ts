import {
  predictMatchOutcome,
  type MatchInput,
} from './services/oppotunitySelector.ts'
import {
  getRatingDifference,
  getBookmakerOdds,
  getBookmakerProbabilities,
  type Competition,
} from './domain/ratingCalculator.ts'

import { findBestBet } from './domain/betRecommender.ts'

const competition: Competition = {
  country: 'england',
  name: 'premier-league',
  year: 2020,
}

const matchIndex: number = 10 // reversed index of a match to predict between 1 and 380

const futureMatch = getRatingDifference(competition, matchIndex)

const bookmakerProbabilities = getBookmakerProbabilities(
  competition,
  matchIndex,
)

const prediction = predictMatchOutcome({
  xpDifference: futureMatch.diff,
})

const bestBet = findBestBet(bookmakerProbabilities, prediction)

if (bestBet !== null) {
  console.log(
    `For the match: ${futureMatch.homeTeam} - ${futureMatch.awayTeam}, ` +
      `I would suggest betting on ${String(bestBet.outcome)} result, ` +
      `with the odds ${bestBet.decimalOdds}, while I would only recommend ` +
      `to bet ${Math.round(bestBet.kellyFraction * 100)}% of your current betting account balance`,
  )
} else {
  console.log(
    'I would not recommend betting for this match, as bookmakers seems strong here',
  )
}
