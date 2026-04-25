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
        const data = await response.json();
        setRecommendation(data);
      } catch (error) {
        console.error("Failed to fetch workout recommendations:", error);
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
    </div>
  );
}
