/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { UserProfile, MessSchedule, Workout, Progress, Recommendation } from "./types";
import { Dashboard } from "./components/Dashboard";
import { ProfileSetup } from "./components/ProfileSetup";
import { MessScheduleInput } from "./components/MessScheduleInput";
import { AICoach } from "./components/AICoach";
import { ProgressTracker } from "./components/ProgressTracker";
import { WorkoutLog } from "./components/WorkoutLog";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { WorkoutRecommendations } from "./components/WorkoutRecommendations";
import { Loader2 } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [schedule, setSchedule] = useState<MessSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch profile
        const profileRef = doc(db, "users", firebaseUser.uid);
        const unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setProfileLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setProfileLoading(false);
        });

        // Fetch schedule
        const scheduleRef = doc(db, "users", firebaseUser.uid, "schedules", "weekly");
        const unsubSchedule = onSnapshot(scheduleRef, (docSnap) => {
          if (docSnap.exists()) {
            setSchedule(docSnap.data() as MessSchedule);
          } else {
            setSchedule(null);
          }
          setScheduleLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}/schedules/weekly`);
          setScheduleLoading(false);
        });

        return () => {
          unsubProfile();
          unsubSchedule();
        };
      } else {
        setProfile(null);
        setSchedule(null);
        setProfileLoading(false);
        setScheduleLoading(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading || (user && (profileLoading || scheduleLoading))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-zinc-500 text-xs uppercase tracking-widest animate-pulse">Syncing your fitness data...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {!user ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6">
          <div className="max-w-md w-full space-y-8 text-center">
            <h1 className="text-6xl font-black tracking-tighter text-orange-500 italic">FITKIT</h1>
            <p className="text-zinc-400 text-lg">AI-powered diet & fitness for hostel students.</p>
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      ) : !profile ? (
        <ProfileSetup user={user} onComplete={() => setActiveTab("dashboard")} />
      ) : !schedule ? (
        <MessScheduleInput user={user} onComplete={() => setActiveTab("dashboard")} />
      ) : (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
          {activeTab === "dashboard" && <Dashboard profile={profile} schedule={schedule} />}
          {activeTab === "schedule" && <MessScheduleInput user={user} existingSchedule={schedule} onComplete={() => setActiveTab("dashboard")} />}
          {activeTab === "coach" && <AICoach profile={profile} />}
          {activeTab === "progress" && <ProgressTracker user={user} />}
          {activeTab === "workout" && <WorkoutRecommendations profile={profile} />}
          {activeTab === "profile" && <ProfileSetup user={user} existingProfile={profile} onComplete={() => setActiveTab("dashboard")} />}
        </Layout>
      )}
    </ErrorBoundary>
  );
}
