// src/pages/Home.jsx
import { Link } from "react-router-dom";
import Features from "../components/Features.jsx";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* HERO */}
      {/* HERO */}
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 px-3 py-1 text-xs text-emerald-300 bg-emerald-500/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            AI Fitness Coach · Assignment
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Personalized&nbsp;
            <span className="text-emerald-400">Workout & Diet</span>
            <br />
            powered by AI.
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl">
            Enter your details and let the AI generate a custom workout routine,
            diet plan, and daily motivation using LLMs. Built with Vite, React,
            Express, and MongoDB.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/access"
              className="px-4 py-2.5 rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/25"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="px-4 py-2.5 rounded-lg border border-slate-700 text-sm hover:bg-slate-900 transition"
            >
              View Features
            </a>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400">
            <div>
              ✅ AI-generated plans (no hardcoding)
            </div>
            <div>✅ Workout + Diet + Motivation</div>
            <div>✅ Sign up / Sign in / Guest</div>
          </div>
        </div>

        {/* Right side: Pretty card */}
        <div className="relative">
          <div className="absolute -inset-10 bg-gradient-to-tr from-emerald-500/20 via-sky-500/10 to-transparent blur-3xl opacity-70" />
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl backdrop-blur">
            <p className="text-xs font-medium text-emerald-300 mb-2">
              Example plan preview
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Goal</span>
                <span className="font-semibold text-emerald-300">
                  Muscle Gain
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Level</span>
                <span className="font-semibold">Intermediate</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Location</span>
                <span className="font-semibold">Home</span>
              </div>
              <hr className="border-slate-800" />
              <div>
                <p className="text-xs font-semibold mb-1">Today&apos;s Workout</p>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  <li>• Push-ups — 3 sets × 12 reps · 60s rest</li>
                  <li>• Squats — 4 sets × 10 reps · 75s rest</li>
                  <li>• Plank — 3 sets × 40s · 45s rest</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold mt-2 mb-1">Today&apos;s Diet</p>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  <li>• Breakfast: Oats + Peanut butter + Banana</li>
                  <li>• Lunch: Paneer + Brown rice + Salad</li>
                  <li>• Dinner: Lentil soup + Veggies</li>
                </ul>
              </div>
              <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 p-3 text-[11px] text-emerald-100">
                💬 <span className="font-semibold">AI Tip:</span> Stay hydrated,
                sleep 7–8 hours, and keep your form clean, not fast. You&apos;re
                doing great. 💪
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="pt-4">
        <Features />
      </section>
    </div>
  );
}
