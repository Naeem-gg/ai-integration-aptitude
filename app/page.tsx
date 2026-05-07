"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, GraduationCap, ChevronRight, Loader2, Code, Palette, Microscope, Briefcase, Music, Globe, Heart, Zap, Cpu, Settings, CheckCircle2 } from 'lucide-react';
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
    topPaths: { 
      title: string; 
      description: string; 
      icon: string;
      courses?: string[];
    }[];
  };
}

interface UserProfile {
  name: string;
  age: string;
  grade: string;
  strength: string;
  preference: string;
  subjects: string;
}

export default function Home() {
  const [step, setStep] = useState<'landing' | 'profile' | 'chat'>('landing');
  const [profile, setProfile] = useState<UserProfile>({
    name: '', age: '', grade: '', strength: '', preference: '', subjects: ''
  });
  const [aiProvider, setAiProvider] = useState<'lmstudio' | 'groq' | 'gemini'>('groq');
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
    if (step === 'chat' && !lastAIResponse?.isFinalReport) {
      scrollToBottom();
    }
  }, [messages, step, isLoading, lastAIResponse?.isFinalReport]);

  const handleStartAssessment = async () => {
    setStep('chat');
    setIsLoading(true);
    setError(null);

    const initialMessage = `
STUDENT PROFILE:
Name: ${profile.name}
Age: ${profile.age}
Grade: ${profile.grade}
Primary Strength: ${profile.strength}
Working Preference: ${profile.preference}
Favorite Subjects: ${profile.subjects}

I am ready for the specialized aptitude test. Based on my profile above, please skip the general introduction and start with your first specific investigative question to help map my career path.
    `.trim();

    const initialHistory: Message[] = [];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: initialHistory, 
          message: initialMessage,
          provider: aiProvider 
        })
      });

      const data: AIResponse = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to start assessment');

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
        body: JSON.stringify({ 
          history: messages, 
          message: userMessage,
          provider: aiProvider 
        })
      });

      const data: AIResponse = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to get response');

      setLastAIResponse(data);
      setMessages([...newHistory, { role: 'model', parts: [{ text: data.message }] }]);
      
      // Force scroll to top if this is the final report
      if (data.isFinalReport) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const copyProfessionalReport = () => {
    if (!lastAIResponse?.report) return;

    const reportText = `
🌟 APTITUDE AI - PROFESSIONAL CAREER REPORT 🌟
----------------------------------------------
STUDENT PROFILE:
Name: ${profile.name}
Age: ${profile.age}
Grade/Level: ${profile.grade}
Strengths: ${profile.strength}
Interests: ${profile.subjects}

EXECUTIVE SUMMARY:
${lastAIResponse.report.summary}

TOP RECOMMENDED CAREER PATHS:
${lastAIResponse.report.topPaths.map((p, i) => {
  const coursesText = p.courses && p.courses.length > 0 
    ? `\n   Academic Roadmap: ${p.courses.join(', ')}` 
    : '';
  return `${i + 1}. ${p.title}\n   ${p.description}${coursesText}`;
}).join('\n\n')}

Generated by Aptitude AI on ${new Date().toLocaleDateString()}
    `.trim();

    navigator.clipboard.writeText(reportText);
    alert('Professional Report copied to clipboard!');
  };

  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none animate-pulse delay-700" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10 w-full max-w-4xl text-center flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-8 md:mb-10 shadow-[0_0_60px_rgba(79,70,229,0.3)]"
          >
            <GraduationCap className="w-8 h-8 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-5xl md:text-9xl font-black mb-6 md:mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20 leading-none">
            DISCOVER<br />YOURSELF.
          </h1>
          <p className="text-lg md:text-3xl text-gray-400 mb-10 md:mb-14 max-w-2xl font-medium leading-relaxed tracking-tight px-4">
            An advanced AI-powered aptitude test designed to map your unique strengths to the perfect career.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(79,70,229,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep('profile')}
            className="w-full md:w-auto flex items-center justify-center gap-6 bg-white text-black px-8 md:px-12 py-5 md:py-6 rounded-2xl font-black text-xl md:text-2xl hover:bg-gray-100 transition-all group cursor-pointer"
          >
            Start Assessment
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
          </motion.button>

          {/* Developer Credit - Landing */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16 md:mt-20 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm group hover:border-indigo-500/30 transition-all cursor-default"
          >
            <div className="flex -space-x-2">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center border-2 border-[#050505]">
                <Code className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
            </div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-gray-300 transition-colors">
              Engineered by <a href="https://github.com/Naeem-gg" target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-400">Naeem Navjivan</a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 md:p-6 relative py-10 md:py-20 overflow-y-auto">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/10 rounded-full blur-[100px] md:blur-[120px]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 w-full max-w-2xl bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 shadow-2xl my-4 md:my-10"
        >
          <div className="flex items-center gap-4 mb-8 md:mb-12">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <User className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Discovery</h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Neural profile setup</p>
            </div>
          </div>

          <div className="space-y-8 md:space-y-10">
            {/* Basic Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Alex Johnson"
                  className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-6 py-4 md:py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-base md:text-lg font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4 text-center block">Age</label>
                  <input 
                    type="number" 
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    placeholder="16"
                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 py-4 md:py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-base md:text-lg font-medium text-center"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4 text-center block">Grade</label>
                  <input 
                    type="text" 
                    value={profile.grade}
                    onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
                    placeholder="10th"
                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 py-4 md:py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-base md:text-lg font-medium text-center"
                  />
                </div>
              </div>
            </div>

            {/* Favorite Subjects */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Interests</label>
              <input 
                type="text" 
                value={profile.subjects}
                onChange={(e) => setProfile({ ...profile, subjects: e.target.value })}
                placeholder="e.g. Physics, Coding, Design"
                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-6 py-4 md:py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-base md:text-lg font-medium"
              />
            </div>

            {/* MCQ: Core Strength */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Primary Strength?</label>
              <div className="grid grid-cols-2 gap-3">
                {['Creative', 'Analytical', 'Technical', 'Social'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setProfile({ ...profile, strength: s })}
                    className={`px-4 py-3.5 rounded-xl md:rounded-2xl border transition-all font-bold text-xs md:text-sm ${profile.strength === s ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* MCQ: Working Preference */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Preference?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['People & Leadership', 'Logic & Machines', 'Art & Concept'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setProfile({ ...profile, preference: p })}
                    className={`px-4 py-3.5 rounded-xl md:rounded-2xl border transition-all font-bold text-[10px] md:text-xs ${profile.preference === p ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 md:pt-6 space-y-4">
              <button 
                disabled={!profile.name || !profile.age || !profile.grade || !profile.strength || !profile.preference}
                onClick={handleStartAssessment}
                className="w-full bg-white text-black py-5 md:py-6 rounded-xl md:rounded-2xl font-black text-lg md:text-xl hover:bg-gray-100 transition-all shadow-2xl disabled:opacity-20 disabled:cursor-not-allowed group"
              >
                <span className="flex items-center justify-center gap-3">
                  Analyze Profile <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={() => setStep('landing')}
                className="w-full text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-white transition-colors py-2"
              >
                Go Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const isFinal = lastAIResponse?.isFinalReport;
  const progress = lastAIResponse ? (lastAIResponse.questionNumber || 0) / (lastAIResponse.totalQuestions || 6) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      {/* Progress Bar */}
      {!isFinal && (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(79,70,229,1)]"
          />
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-3xl sticky top-0 z-50 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <motion.div 
              whileHover={{ rotate: 180 }}
              className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20"
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="font-black text-lg md:text-xl tracking-tighter uppercase">Aptitude.AI</h1>
              <div className="flex items-center gap-2">
                <span className="text-[9px] md:text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] truncate max-w-[80px] md:max-w-none">
                  {profile.name.split(' ')[0] || 'Student'}
                </span>
                {!isFinal && lastAIResponse?.questionNumber && (
                  <>
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500">Q{lastAIResponse.questionNumber}/{lastAIResponse.totalQuestions}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="text-[9px] md:text-xs font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all border border-white/5"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 w-full max-w-5xl mx-auto z-10 pb-48">
        <AnimatePresence mode="wait">
          {isFinal ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-20 py-10"
            >
              {/* Report Header: The "Neural DNA" Profile */}
              <div className="relative p-8 md:p-20 rounded-[2.5rem] md:rounded-[4rem] bg-white/[0.02] border border-white/10 overflow-hidden group">
                <div className="absolute top-0 right-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-indigo-500/10 blur-[80px] md:blur-[120px] -mr-20 -mt-20 md:-mr-40 md:-mt-40 group-hover:bg-indigo-500/20 transition-all duration-1000" />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-6 md:space-y-8">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                  >
                    <CheckCircle2 className="w-7 h-7 md:w-10 md:h-10 text-indigo-400" />
                  </motion.div>
                  
                  <div className="space-y-3 md:space-y-4">
                    <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-indigo-400 mb-2">Verified Assessment</h2>
                    <h1 className="text-4xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500 leading-[1.1] md:leading-none">
                      {profile.name.split(' ')[0]}'s Roadmap
                    </h1>
                  </div>

                  <p className="text-gray-400 text-base md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium px-2">
                    {lastAIResponse.report?.summary}
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <div className="px-4 py-2 md:px-6 md:py-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <User className="w-2.5 h-2.5 md:w-3 md:h-3" /> {profile.age} Y/O
                    </div>
                    <div className="px-4 py-2 md:px-6 md:py-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <GraduationCap className="w-2.5 h-2.5 md:w-3 md:h-3" /> GRADE {profile.grade}
                    </div>
                    <div className="px-4 py-2 md:px-6 md:py-3 bg-indigo-500/10 rounded-xl md:rounded-2xl border border-indigo-500/20 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                      <Zap className="w-2.5 h-2.5 md:w-3 md:h-3" /> {profile.strength}
                    </div>
                  </div>
                </div>
              </div>

              {/* Career Paths Grid */}
              <div className="space-y-8 md:space-y-10">
                <div className="flex items-center gap-4 px-2">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight flex-shrink-0">Recommendations</h3>
                  <div className="h-px bg-white/10 flex-grow" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {lastAIResponse.report?.topPaths.map((path, i) => {
                    const Icon = IconMap[path.icon] || Briefcase;
                    const matchScore = 98 - (i * 4);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.6 }}
                        className="group relative p-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] overflow-hidden"
                      >
                        <div className="bg-[#0a0a0a] rounded-[2.4rem] p-8 md:p-10 h-full relative z-10 flex flex-col">
                          <div className="flex items-start justify-between mb-8">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                              <Icon className="w-6 h-6 md:w-8 md:h-8 text-indigo-400 group-hover:text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-2xl md:text-3xl font-black text-white">{matchScore}%</div>
                              <div className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-600">Match</div>
                            </div>
                          </div>

                          <h4 className="text-2xl md:text-3xl font-black mb-3 tracking-tight group-hover:text-indigo-400 transition-colors leading-tight">{path.title}</h4>
                          <p className="text-gray-400 leading-relaxed text-sm md:text-lg font-medium mb-8">
                            {path.description}
                          </p>

                          {/* Indian Courses Roadmap */}
                          {path.courses && path.courses.length > 0 && (
                            <div className="space-y-4 mb-8">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Academic Roadmap (India)</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 md:gap-2">
                                {path.courses.map((course, ci) => (
                                  <div key={ci} className="bg-white/5 border border-white/5 rounded-lg md:rounded-xl px-3 py-1.5 text-[10px] md:text-xs font-bold text-gray-300 group-hover:border-indigo-500/30 transition-all">
                                    {course}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-auto h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${matchScore}%` }}
                              transition={{ duration: 1.5, delay: 1 }}
                              className="h-full bg-gradient-to-r from-indigo-600 to-blue-500"
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 pt-6">
                <button 
                  onClick={copyProfessionalReport}
                  className="w-full md:flex-1 group relative p-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl"
                >
                  <div className="bg-white text-black py-5 md:py-6 rounded-[0.9rem] md:rounded-[1.4rem] font-black text-lg md:text-xl flex items-center justify-center gap-3">
                    <Zap className="w-5 h-5 md:w-6 md:h-6" /> Copy Report
                  </div>
                </button>
                
                <button 
                  onClick={() => setLastAIResponse({ ...lastAIResponse!, isFinalReport: false })}
                  className="w-full md:flex-1 bg-white/5 border border-white/10 hover:bg-white/10 py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl text-white transition-all flex items-center justify-center gap-3"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" /> Details
                </button>
              </div>

              {/* Footer Stamp */}
              <div className="flex flex-col items-center gap-6 pt-12 md:pt-20 pb-10 opacity-30">
                <div className="w-20 h-20 md:w-24 md:h-24 border-[3px] md:border-4 border-gray-500 rounded-full flex items-center justify-center p-2 opacity-50 grayscale">
                  <div className="text-[8px] md:text-[10px] font-black text-center leading-tight">OFFICIAL<br />APTITUDE AI<br />VERIFIED</div>
                </div>
                <div className="text-center">
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-gray-500 mb-2">Neural Signature Verified</p>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400">Developed with <Heart className="w-2.5 h-2.5 inline text-red-500 mx-1" /> by <span className="text-white border-b border-indigo-500/50 pb-0.5">Naeem Navjivan</span></p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-12 max-w-4xl mx-auto">
              {messages.map((msg, idx) => {
                if (idx === 0 && msg.role === 'user') return null;
                const isModel = msg.role === 'model';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 md:gap-6 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${isModel ? 'bg-gradient-to-tr from-indigo-600 to-blue-500' : 'bg-white/10 border border-white/10'}`}>
                      {isModel ? <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <User className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                    </div>
                    
                    <div className={`relative max-w-[85%] md:max-w-[80%] group`}>
                      <div className={`
                        relative px-5 py-4 md:px-8 md:py-7 rounded-[1.5rem] md:rounded-[2rem] shadow-xl backdrop-blur-3xl transition-all
                        ${isModel 
                          ? 'bg-white/[0.03] border border-white/5 text-gray-200 rounded-tl-lg' 
                          : 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-tr-lg'
                        }
                      `}>
                        {isModel ? (
                          <div className="prose prose-invert max-w-none prose-p:leading-relaxed text-base md:text-xl font-medium tracking-tight">
                            <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-base md:text-xl font-bold tracking-tight">{msg.parts[0].text}</p>
                        )}
                      </div>
                      <div className={`mt-1.5 flex items-center gap-2 ${isModel ? 'justify-start' : 'justify-end'}`}>
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                          {isModel ? 'Aptitude AI' : profile.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  className="flex gap-3 md:gap-6 items-start"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shrink-0 animate-pulse">
                     <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[2rem] rounded-tl-lg px-6 py-4 flex items-center gap-3">
                     <div className="flex gap-1">
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 h-1 bg-indigo-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 h-1 bg-indigo-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 h-1 bg-indigo-400 rounded-full" />
                     </div>
                     <span className="font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] text-gray-500">Processing</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-40" />
      </main>

      {/* Fixed Bottom UI */}
      <footer className="fixed bottom-0 left-0 w-full p-6 md:p-10 z-50">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {!isLoading && !isFinal && lastAIResponse?.options && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-wrap gap-2 md:gap-3 justify-center"
              >
                {lastAIResponse.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSend(opt)}
                    className="bg-white/[0.05] border border-white/10 px-4 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-[11px] md:text-base font-bold transition-all backdrop-blur-3xl shadow-xl"
                  >
                    {opt}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-30 transition duration-1000" />
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isFinal ? "Follow up..." : "Share thoughts..."}
                disabled={isLoading}
                className="w-full bg-[#0d0d0d]/90 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] md:rounded-[2.2rem] pl-6 md:pl-10 pr-16 md:pr-20 py-5 md:py-7 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-base md:text-xl font-medium placeholder:text-gray-700 shadow-xl"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2.5 md:right-4 w-11 h-11 md:w-14 md:h-14 rounded-[1.1rem] md:rounded-[1.4rem] bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white disabled:opacity-30 transition-all shrink-0 cursor-pointer z-10"
              >
                <Send className="w-5 h-5 md:w-7 md:h-7 -ml-0.5" />
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-6 opacity-20 hover:opacity-100 transition-opacity">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2"><Cpu className="w-3 h-3" /> Encrypted Session</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Neural Engine v2.5</p>
          </div>
        </div>
      </footer>
      {/* Developer Control Panel (Dev Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1 ml-2 mt-1">Dev: AI Engine</p>
            <div className="flex gap-1">
              {(['lmstudio', 'groq', 'gemini'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setAiProvider(p)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${aiProvider === p ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
