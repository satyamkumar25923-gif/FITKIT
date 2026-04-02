import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Workout, Intensity } from "../types";
import { Dumbbell, Clock, Zap, Save, Loader2, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface WorkoutLogProps {
  user: User;
}

export function WorkoutLog({ user }: WorkoutLogProps) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [workout, setWorkout] = useState<Workout>({
    uid: user.uid,
    date: new Date().toISOString().split("T")[0],
    type: "Strength Training",
    duration: 60,
    intensity: "medium",
  });

  useEffect(() => {
    const fetchTodayWorkout = async () => {
      const today = new Date().toISOString().split("T")[0];
      const workoutRef = doc(db, "users", user.uid, "workouts", today);
      const docSnap = await getDoc(workoutRef);
      if (docSnap.exists()) {
        setWorkout(docSnap.data() as Workout);
      }
    };
    fetchTodayWorkout();
  }, [user.uid]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid, "workouts", workout.date), workout);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/workouts/${workout.date}`);
    } finally {
      setLoading(false);
    }
  };

  const workoutTypes = ["Strength Training", "Cardio", "Yoga", "Sports", "HIIT", "Rest Day"];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black italic tracking-tighter text-orange-500 uppercase">
          Workout Log
        </h1>
        <p className="text-zinc-500 text-sm">Log your activity to adjust your diet.</p>
      </div>

      <div className="space-y-6">
        {/* Workout Type */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center gap-2">
            <Dumbbell className="w-4 h-4" /> Workout Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {workoutTypes.map((type) => (
              <button
                key={type}
                onClick={() => setWorkout({ ...workout, type })}
                className={`p-4 rounded-2xl border text-sm font-bold transition-all ${
                  workout.type === type ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4" /> Duration (mins)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="180"
              step="15"
              value={workout.duration}
              onChange={(e) => setWorkout({ ...workout, duration: Number(e.target.value) })}
              className="flex-1 accent-orange-500 h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-2xl font-black italic text-white w-16">{workout.duration}</span>
          </div>
        </div>

        {/* Intensity */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4" /> Intensity
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["low", "medium", "high"] as Intensity[]).map((intensity) => (
              <button
                key={intensity}
                onClick={() => setWorkout({ ...workout, intensity })}
                className={`p-4 rounded-2xl border text-xs font-bold uppercase italic tracking-tighter transition-all ${
                  workout.intensity === intensity ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                }`}
              >
                {intensity}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-5 rounded-3xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-2 transition-all ${
            saved ? "bg-green-500 text-white" : "bg-white text-black hover:bg-orange-500 hover:text-white"
          } disabled:opacity-50`}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : saved ? (
            <>
              <CheckCircle className="w-6 h-6" /> Logged!
            </>
          ) : (
            <>
              <Save className="w-6 h-6" /> Save Workout
            </>
          )}
        </button>
      </div>
    </div>
  );
}
