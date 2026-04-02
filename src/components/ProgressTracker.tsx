import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Progress } from "../types";
import { TrendingUp, Weight, Zap, Save, Loader2, CheckCircle, Trophy } from "lucide-react";
import { motion } from "motion/react";

interface ProgressTrackerProps {
  user: User;
}

export function ProgressTracker({ user }: ProgressTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<Progress[]>([]);
  const [progress, setProgress] = useState<Progress>({
    uid: user.uid,
    date: new Date().toISOString().split("T")[0],
    weight: 70,
    strengthScore: 50,
    consistencyScore: 0,
  });

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(
        collection(db, "users", user.uid, "progress"),
        orderBy("date", "desc"),
        limit(7)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => doc.data() as Progress);
      setHistory(data);
      if (data.length > 0 && data[0].date === progress.date) {
        setProgress(data[0]);
      }
    };
    fetchHistory();
  }, [user.uid, progress.date]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid, "progress", progress.date), progress);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/progress/${progress.date}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black italic tracking-tighter text-orange-500 uppercase">
          Progress
        </h1>
        <p className="text-zinc-500 text-sm">Track your gains and stay consistent.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-4">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center gap-2">
            <Weight className="w-4 h-4" /> Current Weight
          </label>
          <div className="flex items-end gap-2">
            <input
              type="number"
              value={progress.weight}
              onChange={(e) => setProgress({ ...progress, weight: Number(e.target.value) })}
              className="w-full bg-transparent text-4xl font-black italic text-white focus:outline-none"
            />
            <span className="text-sm font-bold text-zinc-500 mb-1">kg</span>
          </div>
        </div>

        <div className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-4">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" /> Strength (1-100)
          </label>
          <div className="flex items-end gap-2">
            <input
              type="number"
              value={progress.strengthScore}
              onChange={(e) => setProgress({ ...progress, strengthScore: Number(e.target.value) })}
              className="w-full bg-transparent text-4xl font-black italic text-white focus:outline-none"
            />
            <Trophy className="w-5 h-5 text-zinc-500 mb-2" />
          </div>
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
            <CheckCircle className="w-6 h-6" /> Updated!
          </>
        ) : (
          <>
            <Save className="w-6 h-6" /> Save Progress
          </>
        )}
      </button>

      {/* History List */}
      <div className="space-y-4">
        <h2 className="text-xl font-black tracking-tight italic uppercase">Recent History</h2>
        <div className="space-y-2">
          {history.map((h, i) => (
            <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-500">{new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <div className="flex gap-4">
                <span className="text-sm font-black italic text-white">{h.weight}kg</span>
                <span className="text-sm font-black italic text-orange-500">{h.strengthScore} pts</span>
              </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-center text-zinc-500 text-sm italic py-4">No history yet. Start logging!</p>}
        </div>
      </div>
    </div>
  );
}
