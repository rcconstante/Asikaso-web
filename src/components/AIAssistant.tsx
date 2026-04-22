import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const genAI = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || '' });

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Kumusta! I am your Asikaso AI. How can I help you with your files or adulting tasks today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are the Asikaso AI Assistant, a helpful expert on Philippine government processes, adulting, taxes, and life management for Filipinos. Answer in a friendly, professional yet approachable tone (can use some Taglish if appropriate). Keep answers concise and step-by-step. Focus on practical advice for Filipinos.",
        }
      });

      const assistantMessage = response.text || "Sorry, I couldn't process that. Laban lang!";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Medyo busy ang system. Try again later ha?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-10 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Stuck on a step? Ask our AI.
          </h2>
          <p className="text-slate-500 text-sm font-medium">Get instant answers for Philippine government processes.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden flex flex-col h-[450px]">
          <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
                <img src="/assets/Logo.png" alt="Asikaso AI" className="w-full h-full object-contain" />
              </div>
              <p className="font-bold text-sm text-slate-900">Asikaso AI Assistant</p>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-xl flex items-start space-x-2 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  <p className="font-medium text-[13px] leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 p-3 rounded-xl rounded-tl-none border border-slate-100 flex items-center space-x-2">
                  <Loader2 size={14} className="text-accent animate-spin" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about PH adulting..."
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
            <button
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
