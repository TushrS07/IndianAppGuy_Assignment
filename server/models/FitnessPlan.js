import mongoose from "mongoose";

const fitnessPlanSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: false, // Optional for guest users
      lowercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for guest users
    },
    profileData: {
      name: String,
      age: Number,
      gender: String,
      height: Number,
      heightFeet: Number,
      heightInches: Number,
      heightUnit: String,
      weight: Number,
      weightUnit: String,
      fitnessGoal: String,
      fitnessLevel: String,
      workoutLocation: String,
      dietaryPreference: String,
      medicalHistory: String,
      stressLevel: String,
      activityLevel: String,
      smokingStatus: String,
      alcoholConsumption: String,
      availableTime: String,
    },
    plan: {
      overview: {
        planDuration: String,
        targetGoal: String,
        calorieTarget: String,
        proteinTarget: String,
        workoutFrequency: String,
        restDays: String,
      },
      weeklySchedule: mongoose.Schema.Types.Mixed,
      nutritionPlan: mongoose.Schema.Types.Mixed,
      progressMetrics: mongoose.Schema.Types.Mixed,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const FitnessPlan = mongoose.model("FitnessPlan", fitnessPlanSchema);

export default FitnessPlan;
