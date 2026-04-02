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
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-zinc-950 z-10">
        <h1 className="text-2xl font-black tracking-tighter text-orange-500 italic">FITKIT</h1>
        <button onClick={onLogout} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 p-2 flex justify-around items-center z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
              activeTab === tab.id ? "text-orange-500 bg-orange-500/10" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
