import { readFileSync } from 'fs'
import type { Match } from '../../../common/types/match.types'

type MatchMatrix = number[][]
type TeamMapper = Record<string, number>

const matches: Match[] = JSON.parse(
  readFileSync(
    '../../../../data/2021-2022_england_premier-league.json',
    'utf8',
  ),
)

const teams = [
  ...new Set(matches.flatMap((match) => [match.homeTeam, match.awayTeam])),
].sort()

const teamIndex = Object.fromEntries(teams.map((team, index) => [team, index]))

const matrix: MatchMatrix = Array.from({ length: teams.length }, () =>
  Array(teams.length).fill(0),
)

for (const match of matches) {
  const row: number = teamIndex[match.homeTeam]
  //console.log(`${teamIndex[match.homeTeam]} and ${teamIndex[match.awayTeam]}`)
  const col: number = teamIndex[match.awayTeam]

  if (
    matrix[row] !== undefined &&
    matrix[col] !== undefined &&
    matrix[row][col] !== undefined &&
    matrix[col][row] !== undefined &&
    matrix[row][row] !== undefined &&
    matrix[col][col] !== undefined
  ) {
    matrix[row]![col] -= 1
    matrix[col]![row] -= 1
    matrix[col]![col] += 1
    matrix[row]![row] += 1
    //console.log('blah')
  }
}

console.log(matrix)

//console.log(`Hello, ${matches[0]?.homeTeam}`)
