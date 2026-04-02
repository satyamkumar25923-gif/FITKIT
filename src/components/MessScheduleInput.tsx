import React, { useState, useRef } from "react";
import { User } from "firebase/auth";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { MessSchedule, DailyMeals } from "../types";
import { Calendar, Coffee, Utensils, Moon, Save, Loader2, ChevronLeft, ChevronRight, Camera, Upload, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface MessScheduleInputProps {
  user: User;
  existingSchedule?: MessSchedule;
  onComplete: () => void;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const COMMON_MEALS = {
  breakfast: ["Poha", "Aloo Paratha", "Bread Omelette", "Idli Sambhar", "Dosa", "Upma", "Puri Sabzi", "Oats"],
  lunch: ["Rice, Dal, Roti, Sabzi", "Rajma Chawal", "Chole Bhature", "Paneer, Roti, Rice", "Egg Curry, Rice", "Veg Biryani", "Kadhi Chawal"],
  dinner: ["Roti, Sabzi, Dal", "Chicken Curry, Roti", "Paneer, Roti", "Mixed Veg, Roti", "Dal Makhani, Rice", "Khichdi", "Soya Chunks Curry, Roti"],
};

export function MessScheduleInput({ user, existingSchedule, onComplete }: MessScheduleInputProps) {
  const [currentDayIdx, setCurrentDayIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [schedule, setSchedule] = useState<MessSchedule>(
    existingSchedule || {
      uid: user.uid,
      schedule: {
        monday: { breakfast: "", lunch: "", dinner: "" },
        tuesday: { breakfast: "", lunch: "", dinner: "" },
        wednesday: { breakfast: "", lunch: "", dinner: "" },
        thursday: { breakfast: "", lunch: "", dinner: "" },
        friday: { breakfast: "", lunch: "", dinner: "" },
        saturday: { breakfast: "", lunch: "", dinner: "" },
        sunday: { breakfast: "", lunch: "", dinner: "" },
      },
    }
  );

  const currentDay = DAYS[currentDayIdx];
  const currentMeals = schedule.schedule[currentDay as keyof typeof schedule.schedule] || { breakfast: "", lunch: "", dinner: "" };

  const updateMeal = (mealType: keyof DailyMeals, value: string) => {
    setSchedule({
      ...schedule,
      schedule: {
        ...schedule.schedule,
        [currentDay]: { ...currentMeals, [mealType]: value },
      },
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const response = await fetch("/api/analyze-schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Failed to analyze image";
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.schedule) {
          setSchedule({ ...schedule, schedule: data.schedule });
        }
      } catch (error: any) {
        console.error("Failed to analyze image:", error);
        alert(`Failed to analyze image: ${error.message}. Please try a smaller or clearer photo.`);
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid, "schedules", "weekly"), schedule);
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/schedules/weekly`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-orange-500 uppercase">
            Mess Schedule
          </h1>
          <p className="text-zinc-500 text-sm">Input your weekly mess menu.</p>
        </div>

        {/* AI Upload Section */}
        <div className="p-6 bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-800 flex flex-col items-center text-center space-y-4 hover:border-orange-500/50 transition-all">
          <div className="p-4 bg-orange-500/10 rounded-full">
            {analyzing ? <Loader2 className="w-8 h-8 text-orange-500 animate-spin" /> : <Camera className="w-8 h-8 text-orange-500" />}
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm uppercase tracking-tight">AI Scan Menu</h3>
            <p className="text-[10px] text-zinc-500">Upload a photo of your mess menu and let AI do the work.</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className="px-6 py-2 bg-white text-black text-xs font-black rounded-full uppercase italic tracking-tighter flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : <><Upload className="w-3 h-3" /> Upload Photo</>}
          </button>
        </div>

        <div className="flex items-center gap-2 text-zinc-700">
          <div className="flex-1 h-[1px] bg-zinc-900" />
          <span className="text-[10px] font-bold uppercase tracking-widest">or manual entry</span>
          <div className="flex-1 h-[1px] bg-zinc-900" />
        </div>

        {/* Day Selector */}
        <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setCurrentDayIdx((prev) => (prev > 0 ? prev - 1 : 6))}
            className="p-2 text-zinc-500 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-black italic uppercase tracking-widest text-orange-500">{currentDay}</span>
          <button
            onClick={() => setCurrentDayIdx((prev) => (prev < 6 ? prev + 1 : 0))}
            className="p-2 text-zinc-500 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Inputs */}
        <div className="space-y-6">
          <MealInput
            icon={Coffee}
            label="Breakfast"
            value={currentMeals.breakfast}
            options={COMMON_MEALS.breakfast}
            onChange={(v) => updateMeal("breakfast", v)}
            color="text-yellow-500"
          />
          <MealInput
            icon={Utensils}
            label="Lunch"
            value={currentMeals.lunch}
            options={COMMON_MEALS.lunch}
            onChange={(v) => updateMeal("lunch", v)}
            color="text-green-500"
          />
          <MealInput
            icon={Moon}
            label="Dinner"
            value={currentMeals.dinner}
            options={COMMON_MEALS.dinner}
            onChange={(v) => updateMeal("dinner", v)}
            color="text-indigo-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase italic tracking-tighter disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Save className="w-5 h-5" /> Save Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MealInput({ icon: Icon, label, value, options, onChange, color }: { icon: any; label: string; value: string; options: string[]; onChange: (v: string) => void; color: string }) {
  const [custom, setCustom] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">{label}</label>
        </div>
        <button
          onClick={() => setCustom(!custom)}
          className="text-[10px] uppercase font-bold text-orange-500 hover:text-orange-400"
        >
          {custom ? "Select from list" : "Custom"}
        </button>
      </div>

      {custom ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}...`}
          className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-orange-500"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                value === opt ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
