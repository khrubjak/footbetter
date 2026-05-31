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

const competition: Competition = {
  country: 'england',
  name: 'premier-league',
  year: 2020,
}

const matchIndex: number = 200 // index of a match to predict

const futureMatch = getRatingDifference(competition, matchIndex)

console.log(futureMatch)

console.log(getBookmakerProbabilities(competition, matchIndex))

const prediction = predictMatchOutcome({
  xpDifference: futureMatch.diff,
})

console.log(prediction)
