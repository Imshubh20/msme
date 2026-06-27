import { pipeline } from "@xenova/transformers";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_PATH = path.resolve(__dirname, "../../data/embeddings_cache.json");
const DATA_PATH = path.resolve(__dirname, "../../../scraper/food_processing_reports.json");

let extractor = null;
let reports = [];
let reportEmbeddings = [];
let ready = false;

/**
 * Initialize the embedding model and pre-compute report embeddings.
 * Uses Xenova/all-MiniLM-L6-v2 — a 384-dim sentence transformer that runs
 * 100% locally via ONNX runtime. No API key needed.
 */
export async function initEmbeddings() {
  console.log("[RAG] Loading embedding model (first run downloads ~23 MB)...");
  extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  console.log("[RAG] Model loaded.");

  reports = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

  // Check disk cache
  if (fs.existsSync(CACHE_PATH)) {
    try {
      const cached = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
      if (cached.length === reports.length) {
        reportEmbeddings = cached.map((c) => ({
          index: c.index,
          embedding: new Float32Array(c.embedding),
        }));
        console.log(`[RAG] Loaded ${reportEmbeddings.length} cached embeddings.`);
        ready = true;
        return;
      }
    } catch {
      // cache corrupt, recompute
    }
  }

  // Compute embeddings for each report
  console.log(`[RAG] Computing embeddings for ${reports.length} reports...`);
  reportEmbeddings = [];

  for (let i = 0; i < reports.length; i++) {
    const text = `${reports[i].title}. ${reports[i].description}`;
    const embedding = await embed(text);
    reportEmbeddings.push({ index: i, embedding });
    console.log(`  [${i + 1}/${reports.length}] ${reports[i].title}`);
  }

  // Save cache
  const dir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(
    CACHE_PATH,
    JSON.stringify(
      reportEmbeddings.map((r) => ({
        index: r.index,
        embedding: Array.from(r.embedding),
      }))
    )
  );

  console.log("[RAG] Embeddings computed and cached to disk.");
  ready = true;
}

/**
 * Embed a single text string into a 384-dim vector.
 */
export async function embed(text) {
  if (!extractor) {
    throw new Error("Embedding model not initialized. Call initEmbeddings() first.");
  }
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return output.data; // Float32Array
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Search reports by semantic similarity. Returns top-K results.
 */
export async function searchReports(query, limit = 3) {
  if (!ready) {
    throw new Error("RAG system not ready yet. Still initializing...");
  }

  const queryEmbedding = await embed(query);

  const scored = reportEmbeddings.map((item) => {
    const score = cosineSimilarity(queryEmbedding, item.embedding);
    const report = reports[item.index];
    return {
      title: report.title,
      description: report.description,
      url: report.url,
      category: report.category,
      score,
      confidence: Math.min(99, Math.round(score * 100)),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function isReady() {
  return ready;
}

export function getReports() {
  return reports;
}
