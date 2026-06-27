# MSME Project Report Finder

A React and Node.js application that helps a project owner find relevant MSME project reports from a Food Processing knowledge base. The user fills a form with basic details and describes the type of project they want to start. The backend uses a local RAG-style semantic search pipeline to retrieve the most relevant reports and can generate a downloadable PDF recommendation.

## Project Summary

The application is designed for a workflow like this:

1. The project owner enters name, age, gender, and project description.
2. The React frontend sends the form data to the Express backend.
3. The backend converts the project description into a semantic embedding.
4. The embedding is compared with embeddings of Food Processing project reports.
5. The top matching reports are returned to the frontend.
6. The user can open the report page on mymsme.org or download a generated PDF.

Example user input:

```text
I want to start a tomato sauce and ketchup manufacturing unit with small investment.
```

Expected best match:

```text
Tomato Ketchup
```

## What is RAG?

RAG means Retrieval Augmented Generation.

In a normal AI flow, the model directly answers from its own training data. In a RAG flow, the system first searches a knowledge base, retrieves relevant documents, and then uses those documents to produce or support the final answer.

In this project:

- Knowledge base: Food Processing project reports scraped from mymsme.org
- Retrieval: Semantic vector search using local embeddings
- Generation: The app returns ranked recommendations and creates a clean PDF summary

Current flow:

```text
React Form
  -> Express API
  -> Local embedding model
  -> Vector similarity search
  -> Top 3 project reports
  -> React result cards
  -> Open report or download PDF
```

## Features

- React form for project owner details
- Required validation for name, age, gender, and project description
- Express backend API
- Local embedding model using `@xenova/transformers`
- Semantic search using cosine similarity
- Cached embeddings for faster repeat runs
- Top 3 matching project reports
- Confidence score for each match
- Direct report links to mymsme.org
- PDF generation using Puppeteer
- Python Playwright scraper for dataset collection
- Vite proxy for frontend to backend API calls

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, lucide-react |
| Backend | Node.js, Express |
| RAG / Embeddings | @xenova/transformers, Xenova/all-MiniLM-L6-v2 |
| Vector Search | Cosine similarity |
| PDF Generation | Puppeteer |
| Scraping | Python, Playwright |
| Data Storage | JSON files |

## Folder Structure

```text
msme project/
  client/
    src/
      components/
        ProjectForm.jsx
        ResultPanel.jsx
        ReportCard.jsx
      services/
        api.js
      App.jsx
      main.jsx
      styles.css
    index.html
    vite.config.js
    tailwind.config.js
    package.json

  server/
    src/
      rag/
        embeddings.js
        pdfGenerator.js
      index.js
    data/
      embeddings_cache.json
    package.json

  scraper/
    build_food_processing_dataset.py
    food_processing_reports.json
    probe_click.py
    scraper.py
    search_reports.py

  WORKFLOW.md
  package.json
  README.md
```

## Dataset

The current dataset contains 15 Food Processing reports collected from mymsme.org:

- Rusk Making
- French Fries
- Bread Making
- Biscuit Making
- Jam & Jelly
- Macroni
- Soya Paneer
- Ice Cream Manufacturing
- Ready To Eat Noodle
- Packaged Drinking Water
- Multi Fruit Juice & Squash
- Namkeen Making
- Tomato Ketchup
- Pickle Making
- Soft Drinks

The data is stored in:

```text
scraper/food_processing_reports.json
```

Each report contains:

- Category
- Title
- Description
- Report URL
- Source URL
- Detail page availability flag

Some mymsme.org `pro_id` links return blank pages when opened directly. For those records, the dataset keeps the Food Processing category page as a fallback URL.

## Prerequisites

Install these before running the project:

- Node.js
- npm
- Python 3
- Playwright for Python, only needed if you want to run the scraper again

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```powershell
npm.cmd
```

instead of:

```powershell
npm
```

## Installation

From the project root:

```powershell
npm.cmd run install:all
```

This installs dependencies for both:

- `server`
- `client`

You can also install manually:

```powershell
cd server
npm.cmd install

cd ../client
npm.cmd install
```

## Running the Project

Start the backend:

```powershell
npm.cmd run dev:server
```

Backend runs on:

```text
http://localhost:5000
```

Start the frontend:

```powershell
npm.cmd run dev:client
```

Frontend runs on:

```text
http://127.0.0.1:5173
```

You can also start both together:

```powershell
npm.cmd run dev
```

Note: The first backend run may take extra time because the embedding model is loaded and report embeddings are prepared. After that, cached embeddings are used from:

```text
server/data/embeddings_cache.json
```

## API Endpoints

### GET `/api/health`

Checks backend status and whether the RAG system is ready.

Example response:

```json
{
  "ok": true,
  "ragReady": true,
  "service": "msme-rag-server"
}
```

### POST `/api/project`

Searches the knowledge base and returns matching project reports.

Request body:

```json
{
  "name": "Anant",
  "age": 23,
  "gender": "Male",
  "description": "I want to start tomato sauce manufacturing"
}
```

Example response:

```json
{
  "owner": {
    "name": "Anant",
    "age": 23,
    "gender": "Male"
  },
  "query": "I want to start tomato sauce manufacturing",
  "bestMatch": {
    "title": "Tomato Ketchup",
    "category": "Food Processing",
    "confidence": 65,
    "url": "https://www.mymsme.org/projectreport-details/food-processing"
  },
  "reports": [],
  "workflow": [
    "Form data received",
    "Description converted to 384-dim semantic embedding",
    "Vector similarity search across Food Processing knowledge base",
    "Top 3 matching project reports retrieved"
  ]
}
```

### POST `/api/project/pdf`

Generates and downloads a PDF for the selected best matching report.

Request body:

```json
{
  "name": "Anant",
  "age": 23,
  "gender": "Male",
  "description": "I want to start tomato sauce manufacturing",
  "bestMatch": {
    "title": "Tomato Ketchup",
    "category": "Food Processing",
    "confidence": 65,
    "url": "https://www.mymsme.org/projectreport-details/food-processing"
  }
}
```

Response:

```text
application/pdf
```

The frontend downloads the file using the browser.

## Scraping Workflow

The initial `requests` and BeautifulSoup approach was blocked by mymsme.org with:

```text
406 Not Acceptable
Mod_Security
```

So the scraper uses Playwright, which opens pages like a real browser.

Run the scraper from the project root:

```powershell
python .\scraper\build_food_processing_dataset.py
```

This creates or updates:

```text
scraper/food_processing_reports.json
```

Useful scraper files:

- `scraper.py`: Opens a page and prints page text and links
- `build_food_processing_dataset.py`: Builds the Food Processing JSON dataset
- `probe_click.py`: Tests specific report link behavior
- `search_reports.py`: Python-side local search demo

## How the RAG Search Works

The backend uses:

```text
Xenova/all-MiniLM-L6-v2
```

This is a local sentence-transformer model that creates 384-dimensional embeddings.

Steps:

1. Load Food Processing reports from JSON.
2. Convert every report title and description into an embedding.
3. Save embeddings in `server/data/embeddings_cache.json`.
4. Convert the user's project description into an embedding.
5. Compare the user embedding with report embeddings using cosine similarity.
6. Return the top 3 reports with confidence scores.

This is better than keyword matching because it compares meaning, not only exact words.

## PDF Generation

The PDF route uses Puppeteer to generate a clean report summary PDF. The generated PDF includes:

- Applicant profile
- Submitted requirement
- Recommended project title
- Match confidence
- Report description
- Source URL

The PDF is generated from the selected recommendation data and not from an official downloadable PDF file on mymsme.org.

## Current Limitations

- The dataset currently covers only Food Processing reports.
- Some mymsme.org report detail URLs are blank when opened directly.
- The current RAG pipeline retrieves reports but does not yet use Gemini or OpenAI for final natural-language generation.
- Embeddings are stored in JSON cache, not in a production vector database.
- The generated PDF is a clean recommendation summary, not an official MSME PDF.

## Future Improvements

- Scrape all project report categories from mymsme.org.
- Store all reports in a single `reports.json` file.
- Add FAISS, ChromaDB, Pinecone, or another vector database.
- Add Gemini or OpenAI to generate a final explanation based on top retrieved reports.
- Add category filters.
- Add admin page for updating the knowledge base.
- Add database storage for user submissions.
- Add authentication if the project needs user accounts.
- Improve PDF content with financial assumptions, machinery details, raw materials, and market analysis.

## Suggested Final Architecture

```text
React Frontend
  -> Express Backend
  -> Embedding Model
  -> Vector Database
  -> Top Matching Reports
  -> LLM Recommendation
  -> Result Cards and PDF Download
```

## Important Notes for Submission

This project demonstrates:

- Frontend form handling in React
- Backend API development in Express
- Web scraping using Playwright
- Dataset preparation
- RAG concept implementation
- Semantic search using local embeddings
- PDF generation using Puppeteer
