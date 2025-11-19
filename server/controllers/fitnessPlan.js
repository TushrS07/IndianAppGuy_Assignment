import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
import FitnessPlan from "../models/FitnessPlan.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Image generation using Pollinations AI (free, no API key needed)
const generateImageUrl = (prompt, width = 1024, height = 768) => {
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=flux&nologo=true&enhance=true&seed=${seed}`;
};

// ----------------------------
// GENERATE MOTIVATIONAL QUOTE
// ----------------------------
export const generateQuote = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Generate a short, powerful, and motivational fitness quote (maximum 20 words).
    The quote should inspire people to workout, stay healthy, and achieve their fitness goals.
    Return ONLY the quote text without quotation marks or author name.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const quote = response.text().trim();

    return res.status(200).json({
      success: true,
      quote,
      author: "AI Fitness Coach",
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate motivational quote. Please try again.",
    });
  }
};


// ----------------------------
// GENERATE FITNESS PLAN (Protected/Optional Auth)
// ----------------------------

export const generatePlan = async (req, res) => {
  try {
    const profileData = req.body;
    const user = req.user; // optional

    if (!profileData.name || !profileData.age || !profileData.fitnessGoal) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, age, fitnessGoal",
      });
    }

    if (!profileData.weight || !profileData.height) {
      return res.status(400).json({
        success: false,
        message: "Weight and height are required for plan generation.",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `You are an expert fitness coach and nutritionist. Create a comprehensive 12-week personalized fitness plan for the following person:

**Profile:**
- Name: ${profileData.name}
- Age: ${profileData.age}
- Gender: ${profileData.gender || "Not specified"}
- Height: ${profileData.height || profileData.heightFeet} ${profileData.heightUnit || "cm"}
- Weight: ${profileData.weight} ${profileData.weightUnit || "kg"}
- Fitness Goal: ${profileData.fitnessGoal}
- Current Fitness Level: ${profileData.fitnessLevel || "Intermediate"}
- Workout Location: ${profileData.workoutLocation || "Gym"}
- Dietary Preference: ${profileData.dietaryPreference || "No preference"}
- Available Time: ${profileData.availableTime || "45-60 minutes per day"}
- Activity Level: ${profileData.activityLevel || "Moderate"}
${profileData.medicalHistory ? `- Medical History: ${profileData.medicalHistory}` : ""}
${profileData.allergies ? `- Allergies: ${profileData.allergies}` : ""}
${profileData.stressLevel ? `- Stress Level: ${profileData.stressLevel}` : ""}

**IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. The response must be parseable JSON.**

Generate a fitness plan in the following EXACT JSON format:
{
  "overview": {
    "planDuration": "12 Weeks",
    "targetGoal": "${profileData.fitnessGoal}",
    "calorieTarget": "XXXX kcal/day (calculate based on profile)",
    "proteinTarget": "XXXg/day (calculate based on weight and goal)",
    "workoutFrequency": "X days/week",
    "restDays": "X days/week"
  },
  "weeklySchedule": {
    "monday": {
      "focus": "Training focus",
      "duration": "XX-XX min",
      "intensity": "High/Moderate/Low",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 4,
          "reps": "8-10",
          "rest": "90s"
        }
      ]
    },
    "tuesday": { ... },
    "wednesday": { ... },
    "thursday": { ... },
    "friday": { ... },
    "saturday": { ... },
    "sunday": { "focus": "Rest or Active Recovery" }
  },
  "nutritionPlan": {
    "meals": [
      {
        "time": "7:00 AM",
        "name": "Breakfast",
        "items": ["Food item 1", "Food item 2"],
        "calories": 450,
        "protein": "25g",
        "carbs": "45g",
        "fats": "18g"
      }
    ],
    "hydration": "3-4 liters daily",
    "supplements": ["Supplement 1", "Supplement 2"]
  },
  "progressMetrics": [
    {
      "metric": "Metric name",
      "value": "Current value",
      "target": "Target value"
    }
  ],
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ]
}

Create 6 meals (breakfast, mid-morning snack, lunch, pre-workout, dinner, evening snack).
Create detailed exercises for each day with sets, reps, and rest periods.
Adapt the nutrition based on dietary preference: ${profileData.dietaryPreference}.
Consider medical conditions if mentioned.`;

    console.log("Generating fitness plan for:", user ? user.email : "Guest user");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedText = response.text().trim();

    // Clean up response - remove markdown code blocks if present
    generatedText = generatedText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let aiPlan;
    try {
      aiPlan = JSON.parse(generatedText);
      console.log("Generated AI Plan JSON parsed successfully.");
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Generated Text:", generatedText.substring(0, 500));

      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response. Please try again.",
      });
    }

    const fitnessPlan = await FitnessPlan.create({
      userId: user?._id || null,
      userEmail: user?.email || profileData.email || null,
      profileData,
      plan: aiPlan,
      isActive: true,
    });

    if (user) {
      await User.findByIdAndUpdate(user._id, { profileData });
    }

    return res.status(200).json({
      success: true,
      message: "Fitness plan generated successfully.",
      plan: aiPlan,
      planId: fitnessPlan._id,
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate fitness plan. Please try again.",
    });
  }
};

// ----------------------------
// GET USER'S FITNESS PLANS (Protected Route)
// ----------------------------

export const getUserPlans = async (req, res) => {
  try {
    // User is already authenticated via middleware
    const plans = await FitnessPlan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans: plans,
    });
  } catch (error) {
    console.error("Error fetching user plans:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch fitness plans.",
    });
  }
};

// ----------------------------
// GET SINGLE PLAN (Protected Route)
// ----------------------------

export const getPlanById = async (req, res) => {
  try {
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required.",
      });
    }

    const plan = await FitnessPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Fitness plan not found.",
      });
    }

    // Check if user owns this plan
    if (req.user && plan.userId && plan.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this plan.",
      });
    }

    return res.status(200).json({
      success: true,
      plan: plan,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch fitness plan.",
    });
  }
};

// ----------------------------
// DELETE PLAN (Protected Route)
// ----------------------------

export const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required.",
      });
    }

    const plan = await FitnessPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Fitness plan not found.",
      });
    }

    // Check if user owns this plan
    if (plan.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this plan.",
      });
    }

    await FitnessPlan.findByIdAndDelete(planId);

    return res.status(200).json({
      success: true,
      message: "Fitness plan deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete fitness plan.",
    });
  }
};

// ----------------------------
// GENERATE IMAGE (Optional Auth)
// ----------------------------

export const generateImage = async (req, res) => {
  try {
    // Debug logging
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { query, type } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required for image generation.",
        debug: {
          bodyReceived: req.body,
          contentType: req.headers['content-type']
        }
      });
    }

    // Create enhanced prompt based on type
    const prompt = type === 'exercise' 
      ? `professional fitness photography of ${query} exercise demonstration, high quality, gym setting, athletic person performing the exercise correctly, detailed form, proper technique`
      : `professional food photography of ${query}, appetizing, high quality, restaurant style plating, delicious presentation, vibrant colors`;

    // Generate image URL using Pollinations AI (Flux model)
    const imageUrl = generateImageUrl(prompt, 1024, 768);

    console.log(`Generated image URL for ${type}: ${query}`);

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      query: query,
      type: type,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate image. Please try again.",
    });
  }
};
