import { readFileSync } from 'fs'
import type { Match } from '../../../common/types/match.types'
import { Matrix, solve } from 'ml-matrix'

type MatchMatrix = number[][]
type TeamValue = Record<string, number>

const matches: Match[] = JSON.parse(
  readFileSync(
    '../../../../data/2019-2020_england_premier-league.json',
    'utf8',
  ),
)

const teams = [
  ...new Set(matches.flatMap((match) => [match.homeTeam, match.awayTeam])),
].sort()

const teamIndex: TeamValue = Object.fromEntries(
  teams.map((team, index) => [team, index]),
)

const teamResults: number[] = Array(teams.length).fill(0)

let drawCounter: number = 0

const matrix: MatchMatrix = Array.from({ length: teams.length }, () =>
  Array(teams.length).fill(0),
)

for (const match of matches) {
  const row: number = teamIndex[match.homeTeam] ?? -1
  //console.log(`${teamIndex[match.homeTeam]} and ${teamIndex[match.awayTeam]}`)
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

//drawAverageshould be substracted later

const zip = (k: string[], v: number[]) =>
  k.map((key, i) => ({ key, value: v[i] }))

console.log(zip(teams, expectedPoints))

//console.log(`Hello, ${matches[0]?.homeTeam}`)
