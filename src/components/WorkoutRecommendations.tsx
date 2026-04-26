import { useState, useEffect } from "react";
import { UserProfile, WorkoutRecommendation, Workout } from "../types";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, limit, getDocs, orderBy } from "firebase/firestore";
import { Dumbbell, Clock, Zap, ChevronRight, AlertCircle, Info } from "lucide-react";
import { motion } from "motion/react";
import { LoadingCircle } from "./LoadingCircle";

interface WorkoutRecommendationsProps {
  profile: UserProfile;
}

const fallbackRecommendation: WorkoutRecommendation = {
  title: "Full Body Foundation",
  duration: 45,
  intensity: "medium",
  exercises: [
    {
      name: "Goblet Squat",
      sets: 4,
      reps: "10-12",
      rest: 75,
      instructions: "Keep chest up, core tight, and lower until thighs are parallel.",
    },
    {
      name: "Push-Ups",
      sets: 4,
      reps: "8-15",
      rest: 60,
      instructions: "Maintain a straight body line and control both down and up phases.",
    },
    {
      name: "Dumbbell Row",
      sets: 4,
      reps: "10 each side",
      rest: 75,
      instructions: "Pull elbow to hip while keeping shoulders square and back neutral.",
    },
    {
      name: "Romanian Deadlift",
      sets: 3,
      reps: "10-12",
      rest: 90,
      instructions: "Hinge at hips, keep dumbbells close to legs, and avoid rounding your back.",
    },
    {
      name: "Overhead Press",
      sets: 3,
      reps: "8-10",
      rest: 75,
      instructions: "Brace core and press overhead in a controlled vertical path.",
    },
    {
      name: "Plank",
      sets: 3,
      reps: "40-60 sec",
      rest: 45,
      instructions: "Keep hips level and squeeze glutes to protect lower back.",
    },
  ],
  coachingTip: "Progress slowly: add 1-2 reps or a small weight increase each week with clean form.",
};

export function WorkoutRecommendations({ profile }: WorkoutRecommendationsProps) {
  const [recommendation, setRecommendation] = useState<WorkoutRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      setLoading(true);
      try {
        // Fetch recent workouts for context
        const q = query(
          collection(db, "users", profile.uid, "workouts"),
          orderBy("date", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        const history = snap.docs.map(d => d.data() as Workout);

        const response = await fetch("/api/workout-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: profile, history }),
        });
        if (!response.ok) {
          throw new Error(`Workout API failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.exercises) || data.exercises.length === 0) {
          throw new Error("Workout API returned invalid data");
        }

        setRecommendation(data as WorkoutRecommendation);
      } catch (error) {
        console.error("Failed to fetch workout recommendations:", error);
        setRecommendation(fallbackRecommendation);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <LoadingCircle size="lg" />
        <p className="text-zinc-500 animate-pulse uppercase italic font-black tracking-tighter">Designing your session...</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-zinc-700" />
        <p className="text-zinc-500 text-xs uppercase font-bold">Failed to load workout</p>
      </div>
    );
  }

  const muscleWiseGymExercises: { muscle: string; exercises: string[] }[] = [
    {
      muscle: "Chest",
      exercises: [
        "Barbell Bench Press",
        "Incline Dumbbell Press",
        "Chest Fly Machine",
        "Push-Ups",
        "Cable Crossover",
        "Decline Bench Press",
      ],
    },
    {
      muscle: "Back",
      exercises: [
        "Deadlift",
        "Lat Pulldown",
        "Bent-Over Row",
        "Seated Cable Row",
        "Pull-Ups",
        "Single-Arm Dumbbell Row",
      ],
    },
    {
      muscle: "Shoulders",
      exercises: [
        "Overhead Press",
        "Lateral Raises",
        "Front Raises",
        "Rear Delt Fly",
        "Arnold Press",
        "Upright Row",
      ],
    },
    {
      muscle: "Legs",
      exercises: [
        "Barbell Squat",
        "Leg Press",
        "Romanian Deadlift",
        "Walking Lunges",
        "Leg Extension",
        "Leg Curl",
      ],
    },
    {
      muscle: "Arms",
      exercises: [
        "Barbell Bicep Curl",
        "Hammer Curl",
        "Tricep Pushdown",
        "Overhead Tricep Extension",
        "Close-Grip Bench Press",
        "Preacher Curl",
      ],
    },
    {
      muscle: "Core",
      exercises: [
        "Plank",
        "Hanging Leg Raise",
        "Cable Crunch",
        "Russian Twist",
        "Ab Wheel Rollout",
        "Mountain Climbers",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Today's Session</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-500">
            <Clock className="w-3 h-3" /> {recommendation.duration} MIN
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-orange-500">
            <Zap className="w-3 h-3" /> {recommendation.intensity} INTENSITY
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {recommendation.exercises.map((ex, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-3"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-black italic uppercase text-lg text-white">{ex.name}</h3>
              <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {ex.sets} Sets × {ex.reps}
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">{ex.instructions}</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-orange-500/50 uppercase tracking-widest pt-2 border-t border-zinc-800/50">
              Rest: {ex.rest}s
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 bg-orange-500/10 rounded-3xl border border-orange-500/20 space-y-2">
        <div className="flex items-center gap-2 text-orange-500">
          <Info className="w-4 h-4" />
          <h4 className="text-[10px] font-black uppercase tracking-widest">Coach's Tip</h4>
        </div>
        <p className="text-sm italic font-medium text-orange-200 leading-tight">"{recommendation.coachingTip}"</p>
      </div>

      <button className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 uppercase italic tracking-tighter hover:bg-orange-500 hover:text-white transition-all">
        Start Workout <ChevronRight className="w-5 h-5" />
      </button>

      <div className="space-y-3 pt-2">
        <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Gym Exercise Library</h3>
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest">5-6 exercises for every muscle section</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {muscleWiseGymExercises.map((section) => (
          <div key={section.muscle} className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-3">
            <h4 className="text-sm font-black italic uppercase tracking-wider text-orange-500">{section.muscle}</h4>
            <ul className="space-y-2">
              {section.exercises.map((exercise) => (
                <li key={exercise} className="text-xs text-zinc-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {exercise}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
