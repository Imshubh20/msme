# MSME Project Report Finder — Workflow

## What It Does

User fills a form (name, age, gender, project description). The system uses **RAG (Retrieval Augmented Generation)** to semantically search Food Processing project reports from mymsme.org and return the most relevant matches. User can also download the actual report page as a PDF.

## Architecture

```
React Frontend (Vite + Tailwind)
  ↓ POST /api/project
Express Backend (Node.js)
  ↓ embed(description)
Xenova/all-MiniLM-L6-v2 (Local ML Model)
  ↓ 384-dim vector
Vector Similarity Search (Cosine)
  ↓ Top 3 reports
Response to React
  ↓ User clicks "Download PDF"
POST /api/project/pdf
  ↓
Puppeteer → mymsme.org page → PDF
  ↓
Browser downloads PDF
```

## What is RAG?

**RAG = Retrieval Augmented Generation**

Instead of the AI making up answers, it:
1. **Retrieves** relevant documents from a knowledge base
2. **Generates** answers based on those documents

In our project:
- Knowledge base = 15 Food Processing project reports from mymsme.org
- Retrieval = Semantic embedding search (not keyword matching)
- "Generation" = Returning the best matching report with confidence score

## How Semantic Search Works

**Old approach (keyword matching):**
```
"tomato sauce" → search for "tomato" and "sauce" → limited matches
```

**New approach (embeddings):**
```
"I want to preserve fruits in sugar syrup" 
  → [0.23, 0.88, 0.12, ... ] (384-dim vector)
  → Compare with all report vectors
  → "Multi Fruit Juice & Squash" (57%)
  → "Jam & Jelly" (44%)
```

The AI **understands meaning**, not just keywords.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Embeddings | @xenova/transformers (all-MiniLM-L6-v2) |
| PDF | Puppeteer (headless Chrome) |
| Scraping | Python + Playwright |
| Data | JSON (food_processing_reports.json) |

## Folder Structure

```
msme project/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── App.jsx              # Main app layout
│   │   ├── main.jsx             # Entry point
│   │   ├── styles.css           # Tailwind + custom CSS
│   │   ├── components/
│   │   │   ├── ProjectForm.jsx  # Form component
│   │   │   ├── ResultPanel.jsx  # Results display
│   │   │   └── ReportCard.jsx   # Individual report card
│   │   └── services/
│   │       └── api.js           # API calls + PDF download
│   ├── index.html
│   ├── vite.config.js           # Vite + API proxy
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                      # Express Backend
│   ├── src/
│   │   ├── index.js             # Express server + routes
│   │   └── rag/
│   │       ├── embeddings.js    # ML model + vector search
│   │       └── pdfGenerator.js  # Puppeteer PDF from mymsme.org
│   └── data/
│       └── embeddings_cache.json # Cached report embeddings
│
├── scraper/                     # Python Scraper
│   ├── scraper.py               # Playwright page scraper
│   ├── build_food_processing_dataset.py
│   ├── food_processing_reports.json  # 15 reports dataset
│   └── search_reports.py        # Python search demo
│
├── package.json                 # Root scripts
└── WORKFLOW.md                  # This file
```

## How to Run

```bash
# 1. Install dependencies
npm run install:all

# 2. Start both servers
npm run dev:server   # Backend on :5000
npm run dev:client   # Frontend on :5173

# Or start both together:
npm run dev
```

First run downloads the ML model (~23MB). Subsequent runs use cached embeddings.

## API Endpoints

### GET /api/health
Returns server status and RAG readiness.

### POST /api/project
Search for matching project reports.

**Request:**
```json
{
  "name": "Anant",
  "age": 23,
  "gender": "Male",
  "description": "I want to start tomato sauce manufacturing"
}
```

**Response:**
```json
{
  "bestMatch": { "title": "Tomato Ketchup", "confidence": 65, "url": "..." },
  "reports": [...top 3...],
  "workflow": [...]
}
```

### POST /api/project/pdf
Generates PDF of the best matching report page from mymsme.org using Puppeteer.

## Dataset

15 Food Processing reports from mymsme.org:
- Rusk Making, French Fries, Bread Making, Biscuit Making
- Jam & Jelly, Macroni, Soya Paneer, Ice Cream Manufacturing
- Ready To Eat Noodle, Packaged Drinking Water
- Multi Fruit Juice & Squash, Namkeen Making
- Tomato Ketchup, Pickle Making, Soft Drinks
