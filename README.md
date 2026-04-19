# LeasingDesk — Scape SEA Leasing Team

Internal dashboard for the Scape offshore leasing team. Pulls together Outlook emails, StarRez leasing data, SharePoint documents, and AI briefings into one place.

**Team:** Nicole Sim (SEA), Minxuan Kong (Singapore), Ngoc Hoang (Vietnam)

---

## Quick Start (Local Development)

### Prerequisites

- [Node.js 18+](https://nodejs.org) — download and install
- An [Anthropic API key](https://console.anthropic.com) — sign in and create one under API Keys

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-ORG/leasingdesk.git
cd leasingdesk

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Open .env.local and paste in your ANTHROPIC_API_KEY

# 4. Run locally
npm run dev
# → Open http://localhost:5173
```

---

## Deploy to Netlify (One-time setup, free forever)

This takes about 10 minutes the first time.

### 1. Push to GitHub

Create a new repository at [github.com/new](https://github.com/new), then:

```bash
git init
git add .
git commit -m "Initial LeasingDesk deploy"
git branch -M main
git remote add origin https://github.com/YOUR-ORG/leasingdesk.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign in with GitHub or Google
2. Click **Add new site → Import an existing project**
3. Select **GitHub** and choose the `leasingdesk` repository
4. Netlify auto-detects `netlify.toml` — no build settings to change
5. Before clicking Deploy, open **Environment Variables** and add:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` (your key from console.anthropic.com) |
| `GOOGLE_SHEETS_ID` | `1yIvo1NWAnnoWuvEBNmnvOVIYyC0-AYlXDYazCnyRExc` |
| `GOOGLE_API_KEY` | `AIzaSyBdn6I5z8oNhWNEyuIemDO81bJVGrhnOPo` |

6. Click **Deploy**

Your dashboard is now live at `https://leasingdesk-xxx.netlify.app`

### 3. Future updates

Every time you push to the `main` branch on GitHub, Netlify automatically redeploys.

```bash
# Make changes to files, then:
git add .
git commit -m "Update Nicole's partner data"
git push
# → Netlify deploys automatically in ~2 minutes
```

---

## Adding a New Team Member

Open `src/data/index.js` and:

1. **Copy the template block** at the bottom of `AM_CONFIG` and fill in:
   - `name`, `region`, `initials`, `color`
   - StarRez totals once access is confirmed
   - `topPartners` with real agency codes
   - `topProperties`

2. **Add their bookings** to `BOOKINGS[newKey]` — or leave as `[]` until StarRez data is available

3. **Add pipeline students** to `PIPELINE_DATA[newKey]`

4. **Add reminders** to `REMINDERS_INIT[newKey]`

5. Push to GitHub — they appear in the AM switcher automatically

---

## Updating Leasing Data

Until the StarRez API is connected, update data manually after each export:

1. Open `src/data/index.js`
2. Find `AM_CONFIG` → the relevant AM key
3. Update: `totalBookings`, `contractValue`, `inRoom`, `held`, `tentative`, `history`
4. Optionally add new rows to `BOOKINGS[amKey]` for the detail table
5. Push to GitHub → deploys automatically

### When StarRez API is available

Replace the static arrays in `BOOKINGS` with a fetch call to the StarRez API endpoint. The data shape stays the same — each record needs: `id`, `student`, `partner`, `property`, `status`, `checkin`, `room`, `contract`.

---

## Google Sheets Live Data Backend (Recommended)

Once this is set up, **anyone on the team can update leasing numbers, bookings, pipeline students, and reminders directly in a Google Sheet** — co code, no GitHub, no developer needed. Changes appear on the next page load.

### What you need
- A Google account (personal or bork Gmail)
- About 20 minutes the first time

---

### Step 1 — Create the Google Sheet

1. Go to [sheets.new](https://sheets.new) to create a new spreadsheet
2. Rename it `LeasingDesk Data`
3. Create the following **six tabs** (click the `+` at the bottom to add sheets):

   | Tab name | What it holds |
   |----------|---------------|
   | `AM_Totals` | One row per team member — leasing summary totals |
   | `Partners` | One row per partner per team member |
   | `Properties` | One row per property per team member |
   | `Bookings` | One row per individual lease record |
   | `Pipeline` | One row per student in the onboarding kanban |
   | `Reminders` | One row per reminder per team member |

4. Copy the **exact column headers** below into row 1 of each tab:

**AM_Totals** (row 1):
```
amKey | name | region | initials | color | totalBookings | contractValue | inRoom | held | tentative | history | note
```

**Partners** (row 1):
```
amKey | name | code | count | type
```

**Properties** (row 1):
```
amKey | name | count
```

**Bookings** (row 1):
```
amKey | id | student | partner | property | status | checkin | room | contract
```
> `status` values: `inroom` · `held` · `tentative` · `history`

**Pipeline** (row 1):
```
amKey | id | name | flag | partner | property | checkin | stage
```
> `stage` values: `enquiry` · `docs` · `allocated` · `prearrival` · `checkedin`
> `flag` is the emoji flag of the student's country, e.g. `🇲🇾`

**Reminders** (row 1):
```
amKey | id | title | partner | due | recurrence | priority | done
```
> `due` format: `YYYY-MM-DD` (e.g. `2026-04-25`)
> `recurrence` values: `One-off` · `Weekly` · `Monthly` · `Quarterly` · `Semester` · `Annual`
> `priority` values: `high` · `medium` · `low`
> `done` values: `TRUE` or `FALSE`

5. Populate with your data (copy from the existing `src/data/index.js` values to start)

6. **Share the sheet:** Click Share → Change to `Anyone with the link` → set to `Viewer` → Done

7. **Copy the Sheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`**`/edit`

---

### Step 2 — Create a Google API Key

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select an existing one) — name it `LeasingDesk`
3. In the sidebar: **APIs & Services → Library** → search for `Google Sheets API` → Enable
4. In the sidebar: **APIs & Services → Credentials** → `+ Create Credentials` → `API key`
5. Copy the key, then click `Edit API key` and under `API restrictions` select `Google Sheets API` only
6. Click Save

---

### Step 3 — Add to Vercel

In your Vercel project: **Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `GOOGLE_SHEETS_ID` | the long ID from your spreadsheet URL |
| `GOOGLE_API_KEY` | `AIza...` (your key from Google Cloud Console) |

Click **Save**, then **Redeploy** (or push any commit to trigger auto-deploy).

---

### How it works day-to-day

- Open the Google Sheet, edit any cell, save
- Refresh the LeasingDesk dashboard — data updates automatically
- The dashboard caches sheet data for 5 minutes, so changes appear within 5 minutes of editing
- If the sheet is unavailable (network issue, etc.) the dashboard falls back to the built-in static data silently
- A dot in the bottom-left of the sidebar shows: 🟡 loading · 🟢 live · ⚫ static

---

### Adding a new team member via Sheets

1. Add a row in `AM_Totals` with their `amKey` (e.g. `khaled`), name, region, etc.
2. Add their partners to `Partners` with the same `amKey`
3. Add their properties to `Properties`
4. They appear in the AM switcher automatically on next page load

No code changes needed.

---

## Connecting Outlook (Live Emails)

The dashboard is pre-configured to use the Microsoft 365 MCP connector. To activate:

1. In Cowork settings → Plugins → confirm the Microsoft 365 connector is installed
2. Authenticate once with your Scape Microsoft account
3. Emails will refresh live on each page load

Without this, the inbox falls back to demo data.

---

## Project Structure

```
leasingdesk/
├── api/
│   └── claude.js          # Vercel serverless function — Anthropic API proxy
│                          # API key lives here (server-side), never in the browser
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── client.js      # All API calls (emails, AI briefing, weekly summary)
│   ├── data/
│   │   └── index.js       # ← MAIN FILE TO EDIT: AM config, bookings, pipeline, reminders
│   ├── styles/
│   │   └── global.css     # All styles
│   ├── App.jsx            # All UI components and page routing
│   └── main.jsx           # React entry point
├── .env.example           # Copy to .env.local, add your API key
├── .gitignore
├── index.html
├── package.json
├── vercel.json
└── README.md
```

**The one file most commonly edited:** `src/data/index.js` — leasing numbers, partner lists, bookings, pipeline, reminders. No code knowledge needed to update numbers.

---

## Environment Variables

| Variable | Where | Required | Description |
|----------|-------|----------|-------------|
| `ANTHROPIC_API_KEY` | Vercel + `.env.local` | Yes | Powers AI briefing, email fetch, weekly summary |
| `VITE_DEMO_MODE` | `.env.local` only | No | Set to `true` to skip API calls during development |

---

## Troubleshooting

**AI briefing shows demo text**
→ Check `ANTHROPIC_API_KEY` is set correctly in Vercel environment variables and redeploy.

**Emails show demo data**
→ Microsoft 365 MCP connector needs authentication. See "Connecting Outlook" above.

**Leasing numbers are out of date**
→ Update manually in `src/data/index.js` from the latest StarRez export and push.

**Vercel build fails**
→ Run `npm run build` locally first to see the error. Usually a syntax issue in one of the edited files.

---

## Questions

Contact Nicole Sim · nicole.sim@scape.com.au
