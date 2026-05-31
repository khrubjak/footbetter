import { chromium } from 'playwright'
import type { MatchOdds } from '../../../common/types/match.types'
import fs from 'fs'

const outputFilePath = '../../../data/'
const startYear = 2022
const endYear = 2022

type sourceUrlParts = {
  domain: string
  sport: 'football'
  country: 'england'
  competition: string
  //season: string
  view: 'results' | 'fixtures' | 'standings' | 'odds'
  expectedPages: number
}

type Match = {
  //date: string
  status: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  odds: MatchOdds
}

const source: sourceUrlParts = {
  domain: 'https://www.oddsportal.com',
  sport: 'football',
  country: 'england',
  competition: 'premier-league',
  view: 'results',
  expectedPages: 8,
}

const scrapedSeasonsArray = Array.from(
  { length: endYear - startYear + 1 },
  (_, i) => startYear + i,
)

async function scrapeSeason(year: number) {
  //const browser = await chromium.launch({ headless: true })
  //const page = await browser.newPage()

  const allMatches: Match[] = []
  const season = `${year}-` + `${year + 1}`

  const BASE =
    `${source.domain}/${source.sport}/` +
    `${source.country}/` +
    `${source.competition}-` +
    `${season}/` +
    `${source.view}/`

  for (let i = 1; i <= source.expectedPages; i++) {
    const url = i === 1 ? BASE : `${BASE}#/page/${i}/` //#/page/7/

    console.log(`Scraping page ${i}: ${url}`)

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const browser = await chromium.launch({ headless: true })
        const page = await browser.newPage()

        await page.goto(url, {
          waitUntil: 'domcontentloaded',
        })

        // cookie popup
        try {
          await page
            .getByRole('button', { name: /accept/i })
            .click({ timeout: 3000 })
        } catch {}

        try {
          await page
            .getByRole('button', { name: /accept/i })
            .click({ timeout: 3000 })
        } catch {}

        await page.waitForSelector('[data-testid="game-row"]')
        await page.waitForSelector('[data-v-115522af=""]')

        const matches: Match[] = await page.evaluate(() => {
          const rows = document.querySelectorAll('[data-testid="game-row"]')

          const results: Match[] = []

          rows.forEach((row) => {
            try {
              // status
              const status =
                row
                  .querySelector('[data-testid="time-item"]')
                  ?.textContent?.trim() || ''

              // teams
              const teamElements = row.querySelectorAll(
                '[data-testid="event-participants"] a[title]',
              )

              const homeTeam =
                teamElements[0]?.getAttribute('title')?.trim() || ''
              const awayTeam =
                teamElements[1]?.getAttribute('title')?.trim() || ''

              // scores
              const scoreNodes = row.querySelectorAll(
                '[data-testid="event-participants"] .relative .font-bold > div',
              )

              const scores = Array.from(scoreNodes)
                .map((el) => parseInt(el.textContent?.trim() || '', 10))
                .filter((n) => !isNaN(n))

              const homeScore = scores[0] ?? null
              const awayScore = scores[1] ?? null

              // odds
              const oddsEls = row.querySelectorAll(
                '[data-testid="odd-container-default"], [data-testid="odd-container-winning"]',
              )

              const oddsValues = Array.from(oddsEls)
                .map((el) => parseFloat(el.textContent || ''))
                .filter((n) => !isNaN(n))

              const odds = {
                home: oddsValues[0] ?? null,
                draw: oddsValues[2] ?? null,
                away: oddsValues[4] ?? null,
              }

              if (
                odds.home !== null &&
                odds.draw !== null &&
                odds.away !== null
              ) {
                results.push({
                  status,
                  homeTeam,
                  awayTeam,
                  homeScore,
                  awayScore,
                  odds,
                })
              }
            } catch {
              console.log('Broken row detected when scraping')
            }
          })

          return results
        })

        // small delay to avoid blocking
        await page.waitForTimeout(2000)
        await browser.close()

        allMatches.push(...matches)
        break
      } catch (error) {
        if (attempt === 3) throw error

        console.log(`Retry ${attempt}`)
        //await sleep(1000)
      }
    }
  }

  fs.writeFileSync(
    outputFilePath +
      [season, source.country, source.competition].join('_') +
      '.json',
    JSON.stringify(allMatches, null, 2),
  )

  console.log(
    `Scraped ${allMatches.length} ${source.sport} matches from season ${season} ` +
      `of ${source.competition} in ${source.country}`,
  )
}

for (let year = startYear; year <= endYear; year++) {
  scrapeSeason(year)
}
