# BuildSubmarines Media Planner PRD

## Objective
Build a web app that helps BuildSubmarines users create monthly media plans across selected job portfolios. The app should let users choose job functions, specialties, hotspots, budget, duration, and delivery strategy, then return a recommended allocation, estimated CPAS, apply starts, top publishers, and strategic insights.

## Users
- Primary: BuildSubmarines internal marketing / recruitment planning users
- Secondary: Joveo internal strategy and customer-facing teams

## Core Inputs
- Job Functions (multi-select)
- Specialties (multi-select, auto-filtered by job functions)
- Hotspots / states (multi-select)
- Budget mode: user-entered budget or recommended budget
- Budget amount: $10,000 to $1,000,000
- Duration: 15, 30, 60, 90 days
- Delivery strategy: Balanced or Spend Fast
- Optional category budget caps

## Core Outputs
### Executive Summary
- Total budget
- Estimated apply starts
- Average CPAS
- Delivery strategy
- Top opportunity area
- Risk flag

### Media Plan Table
- Campaign / Job Function
- Location / Hotspot
- Spend
- CPAS
- Apply Starts
- Expandable specialty rows

### Insights
- Cost Drivers
- Top Publishers (mention only, not publisher-level allocation table)
- Location Expansion Opportunities
- Supply vs Demand
- Job Content Recommendations

## Data Sources
- Media planning SQLite DB
- Insight engine SQLite DB
- Rules and planning curves from uploaded BuildSubmarines job scrapes
- Sample PDF benchmark inputs and publisher mix assumptions

## MVP Architecture
- Frontend: Next.js App Router
- Styling: Tailwind CSS
- Server logic: Next.js route handlers / server actions
- Data access: SQLite via better-sqlite3 or sqlite3 in server-only modules
- Hosting: Vercel

## Main Pages
1. Planner page
2. Results page or same-page results layout
3. Optional chatbot panel later

## Non-Goals for MVP
- Authentication
- Full publisher-level campaign management
- Measured campaign reporting
- CSV export
- Admin console

## Success Criteria
- A colleague can open a shared URL and generate a believable media plan
- The plan looks executive-ready
- The calculations are grounded in the provided planning DBs
- The app is easy to extend later with a chatbot and measured performance overlays
