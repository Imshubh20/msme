import puppeteer from "puppeteer";

/**
 * Generate a clean, professional MSME Project Report PDF.
 *
 * @param {object} options
 * @param {object} options.owner       – { name, age, gender }
 * @param {string} options.query       – User's original project description
 * @param {object} options.bestMatch   – Best matching report object { title, description, category, url, confidence }
 * @returns {Promise<Buffer>}          – PDF file as Buffer
 */
export async function generatePDFFromReport({ owner, query, bestMatch }) {
  let browser;

  const title = bestMatch?.title || "Project Report";
  const category = bestMatch?.category || "Food Processing";
  const description = bestMatch?.description || "Detailed project report analysis.";
  const confidence = bestMatch?.confidence || 90;
  const sourceUrl = bestMatch?.url || "https://www.mymsme.org";
  const dateStr = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #1e293b;
          background: #ffffff;
          padding: 40px 45px;
          line-height: 1.6;
        }

        /* Top Header */
        .header {
          border-bottom: 3px solid #0d9488;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-left .logo {
          font-size: 24px;
          font-weight: 800;
          color: #0f766e;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-left .logo-badge {
          background: #0f766e;
          color: #ffffff;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .header-left .subtitle {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 6px;
        }

        .header-right {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }

        .header-right .doc-id {
          font-weight: 700;
          color: #334155;
        }

        /* Banner Card */
        .banner {
          background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
          color: #ffffff;
          border-radius: 12px;
          padding: 24px 28px;
          margin-bottom: 30px;
          position: relative;
        }

        .banner .category-tag {
          background: rgba(255, 255, 255, 0.2);
          color: #ccfbf1;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 10px;
        }

        .banner h1 {
          font-size: 24px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .banner .match-score {
          position: absolute;
          top: 24px;
          right: 28px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 8px 14px;
          border-radius: 10px;
          text-align: center;
        }

        .banner .match-score .num {
          font-size: 18px;
          font-weight: 800;
          color: #5eead4;
        }

        .banner .match-score .lbl {
          font-size: 9px;
          text-transform: uppercase;
          color: #e2e8f0;
          font-weight: 600;
        }

        /* Grid Sections */
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f766e;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1.5px solid #e2e8f0;
        }

        /* Applicant info grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 30px;
        }

        .info-item .label {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .info-item .value {
          font-size: 14px;
          color: #1e293b;
          font-weight: 700;
        }

        /* User requirement box */
        .req-box {
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 14px 18px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 30px;
          font-size: 13px;
          color: #166534;
        }

        /* Report details */
        .report-body {
          font-size: 13.5px;
          color: #334155;
          line-height: 1.7;
          margin-bottom: 30px;
          text-align: justify;
        }

        .report-body p {
          margin-bottom: 14px;
        }

        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #94a3b8;
        }

        .footer a {
          color: #0d9488;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>

      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <div class="logo">
            <span class="logo-badge">M</span>
            MSME Project Report
          </div>
          <div class="subtitle">Ministry of Micro, Small & Medium Enterprises Knowledge Base</div>
        </div>
        <div class="header-right">
          <div class="doc-id">DOC-ID: MSME-${Math.floor(100000 + Math.random() * 900000)}</div>
          <div>Date: ${dateStr}</div>
        </div>
      </div>

      <!-- Applicant Details -->
      <div class="section-title">Applicant Profile</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="label">Owner Name</div>
          <div class="value">${owner?.name || "N/A"}</div>
        </div>
        <div class="info-item">
          <div class="label">Age</div>
          <div class="value">${owner?.age || "N/A"} Years</div>
        </div>
        <div class="info-item">
          <div class="label">Gender</div>
          <div class="value">${owner?.gender || "N/A"}</div>
        </div>
      </div>

      <!-- User Query -->
      <div class="section-title">Submitted Requirement</div>
      <div class="req-box">
        "${query || "Project requirement details."}"
      </div>

      <!-- Project Report Banner -->
      <div class="section-title">Recommended Project Profile</div>
      <div class="banner">
        <span class="category-tag">${category}</span>
        <h1>${title}</h1>
        <div class="match-score">
          <div class="num">${confidence}%</div>
          <div class="lbl">RAG Match</div>
        </div>
      </div>

      <!-- Report Content -->
      <div class="report-body">
        <p>${description.replace(/\n\n/g, "</p><p>")}</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div>Generated via RAG AI Platform • Official Data Source: <a href="${sourceUrl}">${sourceUrl}</a></div>
        <div>Page 1 of 1</div>
      </div>

    </body>
    </html>
  `;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
    });

    console.log(`[PDF] Clean PDF generated for: ${title} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
    return Buffer.from(pdfBuffer);
  } catch (err) {
    console.error(`[PDF] Error generating clean PDF:`, err.message);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
