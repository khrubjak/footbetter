import { chromium } from "playwright";

type MatchRow = {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  odds1: number | null;
  oddsX: number | null;
  odds2: number | null;
};

const BASE =
  "https://www.oddsportal.com/football/england/premier-league-2024-2025/results/";

const PAGES = 7;

async function scrapeSeason() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allMatches: MatchRow[] = [];

  for (let i = 1; i <= PAGES; i++) {
    const url = i === 1 ? BASE : `${BASE}#/page/${i}/`; //#/page/7/

    console.log(`Scraping page ${i}: ${url}`);

    //await page.goto(url, { waitUntil: "networkidle" });

    //await page.waitForSelector("min-h-[80vh]");
  
    await page.goto(url, {
      waitUntil: "domcontentloaded"
    });

    await page.waitForLoadState("networkidle");

    await page.waitForFunction(() => {
      return document.querySelectorAll("a[href*='/football/']").length > 50;
    });

    const pageData = await page.$$eval("table tbody tr", rows => {
      const results: MatchRow[] = [];

      for (const row of rows) {
        const cols = row.querySelectorAll("td");
        if (cols.length < 5) continue;

        const date = cols[0]?.textContent?.trim() || "";
        const match = cols[1]?.textContent?.trim() || "";
        const score = cols[2]?.textContent?.trim() || "";

        // odds columns (typical layout)
        const odds1 = parseFloat(cols[3]?.textContent || "");
        const oddsX = parseFloat(cols[4]?.textContent || "");
        const odds2 = parseFloat(cols[5]?.textContent || "");

        const [homeTeam, awayTeam] = match.split(" - ");

        const [homeGoals, awayGoals] = score.includes(":")
          ? score.split(":").map(n => parseInt(n, 10))
          : [NaN, NaN];

        results.push({
          date,
          homeTeam: typeof homeTeam === "undefined" ? "" : homeTeam.trim(),
          awayTeam: typeof awayTeam === "undefined" ? "" : awayTeam.trim(),
          homeGoals: typeof homeGoals === "undefined" ? -1 : homeGoals,
          awayGoals: typeof awayGoals === "undefined" ? -1 : awayGoals,
          odds1: isNaN(odds1) ? null : odds1,
          oddsX: isNaN(oddsX) ? null : oddsX,
          odds2: isNaN(odds2) ? null : odds2,
        });
      }

      return results;
    });

    allMatches.push(...pageData);

    // small delay to avoid blocking
    await page.waitForTimeout(2000);
  }

  await browser.close();

  console.log(`Total matches scraped: ${allMatches.length}`);
  console.log(JSON.stringify(allMatches, null, 2));

  return allMatches;
}

scrapeSeason();