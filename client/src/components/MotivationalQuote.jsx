import { useState, useEffect } from "react";
import { generateQuoteAPI } from "../services/api";

export default function MotivationalQuote() {
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch quote from API
  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const data = await generateQuoteAPI();
      
      if (data.quote) {
        setQuote({
          text: data.quote,
          author: data.author || "AI Fitness Coach",
        });
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      setQuote({
        text: "Failed to load quote. Please try again.",
        author: "Error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch a new quote on component mount
    fetchQuote();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/60 p-6 backdrop-blur">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-40 h-20 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Daily Motivation
            </span>
          </div>
          <button
            onClick={fetchQuote}
            disabled={isLoading}
            className="text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Get new quote"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <blockquote className="text-slate-200 text-base md:text-lg leading-relaxed">
            <span className="text-blue-400 text-2xl leading-none">"</span>
            {isLoading ? (
              <span className="italic text-slate-400">Loading quote...</span>
            ) : quote ? (
              quote.text
            ) : (
              <span className="italic text-slate-400">No quote available</span>
            )}
            <span className="text-blue-400 text-2xl leading-none">"</span>
          </blockquote>
          <p className="text-sm text-slate-400">— {quote?.author || "..."}</p>
        </div>
      </div>
    </div>
  );
}
