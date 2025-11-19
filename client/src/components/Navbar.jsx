import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [hasPlans, setHasPlans] = useState(false);
  const [latestPlan, setLatestPlan] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  // Check for user in localStorage on mount and location change
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, [location]);

  // Check if user has existing plans
  useEffect(() => {
    const checkUserPlans = async () => {
      if (user) {
        try {
          const { getUserPlansAPI } = await import("../services/api");
          const response = await getUserPlansAPI();
          if (response.success && response.plans && response.plans.length > 0) {
            setHasPlans(true);
            setLatestPlan(response.plans[0]); // Get the most recent plan
          } else {
            setHasPlans(false);
            setLatestPlan(null);
          }
        } catch (error) {
          console.error("Error fetching plans:", error);
          setHasPlans(false);
        }
      } else {
        setHasPlans(false);
        setLatestPlan(null);
      }
    };

    checkUserPlans();
  }, [user, location]);

  const handleLogout = async () => {
    try {
      // Call backend logout API to clear cookies
      const { logoutAPI } = await import("../services/api");
      await logoutAPI();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear local storage - remove all user and plan data
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("lastGeneratedPlan");
      localStorage.removeItem("lastProfileData");
      setUser(null);
      setIsMenuOpen(false);
      // Navigate to home
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm font-bold shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
            <img src="/gym-workout-svgrepo-com (1).svg" alt="Logo" className="h-6 w-6" />
            </div>
            <span className="font-bold tracking-tight text-lg hidden sm:inline-block">
              AI Fitness Coach
            </span>
            <span className="font-bold tracking-tight text-lg sm:hidden">
              AI Fitness
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-all duration-200 ${
                isActive("/")
                  ? "text-emerald-400"
                  : "text-slate-300 hover:text-emerald-400"
              }`}
            >
              Home
            </Link>
            {/* <a
              href="#features"
              className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-all duration-200"
            >
              Features
            </a> */}
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  {hasPlans && latestPlan && (
                    <button
                      onClick={() => navigate("/ai-plan", { state: { formData: latestPlan.profileData, generatedPlan: latestPlan.plan } })}
                      className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-600 shadow-md hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200"
                    >
                      View My Plan
                    </button>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-300">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/access"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive("/access")
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-600 shadow-md hover:shadow-lg hover:shadow-emerald-500/30"
                }`}
              >
                Get Started
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span
                className={`h-0.5 w-full bg-slate-300 rounded-full transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`h-0.5 w-full bg-slate-300 rounded-full transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-0.5 w-full bg-slate-300 rounded-full transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 pb-4" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col gap-3 pt-4">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive("/")
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              Home
            </Link>
            <a
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 transition-all"
            >
              Features
            </a>
            {user ? (
              <>
                <div className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </div>
                {hasPlans && latestPlan && (
                  <button
                    onClick={() => {
                      navigate("/ai-plan", { state: { formData: latestPlan.profileData, generatedPlan: latestPlan.plan } });
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold text-center bg-emerald-500 text-slate-950 hover:bg-emerald-600 transition-all"
                  >
                    📋 View My Plan
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-center bg-slate-900 border border-slate-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/access"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-center transition-all ${
                  isActive("/access")
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-600"
                }`}
              >
                Get Started
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
