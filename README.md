# FootBetter

# Football Match Prediction Model

This project builds a statistical pipeline for estimating football team strength and match outcome probabilities using historical match data. It avoids direct goal modeling and instead focuses on **expected points (xP)** and **rating-based strength inference**.

---

## 🧠 Overview

The system is built in three main layers (4th in progress):

### 0. Scraper Layer (Data Ingestion)

Collects raw football match data from external sources and standardizes it into a consistent schema.

- Main source is https://www.oddsportal.com
- Scraping was chosen over limited/paid API alternatives
- Domain provides wide range of sports and leagues

### 1. Expected Points Solver (Team Strength Estimation)

We compute latent team strengths by solving a linear system derived from match outcomes.

Instead of modeling goals, matches are transformed into a matrix system where each team’s contribution is inferred from results across the season.

This produces:

- A global **expected points value per team**
- A relative strength ranking across the league

Model remarks

- The model was developed by Karol Hrubjak in the past
- The original core logic was not implemented outside of author's work
- Model provides further freedom with right-hand side manipulation
- Any model development was not included within the scope of this demonstration

This layer can be extended to:

- Elo-style rating systems
- Home advantage calibration
- Time-decayed form weighting

---

### 2. Probability Model (Score-Free Approach)

Match outcomes are predicted without simulating goals.

Instead, probabilities are derived directly from the strength difference:

- `d = strength(home) - strength(away)`

The model outputs:

- Home win probability
- Draw probability
- Away win probability

Key properties:

- Draw probability decreases as matches become more uneven
- Outcome tilt follows a logistic curve

### 3. Oppportunity Tracker (yet to be added)

Differences between bookmaker odds and modelled odds are betted against:

- Using Kelly criterion for up to 2 odds for each match
- Ommiting first 7 rounds for stability of the system and last 2 rounds for end-of-season low stake matches

---

## 📊 Expected Points Calculation

The expected points system is implemented using a linear algebra approach:

- Each match contributes to a system of equations
- A matrix representation is constructed from all fixtures
- The last row of matrix is replaced by sum of reatings for regularity purposes
- The system is solved using `ml-matrix`

This yields a vector of expected points per match

- Note that points are shifted by -1.5 from typical 3/1/0 usage

---

## ⚙️ Core Components

### `ratingCalculator.ts`

- Builds match matrix
- Applies draw penalties and match outcomes
- Solves linear system using matrix inversion
- Outputs expected points per team
- Converts team strength into comparable ratings
- Provides rating differences for matchups

### `opportunitySelector.ts`

- Finding reasonable betting opportunities
- Betting sizes

### `probabiliyPredictor.ts`

- Main pipeline entry point
- Combines:
  - ratings
  - strength differences
  - probability model
- Returns full match prediction

### `main.ts`

- Managing other components with parameter setup options
- evaluating profits of strategies

### `oddsportalScraper.ts`

- Data Ingestion

---

## 🔁 Full Pipeline Flow

```

Match Data
↓
Expected Points Solver
↓
Rating/xP Difference
↓
Probability Model
↓
P(Home / Draw / Away)
↓
Opportunity Selector
↓
Bet Backtester
```
