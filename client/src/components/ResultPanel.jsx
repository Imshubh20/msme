import { ExternalLink, Download, SearchCheck } from "lucide-react";
import ReportCard from "./ReportCard.jsx";

export default function ResultPanel({ result, onDownloadPDF, isDownloading }) {
  if (!result) {
    return (
      <div className="glass rounded-2xl shadow-2xl flex flex-col items-center justify-center min-h-[520px] text-center p-8 animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
          <SearchCheck size={28} className="text-emerald-400" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">
          Results will appear here
        </h2>
        <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
          Fill in your project details and click "Find Project Reports". Our
          RAG system will semantically search the Food Processing knowledge base
          and return the best matching reports.
        </p>

        {/* Workflow steps */}
        <div className="mt-8 space-y-3 w-full max-w-xs text-left">
          {[
            "Your description is converted to a semantic embedding",
            "Vector similarity search finds closest reports",
            "Top matching project reports are returned",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-emerald-400 text-[11px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-gray-500 text-xs leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { bestMatch, reports } = result;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Best Match Hero */}
      {bestMatch && (
        <div className="glass-strong rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
                  Best Match
                </p>
                <h2 className="text-white text-xl sm:text-2xl font-extrabold leading-tight">
                  {bestMatch.title}
                </h2>
              </div>
              <span className="bg-emerald-500/15 text-emerald-400 font-extrabold text-lg px-4 py-2 rounded-xl whitespace-nowrap animate-pulse-glow">
                {bestMatch.confidence}%
              </span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-5 line-clamp-4">
              {bestMatch.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                id="open-report-button"
                href={bestMatch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl py-2.5 px-5 transition-all duration-300 shadow-lg shadow-emerald-900/30"
              >
                <ExternalLink size={15} />
                Open Report
              </a>

              <button
                id="download-pdf-button"
                onClick={onDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-xl py-2.5 px-5 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                <Download size={15} />
                {isDownloading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow */}
      {result.workflow && (
        <div className="glass rounded-xl p-4">
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-3">
            RAG Workflow
          </p>
          <div className="flex flex-wrap gap-2">
            {result.workflow.map((step, i) => (
              <span
                key={i}
                className="text-[11px] text-gray-400 bg-white/5 rounded-lg px-3 py-1.5 font-medium"
              >
                {i + 1}. {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Other Reports */}
      {reports && reports.length > 0 && (
        <div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 px-1">
            All Matching Reports
          </h3>
          <div className="space-y-3">
            {reports.map((report, i) => (
              <ReportCard key={report.title} report={report} rank={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
