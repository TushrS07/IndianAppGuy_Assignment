// // src/pages/AccessPage.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Loader from "./Loader";
// import { signUpAPI, signInAPI, verifyOtpAPI, resendOtpAPI } from "../services/api";

// const TABS = ["signup", "signin", "guest"];

// export default function AccessPage() {
//   const [activeTab, setActiveTab] = useState("signup");

//   return (
//     <div className="grid gap-8 md:grid-cols-[1.1fr,1.1fr] items-start">
//       {/* Left info section */}
//       <section className="space-y-4">
//         <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
//           Sign up, log in, or continue as guest
//         </h1>
//         <p className="text-sm text-slate-300 max-w-lg">
//           Create an account to save your AI-generated workout and diet plans, or
//           just try the app as a guest for a single session. All flows connect to
//           the same AI fitness engine.
//         </p>

//         <div className="mt-4 space-y-2 text-xs text-slate-400">
//           <p>🔐 <span className="font-semibold">Sign up</span> – new account, save profile + plans.</p>
//           <p>🔑 <span className="font-semibold">Sign in</span> – access previous data.</p>
//           <p>🚀 <span className="font-semibold">Guest</span> – quick test without login.</p>
//         </div>
//       </section>

//       {/* Right form section */}
//       <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6 shadow-xl">
//         {/* Tabs */}
//         <div className="flex mb-4 rounded-full bg-slate-900 border border-slate-800 p-1">
//           {TABS.map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`flex-1 text-xs md:text-sm py-2 rounded-full capitalize transition ${
//                 activeTab === tab
//                   ? "bg-blue-600 text-white font-semibold"
//                   : "text-slate-300 hover:bg-slate-800"
//               }`}
//             >
//               {tab === "signup"
//                 ? "Sign Up"
//                 : tab === "signin"
//                 ? "Sign In"
//                 : "Guest"}
//             </button>
//           ))}
//         </div>

//         {/* Content based on tab */}
//         {activeTab === "signup" && <SignupForm />}
//         {activeTab === "signin" && <SigninForm />}
//         {activeTab === "guest" && <GuestView />}
//       </section>
//     </div>
//   );
// }

// function SignupForm() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [showOtpSection, setShowOtpSection] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     fitnessGoal: "Weight Loss",
//   });
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [error, setError] = useState("");
//   const [otpError, setOtpError] = useState("");
//   const [resendTimer, setResendTimer] = useState(0);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError("");
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setError("");

//     // Validation
//     if (!formData.name || !formData.email || !formData.password) {
//       setError("All fields are required");
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     if (formData.password.length < 6) {
//       setError("Password must be at least 6 characters");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await signUpAPI({
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         fitnessGoal: formData.fitnessGoal,
//       });

//       if (response.success) {
//         setShowOtpSection(true);
//         setResendTimer(60); // Start 60 second countdown
//         startResendTimer();
//       } else {
//         setError(response.message || "Sign up failed. Please try again.");
//       }
//     } catch (err) {
//       setError("An error occurred. Please try again.");
//       console.error("Sign up error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startResendTimer = () => {
//     const interval = setInterval(() => {
//       setResendTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const handleOtpChange = (index, value) => {
//     if (value.length > 1) return; // Only allow single digit
    
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);
//     setOtpError("");

//     // Auto-focus next input
//     if (value && index < 5) {
//       document.getElementById(`otp-${index + 1}`)?.focus();
//     }
//   };

//   const handleOtpKeyDown = (index, e) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       document.getElementById(`otp-${index - 1}`)?.focus();
//     }
//   };

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     const otpValue = otp.join("");

//     if (otpValue.length !== 6) {
//       setOtpError("Please enter complete 6-digit OTP");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await verifyOtpAPI(formData.email, otpValue);

//       if (response.success) {
//         // Store token in localStorage (in production, use secure storage)
//         localStorage.setItem("authToken", response.token);
//         localStorage.setItem("user", JSON.stringify(response.user));
        
//         // Navigate to profile
//         navigate("/profile");
//       } else {
//         setOtpError(response.message || "Invalid OTP. Please try again.");
//         setOtp(["", "", "", "", "", ""]); // Reset OTP inputs
//         document.getElementById("otp-0")?.focus();
//       }
//     } catch (err) {
//       setOtpError("Verification failed. Please try again.");
//       console.error("OTP verification error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOtp = async () => {
//     if (resendTimer > 0) return;

//     try {
//       setLoading(true);
//       const response = await resendOtpAPI(formData.email);
      
//       if (response.success) {
//         setResendTimer(60);
//         startResendTimer();
//         setOtp(["", "", "", "", "", ""]);
//         setOtpError("");
//         document.getElementById("otp-0")?.focus();
//       }
//     } catch (err) {
//       console.error("Resend OTP error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (showOtpSection) {
//     return (
//       <>
//         {loading && <Loader message="Verifying OTP..." />}
//         <form onSubmit={handleVerifyOtp} className="space-y-4 text-sm">
//           <div className="text-center mb-6">
//             <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//               <span className="text-3xl">📧</span>
//             </div>
//             <h3 className="text-lg font-bold mb-2">Verify Your Email</h3>
//             <p className="text-xs text-slate-400">
//               We've sent a 6-digit code to<br />
//               <span className="text-blue-400 font-medium">{formData.email}</span>
//             </p>
//           </div>

//           {/* OTP Input Boxes */}
//           <div className="flex justify-center gap-2 mb-4">
//             {otp.map((digit, index) => (
//               <input
//                 key={index}
//                 id={`otp-${index}`}
//                 type="text"
//                 inputMode="numeric"
//                 maxLength="1"
//                 value={digit}
//                 onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ""))}
//                 onKeyDown={(e) => handleOtpKeyDown(index, e)}
//                 className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             ))}
//           </div>

//           {otpError && (
//             <div className="text-xs text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">
//               {otpError}
//             </div>
//           )}

//           <button
//             type="submit"
//             className="w-full mt-4 rounded-lg bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition"
//           >
//             Verify & Continue
//           </button>

//           <div className="text-center">
//             <button
//               type="button"
//               onClick={handleResendOtp}
//               disabled={resendTimer > 0}
//               className={`text-xs ${
//                 resendTimer > 0
//                   ? "text-slate-500 cursor-not-allowed"
//                   : "text-blue-400 hover:text-blue-300"
//               }`}
//             >
//               {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
//             </button>
//           </div>

//           <button
//             type="button"
//             onClick={() => {
//               setShowOtpSection(false);
//               setOtp(["", "", "", "", "", ""]);
//               setOtpError("");
//             }}
//             className="w-full text-xs text-slate-400 hover:text-slate-300"
//           >
//             ← Change Email Address
//           </button>
//         </form>
//       </>
//     );
//   }

//   return (
//     <>
//       {loading && <Loader message="Creating your account..." />}
//       <form onSubmit={handleSignup} className="space-y-4 text-sm">
//         {error && (
//           <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
//             {error}
//           </div>
//         )}

//         <div className="grid gap-3 md:grid-cols-2">
//           <div>
//             <label className="block mb-1 text-xs text-slate-300">Name *</label>
//             <input
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="John Doe"
//             />
//           </div>
//           <div>
//             <label className="block mb-1 text-xs text-slate-300">Email *</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="you@example.com"
//             />
//           </div>
//         </div>

//         <div className="grid gap-3 md:grid-cols-2">
//           <div>
//             <label className="block mb-1 text-xs text-slate-300">Password *</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               minLength="6"
//               className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="••••••••"
//             />
//           </div>
//           <div>
//             <label className="block mb-1 text-xs text-slate-300">
//               Confirm Password *
//             </label>
//             <input
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//               className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="••••••••"
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block mb-1 text-xs text-slate-300">
//             Fitness Goal (for profile)
//           </label>
//           <select
//             name="fitnessGoal"
//             value={formData.fitnessGoal}
//             onChange={handleChange}
//             className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option>Weight Loss</option>
//             <option>Muscle Gain</option>
//             <option>General Fitness</option>
//             <option>Build Endurance</option>
//             <option>Improve Flexibility</option>
//           </select>
//         </div>

//         <button
//           type="submit"
//           className="w-full mt-2 rounded-lg bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
//         >
//           Create Account
//         </button>

//         <p className="text-[11px] text-slate-500 mt-2">
//           We'll send a verification code to your email to confirm your account.
//         </p>
//       </form>
//     </>
//   );
// }

// function SigninForm() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     rememberMe: false,
//   });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
//     setFormData({ ...formData, [e.target.name]: value });
//     setError("");
//   };

//   const handleSignin = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!formData.email || !formData.password) {
//       setError("Email and password are required");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await signInAPI({
//         email: formData.email,
//         password: formData.password,
//       });

//       if (response.success) {
//         // Store token in localStorage
//         localStorage.setItem("authToken", response.token);
//         localStorage.setItem("user", JSON.stringify(response.user));
        
//         // Navigate to profile
//         navigate("/profile");
//       } else {
//         setError(response.message || "Invalid email or password");
//       }
//     } catch (err) {
//       setError("Login failed. Please try again.");
//       console.error("Sign in error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {loading && <Loader message="Signing you in..." />}
//       <form onSubmit={handleSignin} className="space-y-4 text-sm">
//         {error && (
//           <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
//             {error}
//           </div>
//         )}

//         <div>
//           <label className="block mb-1 text-xs text-slate-300">Email *</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="you@example.com"
//           />
//         </div>
//         <div>
//           <label className="block mb-1 text-xs text-slate-300">Password *</label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="••••••••"
//           />
//         </div>
//         <div className="flex items-center justify-between text-[11px] text-slate-400">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               name="rememberMe"
//               checked={formData.rememberMe}
//               onChange={handleChange}
//               className="h-3 w-3 rounded border-slate-600 bg-slate-900"
//             />
//             <span>Remember me</span>
//           </label>
//           <button type="button" className="hover:text-blue-300">
//             Forgot password?
//           </button>
//         </div>

//         <button
//           type="submit"
//           className="w-full mt-2 rounded-lg bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
//         >
//           Sign In
//         </button>

//         <p className="text-[11px] text-slate-500 mt-2">
//           After signing in, you'll be redirected to your fitness profile.
//         </p>
//       </form>
//     </>
//   );
// }

// function GuestView() {
//   const navigate = useNavigate();

//   const handleGuestContinue = () => {
//     // Navigate directly to profile form
//     navigate("/profile");
//   };

//   return (
//     <div className="space-y-4 text-sm">
//       <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-slate-300">
//         <p className="mb-2">
//           Use <span className="font-semibold text-blue-400">Guest Mode</span> to quickly generate one workout and diet plan
//           without creating an account.
//         </p>
//         <ul className="space-y-1">
//           <li>• No login required</li>
//           <li>• Plans are not saved permanently</li>
//           <li>• Great for quick demos of the AI engine</li>
//         </ul>
//       </div>

//       <button
//         type="button"
//         onClick={handleGuestContinue}
//         className="w-full rounded-lg bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
//       >
//         Continue as Guest
//       </button>

//       <p className="text-[11px] text-slate-500 mt-2">
//         You'll be able to fill out your fitness profile and generate a plan without creating an account.
//       </p>
//     </div>
//   );
// }

// src/pages/AccessPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { signUpAPI, signInAPI, verifyOtpAPI, resendOtpAPI } from "../services/api";

const TABS = ["signup", "signin", "guest"];

export default function AccessPage() {
  const [activeTab, setActiveTab] = useState("signup");

  return (
    <div className="grid gap-8 md:grid-cols-[1.1fr,1.1fr] items-start">
      {/* Left info section */}
      <section className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Sign up, log in, or continue as guest
        </h1>
        <p className="text-sm text-slate-300 max-w-lg">
          Create an account to save your AI-generated workout and diet plans, or
          just try the app as a guest for a single session. All flows connect to
          the same AI fitness engine.
        </p>

        <div className="mt-4 space-y-2 text-xs text-slate-400">
          <p>🔐 <span className="font-semibold">Sign up</span> – new account, save profile + plans.</p>
          <p>🔑 <span className="font-semibold">Sign in</span> – access previous data.</p>
          <p>🚀 <span className="font-semibold">Guest</span> – quick test without login.</p>
        </div>
      </section>

      {/* Right form section */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6 shadow-xl">
        {/* Tabs */}
        <div className="flex mb-4 rounded-full bg-slate-900 border border-slate-800 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs md:text-sm py-2 rounded-full capitalize transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tab === "signup"
                ? "Sign Up"
                : tab === "signin"
                ? "Sign In"
                : "Guest"}
            </button>
          ))}
        </div>

        {/* Content based on tab */}
        {activeTab === "signup" && <SignupForm />}
        {activeTab === "signin" && <SigninForm />}
        {activeTab === "guest" && <GuestView />}
      </section>
    </div>
  );
}

function SignupForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    fitnessGoal: "Weight Loss",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await signUpAPI({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        fitnessGoal: formData.fitnessGoal,
      });

      if (response.success || response.requiresVerification) {
        setShowOtpSection(true);
        setResendTimer(60); // Start 60 second countdown
        startResendTimer();
        
        // Show appropriate message
        if (response.message.includes("not verified")) {
          setError(""); // Clear error and show as info
        }
      } else {
        setError(response.message || "Sign up failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Sign up error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setOtpError("Please enter complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtpAPI(otpValue);

      if (response.success) {
        // Store token in localStorage
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Navigate to profile
        navigate("/profile");
      } else {
        setOtpError(response.message || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]); // Reset OTP inputs
        document.getElementById("otp-0")?.focus();
      }
    } catch (err) {
      setOtpError("Verification failed. Please try again.");
      console.error("OTP verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      setLoading(true);
      const response = await resendOtpAPI();
      
      if (response.success) {
        setResendTimer(60);
        startResendTimer();
        setOtp(["", "", "", "", "", ""]);
        setOtpError("");
        document.getElementById("otp-0")?.focus();
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showOtpSection) {
    return (
      <>
        {loading && <Loader message="Verifying OTP..." />}
        <form onSubmit={handleVerifyOtp} className="space-y-4 text-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Verify Your Email</h3>
            <p className="text-xs text-slate-400">
              We've sent a 6-digit code to<br />
              <span className="text-blue-400 font-medium">{formData.email}</span>
            </p>
          </div>

          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ))}
          </div>

          {otpError && (
            <div className="text-xs text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              {otpError}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 rounded-lg bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition"
          >
            Verify & Continue
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0}
              className={`text-xs ${
                resendTimer > 0
                  ? "text-slate-500 cursor-not-allowed"
                  : "text-blue-400 hover:text-blue-300"
              }`}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowOtpSection(false);
              setOtp(["", "", "", "", "", ""]);
              setOtpError("");
            }}
            className="w-full text-xs text-slate-400 hover:text-slate-300"
          >
            ← Change Email Address
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      {loading && <Loader message="Creating your account..." />}
      <form onSubmit={handleSignup} className="space-y-4 text-sm">
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            {error}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-xs text-slate-300">Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs text-slate-300">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-xs text-slate-300">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs text-slate-300">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-xs text-slate-300">
            Fitness Goal (for profile)
          </label>
          <select
            name="fitnessGoal"
            value={formData.fitnessGoal}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Weight Loss</option>
            <option>Muscle Gain</option>
            <option>General Fitness</option>
            <option>Build Endurance</option>
            <option>Improve Flexibility</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full mt-2 rounded-lg bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
        >
          Create Account
        </button>

        <p className="text-[11px] text-slate-500 mt-2">
          We'll send a verification code to your email to confirm your account.
        </p>
      </form>
    </>
  );
}

function SigninForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError("");
  };

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const response = await signInAPI({
        email: formData.email,
        password: formData.password,
      });

      console.log(`RESPONSE`,response);  

      if (response.success) {
        // Store token in localStorage
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Navigate to profile
        navigate("/profile");
      } else if (response.requiresVerification) {
        // User needs to verify email first - show OTP section
        setShowOtpSection(true);
        setResendTimer(60);
        startResendTimer();
        setError(""); // Clear error for OTP screen
        // Clear password for security
        setFormData({ ...formData, password: "" });
      } else {
        setError(response.message || "Invalid email or password");
      }
    } catch (err) {
      // Check if the error is due to verification requirement
      if (err.requiresVerification || err.data?.requiresVerification) {
        setShowOtpSection(true);
        setResendTimer(60);
        startResendTimer();
        setError(""); // Clear error for OTP screen
        setFormData({ ...formData, password: "" }); // Clear password for security
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
      console.error("Sign in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    if (value && index < 5) {
      document.getElementById(`signin-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`signin-otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setOtpError("Please enter complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtpAPI(otpValue);

      if (response.success) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/profile");
      } else {
        setOtpError(response.message || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("signin-otp-0")?.focus();
      }
    } catch (err) {
      setOtpError("Verification failed. Please try again.");
      console.error("OTP verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      setLoading(true);
      const response = await resendOtpAPI();
      
      if (response.success) {
        setResendTimer(60);
        startResendTimer();
        setOtp(["", "", "", "", "", ""]);
        setOtpError("");
        document.getElementById("signin-otp-0")?.focus();
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showOtpSection) {
    return (
      <>
        {loading && <Loader message="Verifying OTP..." />}
        <form onSubmit={handleVerifyOtp} className="space-y-4 text-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Verify Your Email</h3>
            <p className="text-xs text-slate-400">
              A verification code has been sent to<br />
              <span className="text-blue-400 font-medium">{formData.email}</span>
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`signin-otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ))}
          </div>

          {otpError && (
            <div className="text-xs text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              {otpError}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 rounded-lg bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition"
          >
            Verify & Sign In
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0}
              className={`text-xs ${
                resendTimer > 0
                  ? "text-slate-500 cursor-not-allowed"
                  : "text-blue-400 hover:text-blue-300"
              }`}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowOtpSection(false);
              setOtp(["", "", "", "", "", ""]);
              setOtpError("");
            }}
            className="w-full text-xs text-slate-400 hover:text-slate-300"
          >
            ← Back to Sign In
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      {loading && <Loader message="Signing you in..." />}
      <form onSubmit={handleSignin} className="space-y-4 text-sm">
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            {error}
          </div>
        )}

        <div>
          <label className="block mb-1 text-xs text-slate-300">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block mb-1 text-xs text-slate-300">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-3 w-3 rounded border-slate-600 bg-slate-900"
            />
            <span>Remember me</span>
          </label>
          <button type="button" className="hover:text-blue-300">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full mt-2 rounded-lg bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
        >
          Sign In
        </button>

        <p className="text-[11px] text-slate-500 mt-2">
          After signing in, you'll be redirected to your fitness profile.
        </p>
      </form>
    </>
  );
}

function GuestView() {
  const navigate = useNavigate();

  const handleGuestContinue = () => {
    navigate("/profile");
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-slate-300">
        <p className="mb-2">
          Use <span className="font-semibold text-blue-400">Guest Mode</span> to quickly generate one workout and diet plan
          without creating an account.
        </p>
        <ul className="space-y-1">
          <li>• No login required</li>
          <li>• Plans are not saved permanently</li>
          <li>• Great for quick demos of the AI engine</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={handleGuestContinue}
        className="w-full rounded-lg bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
      >
        Continue as Guest
      </button>

      <p className="text-[11px] text-slate-500 mt-2">
        You'll be able to fill out your fitness profile and generate a plan without creating an account.
      </p>
    </div>
  );
}