import { ArrowRight, Loader2 } from "lucide-react";

export default function ProjectForm({ form, onChange, onSubmit, isLoading, error }) {
  function handleChange(e) {
    onChange(e.target.name, e.target.value);
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 shadow-2xl animate-slide-up">
      {/* Header */}
      <div className="mb-7">
        <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
          MSME Project Report Finder
        </p>
        <h1 className="text-white text-2xl sm:text-3xl font-extrabold leading-tight">
          Find your ideal
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            {" "}Food Processing{" "}
          </span>
          project report
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Describe your project idea and our RAG-powered AI will find the most relevant MSME report for you.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5" id="project-form">
        {/* Name */}
        <label className="block">
          <span className="text-gray-300 text-sm font-semibold mb-1.5 block">
            Name
          </span>
          <input
            id="input-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm transition-all duration-200 hover:border-white/20"
          />
        </label>

        {/* Age + Gender row */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-300 text-sm font-semibold mb-1.5 block">Age</span>
            <input
              id="input-age"
              name="age"
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={handleChange}
              placeholder="25"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm transition-all duration-200 hover:border-white/20"
            />
          </label>

          <label className="block">
            <span className="text-gray-300 text-sm font-semibold mb-1.5 block">Gender</span>
            <select
              id="input-gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm transition-all duration-200 hover:border-white/20 appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">Select</option>
              <option value="Male" className="bg-slate-900">Male</option>
              <option value="Female" className="bg-slate-900">Female</option>
              <option value="Other" className="bg-slate-900">Other</option>
            </select>
          </label>
        </div>

        {/* Description */}
        <label className="block">
          <span className="text-gray-300 text-sm font-semibold mb-1.5 block">
            Project Description
          </span>
          <textarea
            id="input-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Example: I want to start a tomato sauce and ketchup manufacturing unit with small investment..."
            rows={6}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm transition-all duration-200 hover:border-white/20 resize-vertical"
          />
        </label>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          id="submit-button"
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl py-3.5 px-6 transition-all duration-300 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/40 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin-slow" />
          ) : (
            <ArrowRight size={18} />
          )}
          {isLoading ? "Searching Knowledge Base..." : "Find Project Reports"}
        </button>
      </form>
    </div>
  );
}
