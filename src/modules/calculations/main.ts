import {
  predictMatchOutcome,
  type MatchInput,
} from './services/oppotunitySelector.ts'
import {
  getRatingDifference,
  getBookmakerOdds,
  type Competition,
} from './domain/ratingCalculator.ts'

const competition: Competition = {
  country: 'england',
  name: 'premier-league',
  year: 2020,
}

const futureMatch = getRatingDifference(competition, 200)

console.log(futureMatch)

console.log(getBookmakerOdds(competition, 200))

const prediction = predictMatchOutcome({
  xpDifference: futureMatch.diff,
})

console.log(prediction)
