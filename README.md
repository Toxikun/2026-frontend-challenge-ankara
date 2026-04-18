# Jotform Frontend Challenge Project

## User Information
- **Name**: Ahmet Orkun Yılmaz

## Project Description

> **Scenario:** Podo attended a social event where all activities were being logged through various Jotform forms. At some point during the evening, Podo went missing. The last confirmed sighting was at **21:11** near **Ankara Kalesi**. Using the collected check-in records, messages, eyewitness sightings, personal notes, and anonymous tips, investigators must piece together what happened — who was Podo last seen with, and who is the most suspicious?

An investigation-themed surveillance dashboard built for tracking the disappearance of "Podo" during an event. The application consumes data from **5 Jotform API endpoints** (Check-ins, Messages, Sightings, Personal Notes, Anonymous Tips), processes and unifies them into a single chronological log, and presents them through an interactive investigation interface.

### Key Features

- **Investigation Log** — Unified event table with real-time data from all 5 Jotform forms, sortable by any column (timestamp asc/desc, type, location, etc.), and filterable by record type, time range, and global text search (person, location, content keywords). Includes a "Last Known Locations" summary panel.
- **Timeline Analysis** — A vertical chronological timeline reconstructing Podo's journey with a visual **disappearance marker** at the point of vanishing (21:11). Post-disappearance events are highlighted in red.
- **Scoring Center** — Algorithmic suspect ranking system with multi-factor heuristic analysis:
  - **Time Proximity**: +5 (≤1 min), +4 (≤5 min), +2 (≤15 min), +1 (≤30 min) before disappearance
  - **Location Proximity**: +3 for being at the last known location within 10 minutes
  - **Post-Disappearance Tips**: +5 for being mentioned in anonymous tips after the event
  - **Frequency Bonus**: +2 for appearing 3+ times in the critical window
  - **Guilt by Association**: Suspects seen together share a fraction of each other's scores (70% post-disappearance, 50% within 10 min, 10% within 30 min)
  - **Manual Detective Adjustment**: Investigators can manually increase/decrease scores, persisted in localStorage
  - **Risk Classification**: CRITICAL (≥10), HIGH (≥7), MEDIUM (≥4), LOW (<4)
- **Name Normalization** — Handles Turkish character variants and abbreviated names (e.g., "Kağan A.", "Kagan", "Kağan" → unified identity)
- **Raw Data Viewer** — Modal to inspect the original Jotform JSON payload for any event

### Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI component library |
| **Vite** | 8.x | Build tool & dev server |
| **React Router** | 7.x | Client-side routing |
| **Axios** | 1.x | HTTP client for Jotform API |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **PostCSS** | 8.x | CSS processing pipeline |

## Getting Started
### Prerequisites

- **Node.js** — v18 or higher ([download](https://nodejs.org/))
- **npm** — comes bundled with Node.js (v9+)
- **Git** — for cloning the repository

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/2026-frontend-challenge-ankara.git
cd 2026-frontend-challenge-ankara

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server with hot reload |
| `npm run build` | Creates a production build in `/dist` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint for code quality checks |

### Project Structure

```
src/
├── hooks/
│   └── useSurveillanceData.js   # Centralized data fetching & normalization hook
├── components/
│   ├── EventTable.jsx           # Main investigation log table
│   ├── EventFilter.jsx          # Search, type, and time range filters
│   ├── RawDataModal.jsx         # Raw JSON viewer modal
│   └── Sidebar.jsx              # Navigation sidebar
├── pages/
│   ├── InvestigationPage.jsx    # Investigation log + last known locations
│   ├── TimelinePage.jsx         # Chronological timeline with disappearance marker
│   └── ScoringPage.jsx          # Suspect scoring & risk classification
├── App.jsx                      # Root component with routing
├── main.jsx                     # Application entry point
└── index.css                    # Global styles
```

### API Configuration

The application uses the Jotform API to fetch form submissions. API keys and form IDs are configured in `src/hooks/useSurveillanceData.js`. No additional backend or environment variables are required — the app communicates directly with the Jotform API.

# 🚀 Challenge Duyurusu

## 📅 Tarih ve Saat
Cumartesi günü başlama saatinden itibaren üç saattir.

## 🎯 Challenge Konsepti
Bu challenge'da, size özel hazırlanmış bir senaryo üzerine web uygulaması geliştirmeniz istenecektir. Challenge başlangıcında senaryo detayları paylaşılacaktır.Katılımcılar, verilen GitHub reposunu fork ederek kendi geliştirme ortamlarını oluşturacaklardır.

## 📦 GitHub Reposu
Challenge için kullanılacak repo: https://github.com/cemjotform/2026-frontend-challenge-ankara

## 🛠️ Hazırlık Süreci
1. GitHub reposunu fork edin
2. Tercih ettiğiniz framework ile geliştirme ortamınızı hazırlayın
3. Hazırladığınız setup'ı fork ettiğiniz repoya gönderin

## 💡 Önemli Notlar
- Katılımcılar kendi tercih ettikleri framework'leri kullanabilirler
