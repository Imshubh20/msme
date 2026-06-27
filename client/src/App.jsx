import { useState } from "react";
import ProjectForm from "./components/ProjectForm.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import { findProjectReport, downloadPDF } from "./services/api.js";

const initialForm = {
  name: "",
  age: "",
  gender: "",
  description: "",
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const data = await findProjectReport(form);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownloadPDF() {
    setIsDownloading(true);
    try {
      await downloadPDF({ ...form, bestMatch: result?.bestMatch });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="app-bg">
      <main className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        {/* Top bar */}
        <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="text-white/80 font-bold text-sm hidden sm:block tracking-wide">
              MSME Report Finder
            </span>
          </div>
          <a
            href="https://www.mymsme.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 text-xs font-medium hover:text-emerald-400 transition-colors"
          >
            mymsme.org ↗
          </a>
        </header>

        {/* Main grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
          <ProjectForm
            form={form}
            onChange={updateField}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />

          <ResultPanel
            result={result}
            onDownloadPDF={handleDownloadPDF}
            isDownloading={isDownloading}
          />
        </div>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto mt-12 text-center">
          <p className="text-gray-600 text-xs">
            Powered by RAG (Retrieval Augmented Generation) • Data from{" "}
            <a
              href="https://www.mymsme.org"
              className="text-emerald-500/60 hover:text-emerald-400 transition-colors"
            >
              mymsme.org
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
