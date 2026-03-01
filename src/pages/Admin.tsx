import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Save, RotateCcw, ChevronDown, ChevronUp, Settings, LogIn, Users, FileText, Download, Search, Image as ImageIcon, Video, Music, AlertCircle, Trophy, ShieldCheck, Lock, BookOpen } from 'lucide-react';
import { ROUND1_QUESTIONS, ROUND2_QUESTIONS, ROUND3_QUESTIONS } from '../constants';
import { Question, StudentResult, Media } from '../types';

type RoundKey = 'round1' | 'round2' | 'round3';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState<'questions' | 'results' | 'teams'>('questions');
  const [activeRound, setActiveRound] = useState<RoundKey>('round1');
  const [questions, setQuestions] = useState<Record<RoundKey, Question[]>>({
    round1: [],
    round2: [],
    round3: []
  });
  const [results, setResults] = useState<StudentResult[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [sortByScore, setSortByScore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    media: { url: '', type: 'image' as 'image' | 'video' | 'audio' },
    optionMedia: [
      { url: '', type: 'image' as 'image' | 'video' | 'audio' },
      { url: '', type: 'image' as 'image' | 'video' | 'audio' },
      { url: '', type: 'image' as 'image' | 'video' | 'audio' },
      { url: '', type: 'image' as 'image' | 'video' | 'audio' }
    ]
  });

  useEffect(() => {
    const savedQuestions = localStorage.getItem('sacet_questions');
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    } else {
      setQuestions({
        round1: ROUND1_QUESTIONS,
        round2: ROUND2_QUESTIONS,
        round3: ROUND3_QUESTIONS
      });
    }

    const savedResults = localStorage.getItem('sacet_results');
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }

    const savedTeams = localStorage.getItem('sacet_teams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }

    const session = sessionStorage.getItem('sacet_admin_session');
    if (session === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'sacet@25') {
      setIsLoggedIn(true);
      sessionStorage.setItem('sacet_admin_session', 'true');
    } else {
      alert('Invalid credentials');
    }
  };

  const saveToStorage = (updatedQuestions: Record<RoundKey, Question[]>) => {
    localStorage.setItem('sacet_questions', JSON.stringify(updatedQuestions));
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    if (!newQuestion.text || newQuestion.options.some(o => !o)) {
      alert('Please fill in all fields');
      return;
    }

    const roundQuestions = questions[activeRound];
    const question: Question = {
      id: Date.now(),
      text: newQuestion.text,
      options: [...newQuestion.options],
      correctAnswer: newQuestion.correctAnswer,
      media: newQuestion.media.url ? { ...newQuestion.media } : undefined,
      optionMedia: newQuestion.optionMedia.map(m => m.url ? { ...m } : null)
    };

    const updated = {
      ...questions,
      [activeRound]: [...roundQuestions, question]
    };

    saveToStorage(updated);
    setNewQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      media: { url: '', type: 'image' },
      optionMedia: [
        { url: '', type: 'image' },
        { url: '', type: 'image' },
        { url: '', type: 'image' },
        { url: '', type: 'image' }
      ]
    });
  };

  const deleteQuestion = (id: number) => {
    const updated = {
      ...questions,
      [activeRound]: questions[activeRound].filter(q => q.id !== id)
    };
    saveToStorage(updated);
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all questions to defaults? This will overwrite your current questions.')) {
      const defaults = {
        round1: ROUND1_QUESTIONS,
        round2: ROUND2_QUESTIONS,
        round3: ROUND3_QUESTIONS
      };
      saveToStorage(defaults);
      alert('Questions have been reset to defaults.');
    }
  };

  const clearResults = () => {
    if (confirm('Are you sure you want to clear all student results? This cannot be undone.')) {
      localStorage.removeItem('sacet_results');
      setResults([]);
      alert('All student results have been cleared.');
    }
  };

  const resetTeamScores = () => {
    if (confirm('Are you sure you want to reset all team scores to 0? This will affect Round 2 and Round 3.')) {
      const resetTeams = teams.map((t: any) => ({ ...t, score: 0 }));
      localStorage.setItem('sacet_teams', JSON.stringify(resetTeams));
      setTeams(resetTeams);
      alert('All team scores have been reset to 0.');
    }
  };

  const clearAllTeams = () => {
    if (confirm('Are you sure you want to delete all teams? This will remove all teams from Round 2 and Round 3.')) {
      localStorage.removeItem('sacet_teams');
      setTeams([]);
      alert('All teams have been deleted.');
    }
  };

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTeamName,
      score: 0
    };
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    localStorage.setItem('sacet_teams', JSON.stringify(updatedTeams));
    setNewTeamName('');
  };

  const removeTeam = (id: string) => {
    const updatedTeams = teams.filter(t => t.id !== id);
    setTeams(updatedTeams);
    localStorage.setItem('sacet_teams', JSON.stringify(updatedTeams));
  };

  const updateTeamScore = (id: string, amount: number) => {
    const updatedTeams = teams.map(t => t.id === id ? { ...t, score: t.score + amount } : t);
    setTeams(updatedTeams);
    localStorage.setItem('sacet_teams', JSON.stringify(updatedTeams));
  };

  const moveToRound3 = () => {
    if (teams.length < 5) {
      alert('You need at least 5 teams to move to Round 3.');
      return;
    }
    if (confirm('This will select the top 5 teams and reset their scores to 0 for Round 3. Continue?')) {
      const top5 = [...teams]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(t => ({ ...t, score: 0 }));
      
      setTeams(top5);
      localStorage.setItem('sacet_teams', JSON.stringify(top5));
      alert('Top 5 teams have been moved to Round 3 and scores reset.');
    }
  };

  const resetAllData = () => {
    if (confirm('CRITICAL: This will delete ALL data including questions, results, and teams. This cannot be undone. Are you sure?')) {
      localStorage.removeItem('sacet_questions');
      localStorage.removeItem('sacet_results');
      localStorage.removeItem('sacet_teams');
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const filteredResults = results.filter(r => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.hallTicketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <div className="glass-card p-12 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-yellow-500" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase font-display">Command Center</h2>
            <p className="text-gray-300 font-medium">Authorization required to access system controls.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  placeholder="ACCESS CODE"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold tracking-widest focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder:text-gray-500"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="neon-button neon-button-yellow w-full text-lg"
            >
              Authenticate
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-5xl font-black tracking-tighter uppercase font-display">Control Panel</h2>
          <p className="text-gray-300 font-medium">System configuration and event management.</p>
        </div>
        <button 
          onClick={() => setIsLoggedIn(false)}
          className="px-8 py-4 bg-white/5 text-gray-300 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
        >
          Terminate Session
        </button>
      </div>

      <div className="flex flex-wrap gap-3 p-2 bg-white/5 rounded-3xl border border-white/5 w-fit">
        {[
          { id: 'teams', icon: Users, label: 'Teams' },
          { id: 'questions', icon: BookOpen, label: 'Questions' },
          { id: 'results', icon: Trophy, label: 'Results' }
        ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-yellow-600 text-white shadow-[0_0_30px_rgba(234,179,8,0.3)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'questions' && (
          <motion.div 
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="flex flex-wrap gap-3 p-2 bg-white/5 rounded-2xl border border-white/5 w-fit">
              {(['round1', 'round2', 'round3'] as RoundKey[]).map((round) => (
                <button
                  key={round}
                  onClick={() => setActiveRound(round)}
                  className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                    activeRound === round 
                      ? 'bg-white text-black shadow-xl' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {round.replace('round', 'Round ')}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-[450px_1fr] gap-12 items-start">
              <div className="glass-card p-10 space-y-10 sticky top-12">
                <h3 className="text-2xl font-black uppercase tracking-tight font-display">New Question</h3>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Question Content</label>
                    <textarea 
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                      placeholder="ENTER QUESTION TEXT..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-none transition-all min-h-[120px] placeholder:text-gray-600"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Media Attachment</label>
                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <select 
                        value={newQuestion.media.type}
                        onChange={(e) => setNewQuestion({...newQuestion, media: {...newQuestion.media, type: e.target.value as any}})}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-yellow-500 outline-none"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                      </select>
                      <input 
                        type="text" 
                        value={newQuestion.media.url}
                        onChange={(e) => setNewQuestion({...newQuestion, media: {...newQuestion.media, url: e.target.value}})}
                        placeholder="URL (HTTPS://...)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Response Options & Media</label>
                    <div className="space-y-6">
                      {newQuestion.options.map((opt, idx) => (
                        <div key={idx} className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setNewQuestion({...newQuestion, correctAnswer: idx})}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all flex-shrink-0 ${
                                newQuestion.correctAnswer === idx 
                                  ? 'bg-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.4)]' 
                                  : 'bg-white/5 text-gray-400 hover:text-white'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </button>
                            <input 
                              type="text" 
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...newQuestion.options];
                                newOpts[idx] = e.target.value;
                                setNewQuestion({...newQuestion, options: newOpts});
                              }}
                              placeholder={`OPTION ${String.fromCharCode(65 + idx)}...`}
                              className="flex-1 bg-transparent border-none px-2 py-2 text-sm font-bold focus:ring-0 outline-none placeholder:text-gray-600"
                            />
                          </div>
                          <div className="grid grid-cols-[100px_1fr] gap-3 pl-14">
                            <select 
                              value={newQuestion.optionMedia[idx].type}
                              onChange={(e) => {
                                const newMedia = [...newQuestion.optionMedia];
                                newMedia[idx] = { ...newMedia[idx], type: e.target.value as any };
                                setNewQuestion({...newQuestion, optionMedia: newMedia});
                              }}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-yellow-500 outline-none"
                            >
                              <option value="image">Img</option>
                              <option value="video">Vid</option>
                              <option value="audio">Aud</option>
                            </select>
                            <input 
                              type="text" 
                              value={newQuestion.optionMedia[idx].url}
                              onChange={(e) => {
                                const newMedia = [...newQuestion.optionMedia];
                                newMedia[idx] = { ...newMedia[idx], url: e.target.value };
                                setNewQuestion({...newQuestion, optionMedia: newMedia});
                              }}
                              placeholder="MEDIA URL..."
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-bold focus:ring-1 focus:ring-yellow-500 outline-none placeholder:text-gray-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={addQuestion}
                    className="neon-button neon-button-yellow w-full py-5 text-lg"
                  >
                    Deploy Question
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase tracking-tight font-display">Question Queue ({questions[activeRound].length})</h3>
                  <button 
                    onClick={resetToDefaults}
                    className="text-xs font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Factory Reset
                  </button>
                </div>

                <div className="grid gap-6">
                  {questions[activeRound].map((q, qIdx) => (
                    <div key={q.id} className="glass-card p-8 group hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between gap-8">
                        <div className="space-y-6 flex-1">
                          <div className="flex items-center gap-4">
                            <span className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-sm font-black text-gray-500">
                              {qIdx + 1}
                            </span>
                            <h4 className="text-xl font-bold text-white leading-tight">{q.text}</h4>
                          </div>
                          
                          {q.media && (
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                              {q.media.type === 'image' && <ImageIcon className="w-4 h-4 text-yellow-400" />}
                              {q.media.type === 'video' && <Video className="w-4 h-4 text-yellow-400" />}
                              {q.media.type === 'audio' && <Music className="w-4 h-4 text-yellow-400" />}
                              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Media Attached</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            {q.options.map((opt, oIdx) => (
                              <div 
                                key={oIdx} 
                                className={`p-4 rounded-2xl border transition-all ${
                                  q.correctAnswer === oIdx 
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                                    : 'bg-white/5 border-white/5 text-gray-500'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black opacity-50">{String.fromCharCode(65 + oIdx)}</span>
                                  <span className="text-sm font-bold">{opt}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteQuestion(q.id)}
                          className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="SEARCH CANDIDATES, HALL TICKETS, OR COLLEGES..."
                  className="w-full bg-white/5 border border-white/10 rounded-[32px] pl-16 pr-8 py-6 text-sm font-bold tracking-widest focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder:text-gray-600"
                />
              </div>
              <button 
                onClick={clearResults}
                className="px-10 py-6 bg-red-500/10 text-red-500 rounded-[32px] font-black uppercase tracking-widest text-sm hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
              >
                Purge All Data
              </button>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-10 py-8 text-xs font-black text-gray-500 uppercase tracking-widest">Candidate Profile</th>
                      <th className="px-10 py-8 text-xs font-black text-gray-500 uppercase tracking-widest">Institutional Data</th>
                      <th className="px-10 py-8 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Performance</th>
                      <th className="px-10 py-8 text-xs font-black text-gray-500 uppercase tracking-widest">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-10 py-32 text-center">
                          <div className="space-y-4">
                            <Search className="w-16 h-16 text-gray-800 mx-auto" />
                            <p className="text-gray-600 font-black uppercase tracking-widest">No matching records found.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((result) => (
                        <tr key={result.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-8">
                            <div className="space-y-1">
                              <div className="text-xl font-black text-white uppercase tracking-tight font-display group-hover:text-yellow-400 transition-colors">{result.fullName}</div>
                              <div className="text-xs text-gray-500 font-mono tracking-widest">{result.hallTicketNumber}</div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-gray-300">{result.collegeName}</div>
                              <div className="inline-block px-3 py-1 bg-yellow-500/10 rounded-lg text-[10px] font-black text-yellow-400 uppercase tracking-widest border border-yellow-500/20">
                                {result.branch}
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <div className="inline-flex flex-col items-center">
                              <div className="text-4xl font-black text-white font-display">{result.score}</div>
                              <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Points</div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="text-xs text-gray-500 font-mono space-y-1">
                              <div>{new Date(result.submittedAt).toLocaleDateString()}</div>
                              <div className="opacity-50">{new Date(result.submittedAt).toLocaleTimeString()}</div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'teams' && (
          <motion.div 
            key="teams"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-start">
              <div className="glass-card p-10 space-y-10 sticky top-12">
                <h3 className="text-2xl font-black uppercase tracking-tight font-display">Team Management</h3>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">New Team Name</label>
                    <input 
                      type="text" 
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="ENTER TEAM NAME..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>
                  <button 
                    onClick={addTeam}
                    className="neon-button neon-button-yellow w-full py-5 text-lg"
                  >
                    Register Team
                  </button>
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <button 
                      onClick={resetTeamScores}
                      className="w-full py-4 rounded-xl border border-white/10 text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset All Scores
                    </button>
                    <button 
                      onClick={clearAllTeams}
                      className="w-full py-4 rounded-xl border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <Trash2 className="w-4 h-4" />
                      Purge All Teams
                    </button>
                    <button 
                      onClick={resetAllData}
                      className="w-full py-4 rounded-xl bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-900/20"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Total System Wipe
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase tracking-tight font-display">Active Roster ({teams.length})</h3>
                  <button 
                    onClick={moveToRound3}
                    className="neon-button neon-button-yellow px-8 py-3 text-xs"
                  >
                    Select Top 5 for Final
                  </button>
                </div>

                <div className="grid gap-4">
                  {[...teams].sort((a, b) => b.score - a.score).map((team, idx) => (
                    <div key={team.id} className="glass-card p-6 flex items-center justify-between group hover:border-white/20 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-sm font-black text-gray-500">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-white uppercase tracking-tight font-display">{team.name}</h4>
                          <div className="text-3xl font-black text-yellow-500 font-display">{team.score} <span className="text-xs text-gray-600 uppercase tracking-widest ml-2">Points</span></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => updateTeamScore(team.id, 10)}
                            className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            +10
                          </button>
                          <button 
                            onClick={() => updateTeamScore(team.id, -5)}
                            className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                          >
                            -5
                          </button>
                        </div>
                        <button 
                          onClick={() => removeTeam(team.id)}
                          className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
