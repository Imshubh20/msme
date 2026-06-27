const API_BASE = "";

export async function findProjectReport(payload) {
  const response = await fetch(`${API_BASE}/api/project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to find project reports.");
  }

  return data;
}

export async function downloadPDF(payload) {
  const response = await fetch(`${API_BASE}/api/project/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let msg = "PDF generation failed.";
    try {
      const err = await response.json();
      msg = err.message || msg;
    } catch {
      // not JSON
    }
    throw new Error(msg);
  }

  // Get binary array buffer and wrap in explicit PDF Blob
  const arrayBuffer = await response.arrayBuffer();
  const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });

  // Extract filename from Content-Disposition header or generate clean fallback
  const disposition = response.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/);
  
  let filename = match?.[1];
  if (!filename || !filename.endsWith(".pdf")) {
    const reportTitle = payload.bestMatch?.title || payload.title || "Project";
    const safeTitle = reportTitle.replace(/[^a-zA-Z0-9]/g, "_");
    filename = `MSME_Report_${safeTitle}.pdf`;
  }

  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 2000);
}
