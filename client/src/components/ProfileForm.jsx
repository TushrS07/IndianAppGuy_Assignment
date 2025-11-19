import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { generatePlanAPI, getProfileAPI, saveProfileAPI } from "../services/api";

export default function ProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    heightFeet: "",
    heightInches: "",
    heightUnit: "cm",
    weight: "",
    weightUnit: "kg",
    fitnessGoal: "",
    fitnessLevel: "",
    workoutLocation: "",
    dietaryPreference: "",
    medicalHistory: "",
    stressLevel: "",
    sleepHours: "",
    waterIntake: "",
    injuries: "",
    allergies: "",
    smokingStatus: "",
    alcoholConsumption: "",
    workStyle: "",
    activityLevel: "",
    availableTime: "",
    preferredWorkoutTime: "",
  });

  // Load saved profile data - from backend if signed in, otherwise from localStorage
  useEffect(() => {
    const loadProfileData = async () => {
      const user = localStorage.getItem('user');
      const authToken = localStorage.getItem('authToken');
      
      // If user is signed in, fetch profile from backend
      if (user && authToken) {
        try {
          setLoading(true);
          const response = await getProfileAPI();
          
          if (response.success && response.user?.profileData) {
            setFormData(response.user.profileData);
            console.log('Profile loaded from backend');
          } else {
            // Fallback to localStorage if no profile data in backend
            loadFromLocalStorage();
          }
        } catch (err) {
          console.error('Error loading profile from backend:', err);
          // Fallback to localStorage on error
          loadFromLocalStorage();
        } finally {
          setLoading(false);
        }
      } else {
        // Guest user - load from localStorage
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const savedProfileData = localStorage.getItem('lastProfileData');
      if (savedProfileData) {
        try {
          const parsedData = JSON.parse(savedProfileData);
          setFormData(parsedData);
          console.log('Profile loaded from localStorage');
        } catch (err) {
          console.error('Error loading profile data from localStorage:', err);
        }
      }
    };

    loadProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      setLoading(true);
      
      // Save profile data to localStorage for guest users
      localStorage.setItem('lastProfileData', JSON.stringify(formData));
      
      // If user is signed in, also save to backend
      const user = localStorage.getItem('user');
      const authToken = localStorage.getItem('authToken');
      
      if (user && authToken) {
        try {
          await saveProfileAPI(formData);
          console.log('Profile saved to backend');
        } catch (err) {
          console.error('Error saving profile to backend:', err);
          // Continue with plan generation even if profile save fails
        }
      }
      
      // Call backend API to generate fitness plan
      const response = await generatePlanAPI(formData);
      
      if (response.success || response.plan) {
        // Navigate to AI Fitness Plan with the generated plan data
        navigate("/ai-plan", { 
          state: { 
            formData,
            generatedPlan: response.plan || response 
          } 
        });
      } else {
        setError(response.message || "Failed to generate plan. Please try again.");
      }
    } catch (err) {
      console.error("Error generating plan:", err);
      setError(err.message || "An error occurred while generating your plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader message="Generating your AI fitness plan..." />}
      <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Tell us about yourself
        </h1>
        <p className="text-slate-300 text-sm">
          Help us create a personalized fitness plan tailored just for you. All
          fields marked with * are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Basic and Fitness Information - Side by Side */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Age <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="10"
                  max="100"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your age"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Gender <span className="text-red-400">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-4 grid-cols-2">
                {/* Height */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    Height <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    {formData.heightUnit === "cm" ? (
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        required
                        min="100"
                        max="250"
                        className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Height"
                      />
                    ) : (
                      <>
                        <input
                          type="number"
                          name="heightFeet"
                          value={formData.heightFeet}
                          onChange={handleChange}
                          required
                          min="3"
                          max="8"
                          className="w-16 rounded-lg bg-slate-900 border border-slate-700 px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ft"
                        />
                        <input
                          type="number"
                          name="heightInches"
                          value={formData.heightInches}
                          onChange={handleChange}
                          required
                          min="0"
                          max="11"
                          className="w-16 rounded-lg bg-slate-900 border border-slate-700 px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="In"
                        />
                      </>
                    )}
                    <select
                      name="heightUnit"
                      value={formData.heightUnit}
                      onChange={handleChange}
                      className="w-16 rounded-lg bg-slate-900 border border-slate-700 px-1 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    Weight <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                      min={formData.weightUnit === "kg" ? "30" : "66"}
                      max={formData.weightUnit === "kg" ? "300" : "661"}
                      step="0.1"
                      className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Weight"
                    />
                    <select
                      name="weightUnit"
                      value={formData.weightUnit}
                      onChange={handleChange}
                      className="w-16 rounded-lg bg-slate-900 border border-slate-700 px-1 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fitness Information */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold mb-4">Fitness Information</h2>
            <div className="space-y-4">
              {/* Fitness Goal */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Fitness Goal <span className="text-red-400">*</span>
                </label>
                <select
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your goal</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="general-fitness">General Fitness</option>
                  <option value="endurance">Build Endurance</option>
                  <option value="flexibility">Improve Flexibility</option>
                  <option value="strength">Build Strength</option>
                </select>
              </div>

              {/* Fitness Level */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Current Fitness Level <span className="text-red-400">*</span>
                </label>
                <select
                  name="fitnessLevel"
                  value={formData.fitnessLevel}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Workout Location */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Workout Location <span className="text-red-400">*</span>
                </label>
                <select
                  name="workoutLocation"
                  value={formData.workoutLocation}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select location</option>
                  <option value="home">Home</option>
                  <option value="gym">Gym</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              {/* Dietary Preference */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Dietary Preference <span className="text-red-400">*</span>
                </label>
                <select
                  name="dietaryPreference"
                  value={formData.dietaryPreference}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select preference</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="no-preference">No Preference</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Information */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Additional Information{" "}
            <span className="text-sm font-normal text-slate-400">
              (Optional)
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Medical History */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Medical History or Health Conditions
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="e.g., Asthma, Knee injury, Blood pressure, Diabetes, Heart conditions, etc."
              />
            </div>

            {/* Allergies */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Food Allergies or Intolerances
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Lactose intolerant, Peanut allergy, Gluten sensitivity, etc."
              />
            </div>

            {/* Stress Level */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Current Stress Level
              </label>
              <select
                name="stressLevel"
                value={formData.stressLevel}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select stress level</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="very-high">Very High</option>
              </select>
            </div>

            {/* Daily Activity Level */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Daily Activity Level (Outside Workout)
              </label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select activity level</option>
                <option value="mostly-sitting">Mostly Sitting</option>
                <option value="some-walking">Some Walking/Standing</option>
                <option value="active">Active (Regular movement)</option>
                <option value="very-active">Very Active (Lots of movement)</option>
              </select>
            </div>

            {/* Smoking Status */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Smoking Status
              </label>
              <select
                name="smokingStatus"
                value={formData.smokingStatus}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select status</option>
                <option value="non-smoker">Non-smoker</option>
                <option value="occasional">Occasional</option>
                <option value="regular">Regular</option>
                <option value="ex-smoker">Ex-smoker</option>
              </select>
            </div>

            {/* Alcohol Consumption */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Alcohol Consumption
              </label>
              <select
                name="alcoholConsumption"
                value={formData.alcoholConsumption}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select frequency</option>
                <option value="never">Never</option>
                <option value="rarely">Rarely (Once a month or less)</option>
                <option value="occasionally">Occasionally (2-4 times a month)</option>
                <option value="regularly">Regularly (2-3 times a week)</option>
                <option value="frequently">Frequently (4+ times a week)</option>
              </select>
            </div>

            {/* Available Time */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Available Time for Workout (per day)
              </label>
              <select
                name="availableTime"
                value={formData.availableTime}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select time</option>
                <option value="15-30">15-30 minutes</option>
                <option value="30-45">30-45 minutes</option>
                <option value="45-60">45-60 minutes</option>
                <option value="60-90">60-90 minutes</option>
                <option value="90-plus">90+ minutes</option>
              </select>
            </div>

            {/* Workout Intensity */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Workout Intensity
              </label>
              <select
                name="workoutIntensity"
                value={formData.workoutIntensity}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select intensity</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 text-white font-semibold py-3 text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
          >
            Generate My AI Fitness Plan
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 rounded-lg border border-slate-700 text-slate-300 font-medium py-3 text-sm hover:bg-slate-900 transition"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Your data is secure and will be used only to generate your
          personalized fitness plan. We respect your privacy.
        </p>
      </form>
    </div>
    </>
  );
}
