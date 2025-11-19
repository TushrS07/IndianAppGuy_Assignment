// src/components/Features.jsx
export default function Features() {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          App Features
        </h2>
        <p className="text-slate-300 text-sm max-w-2xl">
          The AI Fitness Coach takes your inputs and uses LLMs to generate complete
          plans — from workouts to diet to motivation — fully personalized for you.
        </p>
  
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {/* User Inputs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold mb-2 text-lg">👤 User Profile</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Name, age, gender</li>
                <li>• Height, weight</li>
                <li>• Fitness goal & level</li>
                <li>• Workout location (Home / Gym / Outdoor)</li>
                <li>• Diet preference (Veg / Non-Veg / Vegan / Keto)</li>
                <li>• Optional: medical history, stress level</li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Data is sent to backend (Express + MongoDB) for plan generation and
              storage.
            </p>
          </div>
  
          {/* AI Plan Generation */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold mb-2 text-lg">🤖 AI Plan Generation</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Day-wise workout with sets, reps, and rest</li>
                <li>• Diet plan by meals: breakfast, lunch, dinner, snacks</li>
                <li>• LLM-powered (OpenAI / Gemini / etc.) via backend</li>
                <li>• No hardcoded plans, fully prompt-based</li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Prompts are built dynamically from the profile so each user gets a
              unique plan.
            </p>
          </div>
  
          {/* Tips & Motivation */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold mb-2 text-lg">💬 Tips & Motivation</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Lifestyle suggestions (sleep, hydration, steps)</li>
                <li>• Posture & form tips for key exercises</li>
                <li>• Short motivational messages</li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Helps users stay consistent and avoid common form mistakes.
            </p>
          </div>
  
          {/* Voice & Image */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold mb-2 text-lg">🔊🎨 Voice & Image</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Text-to-speech for generated plans</li>
                <li>• Optional AI-generated cover/images</li>
                <li>• Makes the experience more immersive</li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Bonus feature: can be implemented using Web Speech API + image API.
            </p>
          </div>
  
          {/* Access Modes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold mb-2 text-lg">🧭 Access Modes</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Sign up to save plans</li>
                <li>• Sign in to view previous plans</li>
                <li>• Guest mode for one-time use</li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Auth handled by Express + MongoDB (JWT or session-based).
            </p>
          </div>
  
          {/* Tech Stack */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold mb-2 text-lg">🛠️ Tech Stack</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Frontend: Vite + React + Tailwind CSS</li>
                <li>• Backend: Node.js + Express</li>
                <li>• Database: MongoDB</li>
                <li>• AI: LLM APIs (OpenAI / Gemini / etc.)</li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Clear separation between UI, backend APIs, and AI services.
            </p>
          </div>
        </div>
      </div>
    );
  }
  