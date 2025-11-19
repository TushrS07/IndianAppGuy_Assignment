// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home.jsx";
import AccessPage from "./components/AccessPage.jsx";
import ProfileForm from "./components/ProfileForm.jsx";
import MotivationalQuote from "./components/MotivationalQuote.jsx";
import AIFitnessPlan from "./components/AIFitnessPlan.jsx";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Navbar */}
      <Navbar />

      {/* Motivational Quote Section */}
      <div className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <MotivationalQuote />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/access" element={<AccessPage />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/ai-plan" element={<AIFitnessPlan />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-10">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500 flex justify-between">
          <span>© {new Date().getFullYear()} AI Fitness Coach</span>
          <span className="hidden sm:inline">
            Built for Fitness💪
          </span>
        </div>
      </footer>
    </div>
  );
}
