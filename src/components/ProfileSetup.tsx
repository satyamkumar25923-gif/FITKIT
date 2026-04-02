import { useState } from "react";
import { User } from "firebase/auth";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { UserProfile, Goal, ActivityLevel } from "../types";
import { Target, Weight, Ruler, User as UserIcon, ChevronRight, Loader2, IndianRupee, Zap } from "lucide-react";
import { motion } from "motion/react";

interface ProfileSetupProps {
  user: User;
  existingProfile?: UserProfile;
  onComplete: () => void;
}

export function ProfileSetup({ user, existingProfile, onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(
    existingProfile || {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      goal: "maintenance",
      metabolism: "balanced",
      weight: 70,
      height: 175,
      age: 20,
      gender: "male",
      activityLevel: "moderate",
      messRealityMode: true,
      budget: 50,
      availableEquipment: ["bodyweight"],
    }
  );

  const goals: { id: Goal; label: string; desc: string }[] = [
    { id: "bulking", label: "Muscle Gain", desc: "Build strength and size" },
    { id: "cutting", label: "Fat Loss", desc: "Get lean and shredded" },
    { id: "maintenance", label: "Maintenance", desc: "Stay fit and healthy" },
  ];

  const metabolisms: { id: UserProfile["metabolism"]; label: string; desc: string }[] = [
    { id: "high", label: "High", desc: "I lose weight easily" },
    { id: "balanced", label: "Balanced", desc: "Stable weight" },
    { id: "slow", label: "Slow", desc: "I gain weight easily" },
  ];

  const equipmentOptions: { id: any; label: string; desc: string }[] = [
    { id: "bodyweight", label: "Bodyweight", desc: "No equipment needed" },
    { id: "dumbbells", label: "Dumbbells", desc: "Pair of dumbbells" },
    { id: "resistance_bands", label: "Bands", desc: "Resistance bands" },
    { id: "pull_up_bar", label: "Pull-up Bar", desc: "Doorway or park bar" },
    { id: "full_gym", label: "Full Gym", desc: "Access to a gym" },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Calculate basic targets (simplified)
      const bmr = 10 * profile.weight! + 6.25 * profile.height! - 5 * profile.age! + 5;
      let multiplier = 1.2;
      if (profile.activityLevel === "moderate") multiplier = 1.55;
      if (profile.activityLevel === "active") multiplier = 1.725;
      
      const tdee = bmr * multiplier;
      let calorieTarget = tdee;

      // Adjust based on goal
      if (profile.goal === "bulking") calorieTarget += 300;
      if (profile.goal === "cutting") calorieTarget -= 500;

      // Adjust based on metabolism
      if (profile.metabolism === "high") calorieTarget += 200;
      if (profile.metabolism === "slow") calorieTarget -= 200;

      const proteinTarget = profile.weight! * (profile.goal === "bulking" ? 2 : 1.6);

      const updatedProfile = {
        ...profile,
        dailyCalorieTarget: Math.round(calorieTarget),
        dailyProteinTarget: Math.round(proteinTarget),
      };

      await setDoc(doc(db, "users", user.uid), updatedProfile);
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-orange-500 uppercase">
            {existingProfile ? "Update Profile" : "Setup FitKit"}
          </h1>
          <p className="text-zinc-500 text-sm">Step {step} of 5</p>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase tracking-tight">
              <Target className="w-5 h-5 text-orange-500" /> Choose your goal
            </h2>
            <div className="space-y-3">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setProfile({ ...profile, goal: g.id })}
                  className={`w-full p-5 rounded-3xl border text-left transition-all duration-300 ${
                    profile.goal === g.id ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <h3 className="font-black italic uppercase text-lg">{g.label}</h3>
                  <p className={`text-xs ${profile.goal === g.id ? "text-orange-100" : "text-zinc-500"}`}>{g.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={nextStep} className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 uppercase italic tracking-tighter">
              Next <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase tracking-tight">
              <Zap className="w-5 h-5 text-orange-500" /> Metabolism Type
            </h2>
            <div className="space-y-3">
              {metabolisms.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setProfile({ ...profile, metabolism: m.id })}
                  className={`w-full p-5 rounded-3xl border text-left transition-all duration-300 ${
                    profile.metabolism === m.id ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <h3 className="font-black italic uppercase text-lg">{m.label}</h3>
                  <p className={`text-xs ${profile.metabolism === m.id ? "text-orange-100" : "text-zinc-500"}`}>{m.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-zinc-900 text-white font-bold rounded-2xl uppercase italic tracking-tighter">Back</button>
              <button onClick={nextStep} className="flex-1 py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 uppercase italic tracking-tighter">Next</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase tracking-tight">
              <Weight className="w-5 h-5 text-orange-500" /> Body Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Weight (kg)" value={profile.weight} onChange={(v) => setProfile({ ...profile, weight: Number(v) })} icon={Weight} />
              <InputGroup label="Height (cm)" value={profile.height} onChange={(v) => setProfile({ ...profile, height: Number(v) })} icon={Ruler} />
              <InputGroup label="Age" value={profile.age} onChange={(v) => setProfile({ ...profile, age: Number(v) })} icon={UserIcon} />
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                  className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-zinc-900 text-white font-bold rounded-2xl uppercase italic tracking-tighter">Back</button>
              <button onClick={nextStep} className="flex-1 py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 uppercase italic tracking-tighter">Next</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase tracking-tight">
              <IndianRupee className="w-5 h-5 text-orange-500" /> Hostel Reality
            </h2>
            <div className="space-y-6">
              <div className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold uppercase tracking-tight">Mess Reality Mode</label>
                  <button
                    onClick={() => setProfile({ ...profile, messRealityMode: !profile.messRealityMode })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${profile.messRealityMode ? "bg-orange-500" : "bg-zinc-800"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile.messRealityMode ? "left-7" : "left-1"}`} />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 italic">Adjusts nutrition for oily food and inconsistent portions.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Daily Add-on Budget (₹)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 200].map((b) => (
                    <button
                      key={b}
                      onClick={() => setProfile({ ...profile, budget: b })}
                      className={`py-3 rounded-xl border font-bold ${profile.budget === b ? "bg-orange-500 border-orange-500" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}
                    >
                      ₹{b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-zinc-900 text-white font-bold rounded-2xl uppercase italic tracking-tighter">Back</button>
              <button onClick={nextStep} className="flex-1 py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 uppercase italic tracking-tighter">Next</button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase tracking-tight">
              <Target className="w-5 h-5 text-orange-500" /> Equipment
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {equipmentOptions.map((e) => {
                const isSelected = profile.availableEquipment?.includes(e.id);
                return (
                  <button
                    key={e.id}
                    onClick={() => {
                      const current = profile.availableEquipment || [];
                      if (isSelected) {
                        setProfile({ ...profile, availableEquipment: current.filter((id) => id !== e.id) });
                      } else {
                        setProfile({ ...profile, availableEquipment: [...current, e.id] });
                      }
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      isSelected ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <h3 className="font-bold uppercase italic text-sm">{e.label}</h3>
                    <p className={`text-[10px] ${isSelected ? "text-orange-100" : "text-zinc-500"}`}>{e.desc}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-zinc-900 text-white font-bold rounded-2xl uppercase italic tracking-tighter">Back</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase italic tracking-tighter disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Finish"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, icon: Icon }: { label: string; value: any; onChange: (v: string) => void; icon: any }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>
  );
}
