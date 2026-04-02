import { useState, useRef, useEffect } from "react";
import { UserProfile } from "../types";
import { Send, User, Bot, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface AICoachProps {
  profile: UserProfile;
}

export function AICoach({ profile }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hey! I'm your FITKIT Coach. How's the hostel food today? Ask me anything about your diet or workout!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages, user: profile }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I'm having trouble connecting. Try again later!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-1 overflow-y-auto space-y-4 p-2 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`p-2 rounded-xl ${msg.role === "user" ? "bg-orange-500" : "bg-zinc-900 border border-zinc-800"}`}>
                {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-orange-500" />}
              </div>
              <div
                className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-orange-500 text-white rounded-tr-none" : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
              <Bot className="w-4 h-4 text-orange-500" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl rounded-tl-none">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask your coach..."
          className="w-full p-5 pl-6 pr-16 bg-zinc-900 border border-zinc-800 rounded-3xl text-white focus:outline-none focus:border-orange-500 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:hover:bg-orange-500"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
