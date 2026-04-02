import { useState, useEffect } from "react";
import { UserProfile, MessSchedule, Recommendation, Workout } from "../types";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Flame, Zap, Target, Coffee, Utensils, Moon, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  profile: UserProfile;
  schedule: MessSchedule;
}

export function Dashboard({ profile, schedule }: DashboardProps) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      
      // Fetch today's workout if exists
      const workoutRef = doc(db, "users", profile.uid, "workouts", today);
      const workoutSnap = await getDoc(workoutRef);
      const todayWorkout = workoutSnap.exists() ? (workoutSnap.data() as Workout) : null;
      setWorkout(todayWorkout);

      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: profile, schedule, workout: todayWorkout }),
        });
        const data = await response.json();
        setRecommendation(data);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [profile, schedule]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-zinc-500 animate-pulse">Calculating your optimal diet...</p>
      </div>
    );
  }

  if (!recommendation || !recommendation.macros || !recommendation.dailyPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-4 bg-zinc-900 rounded-full">
          <AlertCircle className="w-8 h-8 text-zinc-700" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold uppercase italic tracking-tight">No Recommendations Yet</h3>
          <p className="text-xs text-zinc-500 max-w-[200px]">We couldn't generate your diet plan. Try refreshing or checking your schedule.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white text-black text-xs font-black rounded-full uppercase italic tracking-tighter"
        >
          Retry
        </button>
      </div>
    );
  }

  const { dailyPlan, macros, gap, lazyTip } = recommendation;

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-zinc-900 rounded-3xl border border-zinc-800 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Calories</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black italic">{macros.calories}</h3>
            <p className="text-[10px] text-zinc-500">Target: {profile.dailyCalorieTarget || "N/A"}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-zinc-900 rounded-3xl border border-zinc-800 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Protein</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black italic">{macros.protein}g</h3>
            <p className="text-[10px] text-zinc-500">Target: {profile.dailyProteinTarget || "N/A"}g</p>
          </div>
        </motion.div>
      </div>

      {/* Gap Alert */}
      {gap.protein > 0 && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-xs text-orange-200 font-medium">
            You're missing <span className="font-bold">{gap.protein}g</span> of protein today. Check supplement suggestions!
          </p>
        </div>
      )}

      {/* Daily Plan */}
      <div className="space-y-4">
        <h2 className="text-xl font-black tracking-tight italic uppercase">Today's Plan</h2>
        
        <MealCard icon={Coffee} title="Breakfast" data={dailyPlan.breakfast} color="text-yellow-500" />
        <MealCard icon={Utensils} title="Lunch" data={dailyPlan.lunch} color="text-green-500" />
        <MealCard icon={Moon} title="Dinner" data={dailyPlan.dinner} color="text-indigo-500" />
      </div>

      {/* Lazy Tip */}
      <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap className="w-20 h-20 text-orange-500" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">Lazy Mode Tip</h3>
        <p className="text-lg font-medium italic leading-tight text-zinc-200">"{lazyTip}"</p>
      </div>
    </div>
  );
}

function MealCard({ icon: Icon, title, data, color }: { icon: any; title: string; data: any; color: string }) {
  return (
    <div className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2 items-start">
          <div className="w-1 h-1 rounded-full bg-zinc-700 mt-2 shrink-0" />
          <p className="text-sm text-zinc-300"><span className="text-zinc-500 font-medium">Mess:</span> {data.mess}</p>
        </div>
        {data.supplement && (
          <div className="flex gap-2 items-start">
            <div className="w-1 h-1 rounded-full bg-orange-500 mt-2 shrink-0" />
            <p className="text-sm text-orange-200"><span className="text-orange-500/50 font-medium">Add-on:</span> {data.supplement}</p>
          </div>
        )}
        <p className="text-xs text-zinc-500 italic mt-2 border-t border-zinc-800 pt-2">{data.advice}</p>
      </div>
    </div>
  );
}
