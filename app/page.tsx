"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, GraduationCap, ChevronRight, Loader2, Code, Palette, Microscope, Briefcase, Music, Globe, Heart, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Icon mapping for dynamic icons in the report
const IconMap: Record<string, React.ElementType> = {
  Code, Palette, Microscope, Briefcase, Music, Globe, Heart, Zap, Sparkles, GraduationCap
};

type Role = 'user' | 'model';
type Message = { role: Role; parts: { text: string }[] };

interface AIResponse {
  message: string;
  options?: string[];
  questionNumber?: number;
  totalQuestions?: number;
  isFinalReport?: boolean;
  report?: {
    summary: string;
    topPaths: { title: string; description: string; icon: string }[];
  };
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAIResponse, setLastAIResponse] = useState<AIResponse | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (started) {
      scrollToBottom();
    }
  }, [messages, started, isLoading]);

  const handleStart = async () => {
    setStarted(true);
    setIsLoading(true);
    setError(null);
    const initialMessage = "Hello, I am a teen student ready for the aptitude test. Please ask your first question.";
    const initialHistory: Message[] = [];
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: initialHistory, message: initialMessage })
      });
      
      const data: AIResponse = await res.json();
      if (!res.ok) throw new Error('Failed to start assessment');

      setLastAIResponse(data);
      setMessages([
        { role: 'user', parts: [{ text: initialMessage }] },
        { role: 'model', parts: [{ text: data.message }] }
      ]);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (customMessage?: string) => {
    const userMessage = (customMessage || input).trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setError(null);
    const newHistory = [...messages, { role: 'user' as Role, parts: [{ text: userMessage }] }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages, message: userMessage })
      });
      
      const data: AIResponse = await res.json();
      if (!res.ok) throw new Error('Failed to get response');

      setLastAIResponse(data);
      setMessages([...newHistory, { role: 'model', parts: [{ text: data.message }] }]);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="z-10 max-w-3xl text-center flex flex-col items-center"
        >
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(59,130,246,0.5)]"
          >
            <GraduationCap className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            FUTURE<br/>READY.
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-xl font-medium leading-relaxed">
            Stop guessing your future. Let our AI guide you to the career you were born for.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59,130,246,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="flex items-center gap-4 bg-white text-black px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all group cursor-pointer"
          >
            Start Your Journey
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const isFinal = lastAIResponse?.isFinalReport;
  const progress = lastAIResponse ? (lastAIResponse.questionNumber || 0) / (lastAIResponse.totalQuestions || 6) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Progress Bar */}
      {!isFinal && (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          />
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">AI Career Counselor</h1>
              {!isFinal && lastAIResponse?.questionNumber && (
                <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">
                  Question {lastAIResponse.questionNumber} of {lastAIResponse.totalQuestions}
                </p>
              )}
            </div>
          </div>
          {isFinal && (
            <button 
              onClick={() => window.location.reload()}
              className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              Restart
            </button>
          )}
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-4xl mx-auto z-10 pb-40">
        <AnimatePresence mode="wait">
          {isFinal ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 py-10"
            >
              <div className="text-center space-y-4">
                <motion.div 
                   initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
                   className="w-20 h-20 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <GraduationCap className="w-10 h-10 text-green-400" />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">Your Aptitude Report</h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                  {lastAIResponse.report?.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lastAIResponse.report?.topPaths.map((path, i) => {
                  const Icon = IconMap[path.icon] || Briefcase;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition-all hover:scale-[1.02] group"
                    >
                      <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6 text-blue-400 group-hover:text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{path.title}</h3>
                      <p className="text-gray-400 leading-relaxed text-sm">
                        {path.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 text-center">
                 <h4 className="text-xl font-bold mb-2">Want to dive deeper?</h4>
                 <p className="text-gray-400 mb-6">Ask me anything about these careers or how to get started!</p>
                 <button onClick={() => setLastAIResponse({...lastAIResponse!, isFinalReport: false})} className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                    Continue Chatting
                 </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {messages.map((msg, idx) => {
                if (idx === 0 && msg.role === 'user') return null;
                const isModel = msg.role === 'model';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isModel ? 'bg-gradient-to-tr from-blue-500 to-purple-500' : 'bg-gray-800 border border-white/10'}`}>
                      {isModel ? <Sparkles className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl p-5 shadow-xl ${isModel ? 'bg-white/5 border border-white/10 backdrop-blur-sm' : 'bg-blue-600 text-white'}`}>
                      {isModel ? (
                        <div className="prose prose-invert max-w-none prose-p:leading-relaxed text-lg">
                          <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-lg font-medium">{msg.parts[0].text}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0 animate-pulse">
                     <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-3 text-gray-400">
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span className="font-medium">Synthesizing...</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-20" />
      </main>

      {/* Fixed Bottom UI */}
      <footer className="fixed bottom-0 left-0 w-full p-6 z-50">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Quick Options */}
          <AnimatePresence>
            {!isLoading && !isFinal && lastAIResponse?.options && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-wrap gap-2 justify-center"
              >
                {lastAIResponse.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(opt)}
                    className="bg-white/10 border border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-all backdrop-blur-md cursor-pointer"
                  >
                    {opt}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Box */}
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isFinal ? "Ask a follow up question..." : "Type your answer..."}
              disabled={isLoading}
              className="w-full bg-[#151515]/80 backdrop-blur-2xl border border-white/10 rounded-3xl pl-7 pr-16 py-5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-2xl text-lg font-medium placeholder:text-gray-600 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-3 bottom-3 aspect-square rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white disabled:opacity-50 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-6 h-6 -ml-0.5" />
            </button>
          </div>
          
          {error && (
            <p className="text-center text-red-400 text-xs font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
