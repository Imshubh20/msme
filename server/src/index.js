import express from "express";
import cors from "cors";
import { initEmbeddings, searchReports, isReady } from "./rag/embeddings.js";
import { generatePDFFromReport } from "./rag/pdfGenerator.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    exposedHeaders: ["Content-Disposition"],
  })
);
app.use(express.json({ limit: "1mb" }));

// ──────────────────────────────────────────
// Health check
// ──────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ragReady: isReady(), service: "msme-rag-server" });
});

// ──────────────────────────────────────────
// Project report search (RAG)
// ──────────────────────────────────────────
app.post("/api/project", async (req, res) => {
  try {
    const { name, age, gender, description } = req.body || {};

    if (!name?.trim() || !age || !gender?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Name, age, gender, and project description are required.",
      });
    }

    if (!isReady()) {
      return res.status(503).json({
        message: "RAG system is still initializing. Please wait a moment and try again.",
      });
    }

    const reports = await searchReports(description, 3);
    const bestMatch = reports[0] || null;

    res.json({
      owner: {
        name: name.trim(),
        age,
        gender: gender.trim(),
      },
      query: description.trim(),
      bestMatch,
      reports,
      workflow: [
        "Form data received",
        "Description converted to 384-dim semantic embedding",
        "Vector similarity search across Food Processing knowledge base",
        `Top ${reports.length} matching project reports retrieved`,
      ],
    });
  } catch (err) {
    console.error("[API] /api/project error:", err);
    res.status(500).json({ message: err.message || "Internal server error." });
  }
});

// ──────────────────────────────────────────
// PDF download route
// ──────────────────────────────────────────
app.post("/api/project/pdf", async (req, res) => {
  try {
    const { name, age, gender, description, bestMatch } = req.body || {};

    if (!description?.trim()) {
      return res.status(400).json({ message: "Description is required for PDF." });
    }

    let matchToUse = bestMatch;
    if (!matchToUse || !matchToUse.title) {
      if (!isReady()) {
        return res.status(503).json({ message: "RAG system still initializing." });
      }
      const reports = await searchReports(description, 1);
      matchToUse = reports[0] || null;
    }

    if (!matchToUse) {
      return res.status(404).json({ message: "No matching report found." });
    }

    const pdfBuffer = await generatePDFFromReport({
      owner: { name: name?.trim(), age, gender: gender?.trim() },
      query: description.trim(),
      bestMatch: matchToUse,
    });

    const safeTitle = matchToUse.title.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `MSME_Report_${safeTitle}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (err) {
    console.error("[API] /api/project/pdf error:", err);
    res.status(500).json({ message: err.message || "PDF generation failed." });
  }
});

// ──────────────────────────────────────────
// Start server, then init RAG in background
// ──────────────────────────────────────────
app.listen(port, () => {
  console.log(`\nMSME RAG server running on http://localhost:${port}\n`);

  initEmbeddings().catch((err) => {
    console.error("[RAG] Initialization failed:", err);
  });
});
