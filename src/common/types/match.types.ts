export type Match = {
  status: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  odds: MatchOdds
}

export type MatchOdds = {
  home: number | null
  draw: number | null
  away: number | null
}
