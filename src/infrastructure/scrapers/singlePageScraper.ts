import { chromium } from 'playwright'
import fs from 'fs'

type Match = {
  status: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  odds: {
    home: number | null
    draw: number | null
    away: number | null
  }
}

async function scrape() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(
    'https://www.oddsportal.com/football/england/premier-league-2023-2024/results/',
    { waitUntil: 'networkidle' },
  )

  // cookie popup (optional)
  try {
    await page.getByRole('button', { name: /accept/i }).click({ timeout: 3000 })
  } catch {}

  await page.waitForSelector('[data-testid="game-row"]')

  const matches: Match[] = await page.evaluate(() => {
    const rows = document.querySelectorAll('[data-testid="game-row"]')

    const results: Match[] = []

    rows.forEach((row) => {
      try {
        // status
        const status =
          row.querySelector('[data-testid="time-item"]')?.textContent?.trim() ||
          ''

        // teams
        const teamElements = row.querySelectorAll(
          '[data-testid="event-participants"] a[title]',
        )

        const homeTeam = teamElements[0]?.getAttribute('title')?.trim() || ''

        const awayTeam = teamElements[1]?.getAttribute('title')?.trim() || ''

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

        if (odds.home !== null && odds.draw !== null && odds.away !== null) {
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

  await browser.close()

  fs.writeFileSync('matches.json', JSON.stringify(matches, null, 2))

  console.log(`Scraped ${matches.length} matches`)
}

scrape()
