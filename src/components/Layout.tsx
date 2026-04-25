import { ReactNode } from "react";
import { LayoutDashboard, Calendar, MessageSquare, TrendingUp, Dumbbell, User, LogOut } from "lucide-react";
import { motion } from "motion/react";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export function Layout({ children, activeTab, setActiveTab, onLogout }: LayoutProps) {
  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Home" },
    { id: "schedule", icon: Calendar, label: "Mess" },
    { id: "workout", icon: Dumbbell, label: "Gym" },
    { id: "coach", icon: MessageSquare, label: "Coach" },
    { id: "progress", icon: TrendingUp, label: "Stats" },
    { id: "profile", icon: User, label: "Me" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-hidden">
      <div className="ambient-orb w-44 h-44 bg-orange-500/20 -top-12 -left-8" />
      <div className="ambient-orb w-52 h-52 bg-cyan-500/15 top-24 -right-16" style={{ animationDelay: "1.2s" }} />

      {/* Header */}
      <header className="p-4 border-b border-zinc-800/70 flex justify-between items-center sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-10">
        <h1 className="text-2xl font-black tracking-tight italic animated-gradient-text brand-wordmark">FITKIT</h1>
        <button onClick={onLogout} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-xl hover:bg-zinc-900/80">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.34, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-3 left-3 right-3 glass-panel rounded-3xl p-2 flex justify-around items-center z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
              activeTab === tab.id ? "text-orange-400" : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {activeTab === tab.id && (
              <motion.span
                layoutId="active-nav-tab"
                className="absolute inset-0 rounded-xl bg-orange-500/12 border border-orange-500/35"
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
              />
            )}
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium relative">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
