import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { generatePlanAPI, generateImageAPI } from "../services/api";
import Loader from "./Loader";

export default function AIFitnessPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({});
  const [generatedPlan, setGeneratedPlan] = useState(null);
  
  const [isGenerating, setIsGenerating] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDay, setSelectedDay] = useState("monday");
  
  // Voice reading states
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [readingSection, setReadingSection] = useState(null); // 'workout' or 'nutrition'
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [currentReadingDay, setCurrentReadingDay] = useState(null); // For workout
  const [currentReadingMealIndex, setCurrentReadingMealIndex] = useState(null); // For nutrition
  
  // Image modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageActuallyLoaded, setImageActuallyLoaded] = useState(false);
  
  // Load plan data on mount - only from navigation state, not localStorage
  useEffect(() => {
    // Only load if data was passed via navigation state (fresh generation)
    if (location.state?.formData) {
      setProfileData(location.state.formData);
      
      if (location.state.generatedPlan) {
        setGeneratedPlan(location.state.generatedPlan);
      }
      setIsGenerating(false);
    } else {
      // No plan data available - show prompt
      setIsGenerating(false);
    }
  }, [location]);
  
  // Simulate AI plan generation
  useEffect(() => {
    if (!generatedPlan && location.state?.formData) {
      const timer = setTimeout(() => {
        setIsGenerating(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [generatedPlan, location.state]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
    
    // Cleanup: stop any ongoing speech when component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Function to generate text for workout section
  const generateWorkoutText = () => {
    if (!generatedPlan?.weeklySchedule) return '';
    
    let text = 'Your Weekly Workout Schedule. ';
    
    Object.entries(generatedPlan.weeklySchedule).forEach(([day, schedule]) => {
      text += `${day.charAt(0).toUpperCase() + day.slice(1)}. `;
      text += `Focus: ${schedule.focus}. `;
      text += `Duration: ${schedule.duration}. `;
      text += `Intensity: ${schedule.intensity}. `;
      text += 'Exercises: ';
      
      schedule.exercises.forEach((exercise, idx) => {
        text += `${idx + 1}. ${exercise.name}, ${exercise.sets} sets of ${exercise.reps} repetitions, rest ${exercise.rest}. `;
      });
      
      text += ' ';
    });
    
    return text;
  };

  // Function to generate text for nutrition section
  const generateNutritionText = () => {
    if (!generatedPlan?.nutritionPlan) return '';
    
    let text = 'Your Daily Nutrition Plan. ';
    
    generatedPlan.nutritionPlan.meals.forEach((meal) => {
      text += `${meal.name} at ${meal.time}. `;
      text += `${meal.calories} calories. Protein: ${meal.protein}, Carbs: ${meal.carbs}, Fats: ${meal.fats}. `;
      text += 'Food items: ';
      meal.items.forEach(item => {
        text += `${item}. `;
      });
      text += ' ';
    });
    
    if (generatedPlan.nutritionPlan.hydration) {
      text += `Hydration: ${generatedPlan.nutritionPlan.hydration}. `;
    }
    
    if (generatedPlan.nutritionPlan.supplements?.length > 0) {
      text += 'Supplements: ';
      generatedPlan.nutritionPlan.supplements.forEach(supp => {
        text += `${supp}. `;
      });
    }
    
    return text;
  };

  // Handle voice reading
  const handleReadPlan = (section) => {
    if (!speechSynthesis) {
      return;
    }

    // If already reading the same section, stop it (no alert)
    if (isReading && readingSection === section) {
      speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
      setReadingSection(null);
      setCurrentUtterance(null);
      setCurrentReadingDay(null);
      setCurrentReadingMealIndex(null);
      return;
    }

    // Stop any ongoing speech
    speechSynthesis.cancel();
    setIsPaused(false);
    setCurrentReadingDay(null);
    setCurrentReadingMealIndex(null);

    // Switch to the appropriate tab
    if (section === 'workout') {
      setActiveTab('workout');
    } else if (section === 'nutrition') {
      setActiveTab('nutrition');
    }

    setIsReading(true);
    setReadingSection(section);

    // Small delay to allow tab switch animation to complete
    setTimeout(() => {
      if (section === 'workout') {
        readWorkoutPlan();
      } else if (section === 'nutrition') {
        readNutritionPlan();
      }
    }, 300);
  };

  // Read workout plan with highlighting
  const readWorkoutPlan = () => {
    if (!generatedPlan?.weeklySchedule) return;

    const days = Object.keys(generatedPlan.weeklySchedule);
    let currentDayIndex = 0;

    const readNextDay = () => {
      if (currentDayIndex >= days.length) {
        setIsReading(false);
        setReadingSection(null);
        setCurrentReadingDay(null);
        return;
      }

      const day = days[currentDayIndex];
      const schedule = generatedPlan.weeklySchedule[day];
      
      // Highlight current day
      setCurrentReadingDay(day);

      // Generate text for this day
      let text = `${day.charAt(0).toUpperCase() + day.slice(1)}. `;
      text += `Focus: ${schedule.focus}. `;
      text += `Duration: ${schedule.duration}. `;
      text += `Intensity: ${schedule.intensity}. `;
      text += 'Exercises: ';
      
      schedule.exercises.forEach((exercise, idx) => {
        text += `${idx + 1}. ${exercise.name}, ${exercise.sets} sets of ${exercise.reps} repetitions, rest ${exercise.rest}. `;
      });

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        currentDayIndex++;
        readNextDay();
      };

      utterance.onerror = () => {
        setIsReading(false);
        setReadingSection(null);
        setCurrentReadingDay(null);
      };

      setCurrentUtterance(utterance);
      speechSynthesis.speak(utterance);
    };

    readNextDay();
  };

  // Read nutrition plan with highlighting
  const readNutritionPlan = () => {
    if (!generatedPlan?.nutritionPlan?.meals) return;

    const meals = generatedPlan.nutritionPlan.meals;
    let currentMealIdx = 0;

    const readNextMeal = () => {
      if (currentMealIdx >= meals.length) {
        // Read hydration and supplements at the end
        if (generatedPlan.nutritionPlan.hydration || generatedPlan.nutritionPlan.supplements?.length > 0) {
          readHydrationAndSupplements();
        } else {
          setIsReading(false);
          setReadingSection(null);
          setCurrentReadingMealIndex(null);
        }
        return;
      }

      const meal = meals[currentMealIdx];
      
      // Highlight current meal
      setCurrentReadingMealIndex(currentMealIdx);

      // Generate text for this meal
      let text = `${meal.name} at ${meal.time}. `;
      text += `${meal.calories} calories. Protein: ${meal.protein}, Carbs: ${meal.carbs}, Fats: ${meal.fats}. `;
      text += 'Food items: ';
      meal.items.forEach(item => {
        text += `${item}. `;
      });

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        currentMealIdx++;
        readNextMeal();
      };

      utterance.onerror = () => {
        setIsReading(false);
        setReadingSection(null);
        setCurrentReadingMealIndex(null);
      };

      setCurrentUtterance(utterance);
      speechSynthesis.speak(utterance);
    };

    const readHydrationAndSupplements = () => {
      setCurrentReadingMealIndex(-1); // Special index for hydration/supplements

      let text = '';
      if (generatedPlan.nutritionPlan.hydration) {
        text += `Hydration: ${generatedPlan.nutritionPlan.hydration}. `;
      }
      
      if (generatedPlan.nutritionPlan.supplements?.length > 0) {
        text += 'Supplements: ';
        generatedPlan.nutritionPlan.supplements.forEach(supp => {
          text += `${supp}. `;
        });
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setIsReading(false);
        setReadingSection(null);
        setCurrentReadingMealIndex(null);
      };

      utterance.onerror = () => {
        setIsReading(false);
        setReadingSection(null);
        setCurrentReadingMealIndex(null);
      };

      setCurrentUtterance(utterance);
      speechSynthesis.speak(utterance);
    };

    readNextMeal();
  };

  // Handle pause/resume reading
  const handlePauseResume = () => {
    if (!speechSynthesis) return;

    if (isPaused) {
      // Resume
      speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // Pause
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Handle stop reading
  const handleStopReading = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
      setReadingSection(null);
      setCurrentUtterance(null);
      setCurrentReadingDay(null);
      setCurrentReadingMealIndex(null);
    }
  };

  // Handle showing image for exercise or meal
  const handleShowImage = async (query, type = 'exercise') => {
    setImageLoading(true);
    setShowImageModal(true);
    setImageActuallyLoaded(false);
    
    try {
      // Call backend API to generate image using Gemini-powered service
      console.log('Requesting image for:', query, 'type:', type);
      const response = await generateImageAPI(query, type);
      console.log('Image API response:', response);
      
      if (response.success && response.imageUrl) {
        console.log('Setting image URL:', response.imageUrl);
        setCurrentImage({
          url: response.imageUrl,
          alt: query,
          photographer: 'AI Generated',
          photographerUrl: null
        });
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      // Fallback to placeholder
      setCurrentImage({
        url: `https://via.placeholder.com/800x600/1e293b/94a3b8?text=${encodeURIComponent(query)}`,
        alt: query,
        photographer: null,
        photographerUrl: null
      });
    } finally {
      setImageLoading(false);
    }
  };

  // Close image modal
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setCurrentImage(null);
  };

  // Handle regenerate plan
  const handleRegeneratePlan = async () => {
    if (!profileData || !profileData.name) {
      alert('No profile data available. Please create your profile first.');
      navigate('/profile');
      return;
    }

    try {
      setIsRegenerating(true);
      
      // Call backend API to generate new fitness plan with existing profile data
      const response = await generatePlanAPI(profileData);
      
      if (response.success || response.plan) {
        // Update the generated plan
        setGeneratedPlan(response.plan || response);
        // Reset to overview tab
        setActiveTab('overview');
        // Show success message
        alert('Plan regenerated successfully!');
      } else {
        alert(response.message || 'Failed to regenerate plan. Please try again.');
      }
    } catch (err) {
      console.error('Error regenerating plan:', err);
      alert(err.message || 'An error occurred while regenerating your plan. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // If no plan data exists, show a prompt to create one
  if (!isGenerating && !generatedPlan && !profileData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <span className="text-6xl">💪</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">No Fitness Plan Found</h2>
          <p className="text-slate-400 mb-6">
            You haven't generated a fitness plan yet. Create your personalized plan to get started!
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-lg shadow-blue-500/25"
          >
            Create Your Plan
          </button>
        </div>
      </div>
    );
  }

  // Mock AI-generated data (fallback if no real plan from backend)
  const fitnessOverview = generatedPlan?.overview || {
    planDuration: "12 Weeks",
    targetGoal: profileData.fitnessGoal || "General Fitness",
    calorieTarget: "2,200 kcal/day",
    proteinTarget: "140g/day",
    workoutFrequency: "5 days/week",
    restDays: "2 days/week"
  };

  const weeklySchedule = generatedPlan?.weeklySchedule || {
    monday: {
      focus: "Upper Body Strength",
      duration: "45-60 min",
      intensity: "High",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Bent-Over Rows", sets: 4, reps: "10-12", rest: "90s" },
        { name: "Overhead Press", sets: 3, reps: "8-10", rest: "60s" },
        { name: "Pull-Ups", sets: 3, reps: "Max", rest: "90s" },
        { name: "Bicep Curls", sets: 3, reps: "12-15", rest: "45s" },
        { name: "Tricep Dips", sets: 3, reps: "12-15", rest: "45s" }
      ]
    },
    tuesday: {
      focus: "Lower Body Power",
      duration: "50-65 min",
      intensity: "High",
      exercises: [
        { name: "Squats", sets: 4, reps: "8-10", rest: "120s" },
        { name: "Romanian Deadlifts", sets: 4, reps: "10-12", rest: "90s" },
        { name: "Leg Press", sets: 3, reps: "12-15", rest: "90s" },
        { name: "Walking Lunges", sets: 3, reps: "12 each leg", rest: "60s" },
        { name: "Calf Raises", sets: 4, reps: "15-20", rest: "45s" }
      ]
    },
    wednesday: {
      focus: "Active Recovery & Core",
      duration: "30-40 min",
      intensity: "Low-Moderate",
      exercises: [
        { name: "Yoga Flow", sets: 1, reps: "15 min", rest: "-" },
        { name: "Planks", sets: 3, reps: "60s", rest: "45s" },
        { name: "Russian Twists", sets: 3, reps: "20 each side", rest: "30s" },
        { name: "Mountain Climbers", sets: 3, reps: "30s", rest: "30s" },
        { name: "Stretching Routine", sets: 1, reps: "10 min", rest: "-" }
      ]
    },
    thursday: {
      focus: "Push Day",
      duration: "45-60 min",
      intensity: "High",
      exercises: [
        { name: "Incline Dumbbell Press", sets: 4, reps: "10-12", rest: "90s" },
        { name: "Dumbbell Flyes", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Shoulder Press", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Lateral Raises", sets: 3, reps: "12-15", rest: "45s" },
        { name: "Tricep Pushdowns", sets: 3, reps: "12-15", rest: "45s" }
      ]
    },
    friday: {
      focus: "Pull Day",
      duration: "45-60 min",
      intensity: "High",
      exercises: [
        { name: "Deadlifts", sets: 4, reps: "6-8", rest: "120s" },
        { name: "Lat Pulldowns", sets: 4, reps: "10-12", rest: "90s" },
        { name: "Cable Rows", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s" },
        { name: "Hammer Curls", sets: 3, reps: "12-15", rest: "45s" }
      ]
    },
    saturday: {
      focus: "HIIT Cardio",
      duration: "30-40 min",
      intensity: "Very High",
      exercises: [
        { name: "Warm-up Jog", sets: 1, reps: "5 min", rest: "-" },
        { name: "Sprint Intervals", sets: 8, reps: "30s sprint", rest: "90s walk" },
        { name: "Burpees", sets: 4, reps: "15 reps", rest: "60s" },
        { name: "Jump Rope", sets: 4, reps: "60s", rest: "45s" },
        { name: "Cool-down Walk", sets: 1, reps: "5 min", rest: "-" }
      ]
    },
    sunday: {
      focus: "Complete Rest",
      duration: "0 min",
      intensity: "Rest",
      exercises: [
        { name: "Light Walking (Optional)", sets: 1, reps: "20-30 min", rest: "-" },
        { name: "Meditation/Relaxation", sets: 1, reps: "15 min", rest: "-" },
        { name: "Meal Prep", sets: 1, reps: "As needed", rest: "-" }
      ]
    }
  };

  const nutritionPlan = generatedPlan?.nutritionPlan || {
    meals: [
      {
        time: "7:00 AM",
        name: "Breakfast",
        items: ["Oatmeal with berries and almonds", "2 whole eggs", "Green tea"],
        calories: 450,
        protein: "25g",
        carbs: "45g",
        fats: "18g"
      },
      {
        time: "10:00 AM",
        name: "Mid-Morning Snack",
        items: ["Greek yogurt", "1 banana", "Handful of walnuts"],
        calories: 280,
        protein: "15g",
        carbs: "32g",
        fats: "10g"
      },
      {
        time: "1:00 PM",
        name: "Lunch",
        items: ["Grilled chicken breast (150g)", "Brown rice (1 cup)", "Mixed vegetables", "Side salad"],
        calories: 550,
        protein: "45g",
        carbs: "55g",
        fats: "12g"
      },
      {
        time: "4:00 PM",
        name: "Pre-Workout Snack",
        items: ["Apple with peanut butter", "Protein shake"],
        calories: 320,
        protein: "20g",
        carbs: "35g",
        fats: "12g"
      },
      {
        time: "7:00 PM",
        name: "Dinner",
        items: ["Baked salmon (150g)", "Quinoa (1 cup)", "Steamed broccoli", "Mixed greens salad"],
        calories: 500,
        protein: "40g",
        carbs: "48g",
        fats: "15g"
      },
      {
        time: "9:00 PM",
        name: "Evening Snack",
        items: ["Cottage cheese (100g)", "Cucumber slices"],
        calories: 100,
        protein: "12g",
        carbs: "5g",
        fats: "3g"
      }
    ],
    hydration: "3-4 liters of water daily",
    supplements: ["Multivitamin", "Omega-3", "Protein Powder (post-workout)"]
  };

  const progressMetrics = generatedPlan?.progressMetrics || [
    { metric: "Starting Weight", value: `${profileData.weight || "70"} ${profileData.weightUnit || "kg"}`, target: "Target: -8kg in 12 weeks" },
    { metric: "Body Fat %", value: "22%", target: "Target: 18%" },
    { metric: "Muscle Mass", value: "58kg", target: "Target: +2kg" },
    { metric: "Weekly Workout", value: "0/5 completed", target: "Goal: 5 sessions" }
  ];

  const tips = generatedPlan?.tips || [
    "Stay consistent with your workout schedule for optimal results",
    "Ensure 7-8 hours of quality sleep each night for recovery",
    "Track your meals and maintain a slight calorie deficit for fat loss",
    "Progressive overload: Gradually increase weights every 2 weeks",
    "Stay hydrated - drink water before, during, and after workouts",
    "Listen to your body and take extra rest if needed"
  ];

  // Function to generate and download PDF
  const handleDownloadPDF = () => {
    setIsDownloading(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkAddPage = (requiredSpace = 15) => {
        if (yPosition + requiredSpace > pageHeight - margin - 10) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Add a colored header banner on first page
      pdf.setFillColor(16, 185, 129); // Emerald color
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Logo/Icon placeholder
      pdf.setFillColor(255, 255, 255);
      pdf.circle(margin, 20, 8, 'F');
      pdf.setFontSize(12);
      pdf.setTextColor(16, 185, 129);
      pdf.text('AI', margin - 3, 22);

      // Title on banner
      pdf.setFontSize(26);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('AI-Powered Fitness Plan', margin + 15, 22);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Your Personalized Path to Fitness Success', margin + 15, 30);
      
      yPosition = 50;

      // User Info Section with box
      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'FD');
      
      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Client Information', margin + 5, yPosition);
      
      yPosition += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Name: ${profileData.name || 'User'}`, margin + 5, yPosition);
      pdf.text(`Age: ${profileData.age || 'N/A'} years`, margin + 70, yPosition);
      
      yPosition += 5;
      pdf.text(`Fitness Level: ${profileData.fitnessLevel || 'Intermediate'}`, margin + 5, yPosition);
      pdf.text(`Location: ${profileData.workoutLocation || 'N/A'}`, margin + 70, yPosition);
      
      yPosition += 5;
      pdf.text(`Primary Goal: ${profileData.fitnessGoal || 'General Fitness'}`, margin + 5, yPosition);
      pdf.text(`Diet Preference: ${profileData.dietaryPreference || 'None'}`, margin + 70, yPosition);
      
      yPosition += 12;

      // Plan Overview Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Plan Overview', margin, yPosition);
      yPosition += 3;
      
      // Underline
      pdf.setDrawColor(16, 185, 129);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, margin + 50, yPosition);
      yPosition += 8;
      
      // Overview in grid format
      const overviewData = [
        ['Duration', fitnessOverview.planDuration, 'Workout Days', fitnessOverview.workoutFrequency],
        ['Target Goal', fitnessOverview.targetGoal, 'Rest Days', fitnessOverview.restDays],
        ['Daily Calories', fitnessOverview.calorieTarget, 'Daily Protein', fitnessOverview.proteinTarget]
      ];
      
      pdf.setFontSize(9);
      overviewData.forEach(row => {
        checkAddPage();
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 116, 139);
        pdf.text(row[0] + ':', margin + 5, yPosition);
        pdf.text(row[2] + ':', margin + 100, yPosition);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 41, 59);
        pdf.text(row[1], margin + 35, yPosition);
        pdf.text(row[3], margin + 130, yPosition);
        yPosition += 6;
      });
      yPosition += 8;

      // Weekly Schedule Section
      checkAddPage(25);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Weekly Workout Schedule', margin, yPosition);
      yPosition += 3;
      pdf.setDrawColor(16, 185, 129);
      pdf.line(margin, yPosition, margin + 70, yPosition);
      yPosition += 10;

      Object.entries(weeklySchedule).forEach(([day, schedule]) => {
        checkAddPage(25);
        
        // Day header with colored background
        pdf.setFillColor(239, 246, 255);
        pdf.roundedRect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 2, 2, 'F');
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246);
        pdf.text(day.charAt(0).toUpperCase() + day.slice(1), margin + 3, yPosition);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text(`${schedule.duration} - ${schedule.intensity} Intensity`, pageWidth - margin - 50, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105);
        pdf.text(`Focus: ${schedule.focus}`, margin + 5, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        
        schedule.exercises.slice(0, 6).forEach((exercise, idx) => {
          checkAddPage();
          pdf.setTextColor(30, 41, 59);
          const exerciseText = `${idx + 1}. ${exercise.name}`;
          const setsReps = `${exercise.sets} x ${exercise.reps} (Rest: ${exercise.rest})`;
          
          pdf.text(exerciseText, margin + 8, yPosition);
          pdf.setTextColor(100, 116, 139);
          pdf.text(setsReps, margin + 90, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      });

      // Nutrition Plan Section
      checkAddPage(25);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Daily Nutrition Plan', margin, yPosition);
      yPosition += 3;
      pdf.setDrawColor(16, 185, 129);
      pdf.line(margin, yPosition, margin + 60, yPosition);
      yPosition += 10;

      nutritionPlan.meals.forEach((meal) => {
        checkAddPage(20);
        
        // Meal header
        pdf.setFillColor(254, 252, 232);
        pdf.roundedRect(margin, yPosition - 5, pageWidth - 2 * margin, 7, 2, 2, 'F');
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(217, 119, 6);
        pdf.text(meal.name, margin + 3, yPosition);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 113, 108);
        pdf.text(meal.time, pageWidth - margin - 30, yPosition);
        yPosition += 8;
        
        // Macros
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`${meal.calories} cal - Protein: ${meal.protein} - Carbs: ${meal.carbs} - Fats: ${meal.fats}`, margin + 5, yPosition);
        yPosition += 5;
        
        // Food items
        pdf.setFontSize(8);
        pdf.setTextColor(71, 85, 105);
        meal.items.forEach(item => {
          checkAddPage();
          pdf.text(`  - ${item}`, margin + 5, yPosition);
          yPosition += 4;
        });
        yPosition += 5;
      });

      // Hydration & Supplements
      checkAddPage(15);
      pdf.setFillColor(239, 246, 255);
      pdf.roundedRect(margin, yPosition, (pageWidth - 2 * margin - 5) / 2, 20, 2, 2, 'F');
      pdf.setFillColor(243, 244, 246);
      pdf.roundedRect(margin + (pageWidth - 2 * margin + 5) / 2, yPosition, (pageWidth - 2 * margin - 5) / 2, 20, 2, 2, 'F');
      
      yPosition += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text('Hydration', margin + 3, yPosition);
      pdf.setTextColor(107, 114, 128);
      pdf.text('Supplements', margin + (pageWidth - 2 * margin + 5) / 2 + 3, yPosition);
      
      yPosition += 6;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(nutritionPlan.hydration, margin + 3, yPosition);
      
      let suppY = yPosition;
      nutritionPlan.supplements.forEach(supp => {
        pdf.text(`- ${supp}`, margin + (pageWidth - 2 * margin + 5) / 2 + 3, suppY);
        suppY += 4;
      });
      yPosition += 18;

      // Important Tips Section
      checkAddPage(25);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Important Tips & Guidelines', margin, yPosition);
      yPosition += 3;
      pdf.setDrawColor(16, 185, 129);
      pdf.line(margin, yPosition, margin + 75, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      tips.forEach((tip, idx) => {
        checkAddPage(8);
        const lines = pdf.splitTextToSize(`${idx + 1}. ${tip}`, pageWidth - 2 * margin - 10);
        lines.forEach(line => {
          checkAddPage();
          pdf.text(line, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 2;
      });

      // Progress Tracking Info
      checkAddPage(20);
      yPosition += 5;
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Remember:', margin, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('- Track your progress weekly', margin + 5, yPosition);
      yPosition += 5;
      pdf.text('- Stay consistent with your routine', margin + 5, yPosition);
      yPosition += 5;
      pdf.text('- Adjust the plan based on your body\'s response', margin + 5, yPosition);
      yPosition += 5;
      pdf.text('- Consult a healthcare professional before starting any new fitness program', margin + 5, yPosition);

      // Footer on all pages
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Footer text
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          'Generated by AI Fitness Coach | Personalized Health & Wellness Platform',
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        pdf.setFontSize(7);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: 'right' }
        );
        
        pdf.text(
          `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          margin,
          pageHeight - 10
        );
      }

      // Save PDF
      pdf.save(`AI-Fitness-Plan-${profileData.name?.replace(/\s+/g, '-') || 'User'}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-8 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Generating Your AI Fitness Plan</h2>
          <p className="text-slate-400">Analyzing your profile and creating a personalized plan...</p>
          <div className="mt-6 space-y-2 text-sm text-slate-500">
            <p className="animate-pulse">🧠 Analyzing your fitness goals...</p>
            <p className="animate-pulse" style={{ animationDelay: "0.5s" }}>💪 Customizing workout routines...</p>
            <p className="animate-pulse" style={{ animationDelay: "1s" }}>🥗 Preparing nutrition guidelines...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isRegenerating && <Loader message="Regenerating your AI fitness plan..." />}
      <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Your AI-Powered Fitness Plan
            </h1>
            <p className="text-slate-400 mt-2">
              Personalized for <span className="text-white font-medium">{profileData.name || "You"}</span> • 
              Level: <span className="text-blue-400 font-medium capitalize">{profileData.fitnessLevel || "Intermediate"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-semibold text-sm transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          </div>
        </div>

        {/* Voice Reading Section */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Voice Assistant</h3>
                <p className="text-xs text-slate-400">Listen to your plan sections</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isReading && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                  <div className="flex gap-1">
                    <span className="w-1 h-3 bg-purple-500 rounded-full animate-pulse"></span>
                    <span className="w-1 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                  <span className="text-xs text-purple-300 font-medium">{isPaused ? 'Paused' : `Reading ${readingSection}...`}</span>
                </div>
              )}
              {isReading && (
                <button
                  onClick={handlePauseResume}
                  className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-medium text-sm transition flex items-center gap-2"
                >
                  {isPaused ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Resume
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                      Pause
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => handleReadPlan('workout')}
                disabled={isReading && readingSection !== 'workout'}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
                  isReading && readingSection === 'workout'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isReading && readingSection === 'workout' ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Workout
                  </>
                )}
              </button>
              <button
                onClick={() => handleReadPlan('nutrition')}
                disabled={isReading && readingSection !== 'nutrition'}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
                  isReading && readingSection === 'nutrition'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isReading && readingSection === 'nutrition' ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Nutrition
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(fitnessOverview).slice(0, 4).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-slate-800">
        <div className="flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "workout", label: "Workout Plan", icon: "💪" },
            { id: "nutrition", label: "Nutrition", icon: "🥗" },
            { id: "progress", label: "Progress", icon: "📈" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 font-medium text-sm transition relative ${
                activeTab === tab.id
                  ? "text-blue-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Plan Summary */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold mb-4">Plan Summary</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Goals</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-300">Primary Goal</span>
                      <span className="font-semibold text-blue-400 capitalize">
                        {profileData.fitnessGoal?.replace('-', ' ') || "General Fitness"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-300">Fitness Level</span>
                      <span className="font-semibold capitalize">{profileData.fitnessLevel || "Intermediate"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-300">Location</span>
                      <span className="font-semibold capitalize">{profileData.workoutLocation || "Gym"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-300">Available Time</span>
                      <span className="font-semibold">{profileData.availableTime || "45-60"} min/day</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Key Targets</h3>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-slate-400 mb-1">Daily Calorie Target</p>
                      <p className="text-2xl font-bold text-blue-400">{fitnessOverview.calorieTarget}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <p className="text-sm text-slate-400 mb-1">Daily Protein Goal</p>
                      <p className="text-2xl font-bold text-cyan-400">{fitnessOverview.proteinTarget}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-sm text-slate-400 mb-1">Weekly Workouts</p>
                      <p className="text-2xl font-bold text-purple-400">{fitnessOverview.workoutFrequency}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips & Recommendations */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold mb-4">💡 Tips & Recommendations</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition">
                    <span className="text-blue-400 font-bold">{index + 1}.</span>
                    <p className="text-sm text-slate-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Workout Tab */}
        {activeTab === "workout" && (
          <div className="space-y-6">
            {/* Day Selector */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold mb-4">Weekly Schedule</h2>
              <div className="grid grid-cols-7 gap-2">
                {Object.keys(weeklySchedule).map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`p-3 rounded-lg text-sm font-medium transition ${
                      currentReadingDay === day
                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 ring-2 ring-purple-400 animate-pulse"
                        : selectedDay === day
                        ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                        : "bg-slate-800/40 text-slate-400 hover:bg-slate-800/60"
                    }`}
                  >
                    {day.slice(0, 3).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Day Details */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold capitalize">{selectedDay}</h2>
                  <p className="text-blue-400 font-medium">{weeklySchedule[selectedDay].focus}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Duration</p>
                  <p className="text-xl font-bold">{weeklySchedule[selectedDay].duration}</p>
                  <p className={`text-sm font-medium mt-1 ${
                    weeklySchedule[selectedDay].intensity === "High" || weeklySchedule[selectedDay].intensity === "Very High"
                      ? "text-red-400"
                      : weeklySchedule[selectedDay].intensity === "Low-Moderate"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}>
                    {weeklySchedule[selectedDay].intensity} Intensity
                  </p>
                </div>
              </div>

              {/* Exercise List */}
              <div className="space-y-3">
                {weeklySchedule[selectedDay].exercises.map((exercise, index) => (
                  <div key={index} className="p-4 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{exercise.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                            <span>Sets: <span className="text-white font-medium">{exercise.sets}</span></span>
                            <span>Reps: <span className="text-white font-medium">{exercise.reps}</span></span>
                            <span>Rest: <span className="text-white font-medium">{exercise.rest}</span></span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleShowImage(exercise.name, 'exercise')}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-sm font-medium transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Tab */}
        {activeTab === "nutrition" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold mb-4">Daily Meal Plan</h2>
              <p className="text-slate-400 mb-6">
                Based on your dietary preference: <span className="text-white font-medium capitalize">{profileData.dietaryPreference || "No Preference"}</span>
              </p>
              
              {/* Meals */}
              <div className="space-y-4">
                {nutritionPlan.meals.map((meal, index) => (
                  <div 
                    key={index} 
                    className={`p-5 rounded-xl border transition-all ${
                      currentReadingMealIndex === index
                        ? "bg-purple-500/20 border-purple-500/50 ring-2 ring-purple-400 shadow-lg shadow-purple-500/30"
                        : "bg-slate-800/40 border-slate-700/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🍽️</span>
                          <div>
                            <h3 className="font-bold text-lg">{meal.name}</h3>
                            <p className="text-sm text-slate-400">{meal.time}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">{meal.calories}</p>
                        <p className="text-xs text-slate-400">calories</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Food Items:</h4>
                      <ul className="space-y-2">
                        {meal.items.map((item, idx) => (
                          <li key={idx} className="flex items-center justify-between text-sm bg-slate-900/50 px-3 py-2 rounded-lg">
                            <span className="text-slate-300 flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span>
                              {item}
                            </span>
                            <button
                              onClick={() => handleShowImage(item, 'food')}
                              className="ml-2 px-3 py-1 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs font-medium transition flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              View
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-xs pt-3 border-t border-slate-700">
                      <span className="text-slate-400">Protein: <span className="text-cyan-400 font-semibold">{meal.protein}</span></span>
                      <span className="text-slate-400">Carbs: <span className="text-purple-400 font-semibold">{meal.carbs}</span></span>
                      <span className="text-slate-400">Fats: <span className="text-yellow-400 font-semibold">{meal.fats}</span></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hydration & Supplements */}
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className={`p-5 rounded-xl border transition-all ${
                  currentReadingMealIndex === -1
                    ? "bg-purple-500/20 border-purple-500/50 ring-2 ring-purple-400 shadow-lg shadow-purple-500/30"
                    : "bg-blue-500/10 border-blue-500/20"
                }`}>
                  <h3 className="font-bold mb-2 flex items-center">
                    <span className="text-xl mr-2">💧</span>
                    Hydration Goal
                  </h3>
                  <p className="text-2xl font-bold text-blue-400">{nutritionPlan.hydration}</p>
                </div>
                <div className={`p-5 rounded-xl border transition-all ${
                  currentReadingMealIndex === -1
                    ? "bg-purple-500/20 border-purple-500/50 ring-2 ring-purple-400 shadow-lg shadow-purple-500/30"
                    : "bg-purple-500/10 border-purple-500/20"
                }`}>
                  <h3 className="font-bold mb-2 flex items-center">
                    <span className="text-xl mr-2">💊</span>
                    Recommended Supplements
                  </h3>
                  <div className="space-y-1">
                    {nutritionPlan.supplements.map((supp, idx) => (
                      <p key={idx} className="text-sm text-purple-300">• {supp}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold mb-6">Progress Tracking</h2>
              
              {/* Metrics Cards */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {progressMetrics.map((item, index) => (
                  <div key={index} className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <p className="text-sm text-slate-400 mb-2">{item.metric}</p>
                    <p className="text-3xl font-bold mb-1">{item.value}</p>
                    <p className="text-sm text-blue-400">{item.target}</p>
                  </div>
                ))}
              </div>

              {/* Progress Chart Placeholder */}
              <div className="p-8 rounded-xl bg-slate-800/40 border border-slate-700/50 text-center">
                <div className="mb-4">
                  <span className="text-6xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Progress Charts</h3>
                <p className="text-slate-400 mb-4">Track your weight, measurements, and performance over time</p>
                <button className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-sm transition">
                  Start Tracking
                </button>
              </div>
            </div>

            {/* Weekly Check-in */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold mb-4">Weekly Check-in</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">Current Weight</label>
                  <input
                    type="number"
                    className="w-full md:w-64 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter weight"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">How do you feel?</label>
                  <textarea
                    rows="3"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Share your thoughts, challenges, or achievements..."
                  />
                </div>
                <button className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-sm transition">
                  Submit Check-in
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-800/40">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Need to adjust your plan?</h3>
            <p className="text-sm text-slate-400">Update your profile or regenerate with new preferences</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate("/profile")}
              className="px-6 py-3 rounded-lg border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800 transition"
            >
              Edit Profile
            </button>
            <button 
              onClick={handleRegeneratePlan}
              disabled={isRegenerating}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-semibold text-sm transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Regenerating...
                </span>
              ) : 'Regenerate Plan'}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleCloseImageModal}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseImageModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image content */}
            {imageLoading || (currentImage && !imageActuallyLoaded) ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-400 text-sm animate-pulse">
                  {imageLoading ? 'Generating image...' : 'Loading image...'}
                </p>
              </div>
            ) : null}
            {currentImage && (
              <div className={imageActuallyLoaded ? 'block' : 'hidden'}>
                <img 
                  src={currentImage.url} 
                  alt={currentImage.alt}
                  className="w-full h-auto max-h-[70vh] object-contain bg-slate-950"
                  onLoad={() => setImageActuallyLoaded(true)}
                  onError={() => {
                    setImageActuallyLoaded(true);
                    console.error('Failed to load image from URL');
                  }}
                />
                <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-1 capitalize">{currentImage.alt}</h3>
                  {currentImage.photographer && (
                    <p className="text-sm text-slate-400">
                      {currentImage.photographer}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
