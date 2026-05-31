import { readFileSync } from 'fs'
import type { Match, MatchOdds } from '../../../common/types/match.types'
import { Matrix, solve } from 'ml-matrix'

export type RatingDifference = {
  homeTeam: string
  awayTeam: string
  home: number
  away: number
  diff: number
}

export type Competition = {
  name: 'premier-league' | 'allsvenskan'
  country: 'england' | 'sweden'
  year: number
}

type MatchMatrix = number[][]
type TeamValue = Record<string, number>

export function getRatingDifference(
  competition: Competition,
  matchIndex: number,
): RatingDifference {
  const matches: Match[] = JSON.parse(
    readFileSync(
      `../../../data/${competition.year}-${competition.year + 1}_${competition.country}_${competition.name}.json`,
      'utf8',
    ),
  )

  const teams = [
    ...new Set(matches.flatMap((match) => [match.homeTeam, match.awayTeam])),
  ].sort()

  const matchOrderNumber: number = matches.length - matchIndex

  if (matchOrderNumber >= matches.length) {
    console.log(
      `The competition has less than ${matchOrderNumber} matches, providing the ex-post prediction`,
    )
    // rather throw an error matchOrderNumber = matches.length
  } else if (matchOrderNumber < teams.length) {
    console.log(
      `Error: Ratings unavailable as only ${matchOrderNumber - 1} matches were played at this stage of competition`,
    )
  } else if (matchOrderNumber <= (teams.length * 5) / 2) {
    console.log(
      `Warning: Ratings might be unstable or unavailable as only ${matchOrderNumber - 1} matches were played at this stage of competition`,
    )
  }

  const teamIndex: TeamValue = Object.fromEntries(
    teams.map((team, index) => [team, index]),
  )

  const teamResults: number[] = Array(teams.length).fill(0)
  const completedMatches: Match[] = matches.slice(matchIndex)

  let drawCounter: number = 0

  const matrix: MatchMatrix = Array.from({ length: teams.length }, () =>
    Array(teams.length).fill(0),
  )

  for (const match of completedMatches) {
    const row: number = teamIndex[match.homeTeam] ?? -1
    const col: number = teamIndex[match.awayTeam] ?? -1

    const matchResult = 1.5 * Math.sign(match.homeScore - match.awayScore) // points awarded as +1.5, -1.5 and -0.5 for draw
    const drawPenalty = matchResult == 0 ? -0.5 : 0
    if (matchResult == 0) {
      drawCounter++
    }

    if (
      matrix[row] !== undefined &&
      matrix[col] !== undefined &&
      matrix[row][col] !== undefined &&
      matrix[col][row] !== undefined &&
      matrix[row][row] !== undefined &&
      matrix[col][col] !== undefined &&
      teamResults[row] !== undefined &&
      teamResults[col] !== undefined
    ) {
      matrix[row]![col] -= 1
      matrix[col]![row] -= 1
      matrix[col]![col] += 1
      matrix[row]![row] += 1
      teamResults[row] += matchResult + drawPenalty
      teamResults[col] += -matchResult + drawPenalty
    }
  }

  // replace the last row of matrix by sum (for regularity purposes)
  const lastRow = matrix[matrix.length - 1]

  if (lastRow) {
    lastRow.fill(1)
  }

  //replace last result for sum of draw penalties
  const drawAverage = drawCounter / teams.length

  teamResults[teamResults.length - 1] = 0

  const A = new Matrix(matrix)

  const b = Matrix.columnVector(
    teamResults.map((element) => element + drawAverage),
  )

  const x = solve(A, b)
  const expectedPoints = x.to1DArray()

  //drawAverage should be substracted later
  const ratings: Record<string, number> = Object.fromEntries(
    teams.map((key, index) => [key, expectedPoints[index]]),
  )

  const homeRating = ratings[matches[matchIndex].homeTeam] ?? 0
  const awayRating = ratings[matches[matchIndex].awayTeam] ?? 0

  const ratingDifference: RatingDifference = {
    homeTeam: matches[matchIndex].homeTeam,
    awayTeam: matches[matchIndex].awayTeam,
    home: homeRating,
    away: awayRating,
    diff: homeRating - awayRating,
  }

  return ratingDifference
}

export function getBookmakerOdds(
  competition: Competition,
  matchIndex: number,
): MatchOdds {
  const matches: Match[] = JSON.parse(
    readFileSync(
      `../../../data/${competition.year}-${competition.year + 1}_${competition.country}_${competition.name}.json`,
      'utf8',
    ),
  )
  return matches[matchIndex].odds
}

export function getBookmakerProbabilities(
  competition: Competition,
  matchIndex: number,
): MatchOdds {
  const matches: Match[] = JSON.parse(
    readFileSync(
      `../../../data/${competition.year}-${competition.year + 1}_${competition.country}_${competition.name}.json`,
      'utf8',
    ),
  )

  const probabilities = matches[matchIndex].odds
  for (const key in probabilities) {
    probabilities[key] = 1 / probabilities[key]
  }
  return probabilities
}
