export default function ReportCard({ report, rank }) {
  const barWidth = Math.max(10, report.confidence);

  return (
    <article
      className="glass rounded-xl p-5 transition-all duration-300 hover:bg-white/[0.08] hover:scale-[1.01] group animate-slide-up"
      style={{ animationDelay: `${rank * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold shrink-0">
            {rank}
          </span>
          <h3 className="text-white font-bold text-sm leading-snug">
            {report.title}
          </h3>
        </div>
        <span className="text-emerald-400 font-extrabold text-sm whitespace-nowrap">
          {report.confidence}%
        </span>
      </div>

      {/* Confidence bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Description */}
      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4">
        {report.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">
          {report.category || "Food Processing"}
        </span>
        <a
          href={report.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 text-xs font-bold hover:text-emerald-300 transition-colors"
        >
          View on mymsme.org →
        </a>
      </div>
    </article>
  );
}
