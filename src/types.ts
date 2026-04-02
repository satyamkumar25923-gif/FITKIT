export type Goal = "bulking" | "cutting" | "maintenance";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Intensity = "low" | "medium" | "high";
export type Metabolism = "high" | "slow" | "balanced";
export type Equipment = "bodyweight" | "dumbbells" | "resistance_bands" | "full_gym" | "pull_up_bar";

export interface UserProfile {
  uid: string;
  name?: string;
  email?: string;
  goal: Goal;
  metabolism: Metabolism;
  weight?: number;
  height?: number;
  age?: number;
  gender?: "male" | "female" | "other";
  activityLevel?: ActivityLevel;
  dailyCalorieTarget?: number;
  dailyProteinTarget?: number;
  dailyCarbTarget?: number;
  dailyFatTarget?: number;
  messRealityMode?: boolean;
  budget?: number;
  availableEquipment?: Equipment[];
}

export interface DailyMeals {
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface MessSchedule {
  uid: string;
  schedule: {
    monday: DailyMeals;
    tuesday: DailyMeals;
    wednesday: DailyMeals;
    thursday: DailyMeals;
    friday: DailyMeals;
    saturday: DailyMeals;
    sunday: DailyMeals;
  };
}

export interface Workout {
  uid: string;
  date: string;
  type: string;
  duration: number;
  intensity: Intensity;
}

export interface Progress {
  uid: string;
  date: string;
  weight?: number;
  strengthScore?: number;
  consistencyScore?: number;
}

export interface Recommendation {
  dailyPlan: {
    breakfast: { mess: string; supplement: string; advice: string };
    lunch: { mess: string; supplement: string; advice: string };
    dinner: { mess: string; supplement: string; advice: string };
  };
  macros: { calories: number; protein: number; carbs: number; fats: number };
  gap: { protein: number; calories: number };
  lazyTip: string;
}

export interface WorkoutRecommendation {
  title: string;
  duration: number;
  intensity: Intensity;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    rest: number;
    instructions: string;
  }[];
  coachingTip: string;
}
