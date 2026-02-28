import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Save, RotateCcw, ChevronDown, ChevronUp, Settings, LogIn, Users, FileText, Download, Search, Image as ImageIcon, Video, Music, AlertCircle } from 'lucide-react';
import { ROUND1_QUESTIONS, ROUND2_QUESTIONS, ROUND3_QUESTIONS } from '../constants';
import { Question, StudentResult, Media } from '../types';

type RoundKey = 'round1' | 'round2' | 'round3';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState<'questions' | 'results' | 'teams' | 'settings'>('questions');
  const [activeRound, setActiveRound] = useState<RoundKey>('round1');
  const [questions, setQuestions] = useState<Record<RoundKey, Question[]>>({
    round1: [],
    round2: [],
    round3: []
  });
  const [results, setResults] = useState<StudentResult[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
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
    }
  };

  const clearResults = () => {
    if (confirm('Are you sure you want to clear all student results? This cannot be undone.')) {
      localStorage.removeItem('sacet_results');
      setResults([]);
    }
  };

  const resetTeamScores = () => {
    if (confirm('Are you sure you want to reset all team scores to 0? This will affect Round 2 and Round 3.')) {
      const savedTeams = localStorage.getItem('sacet_teams');
      if (savedTeams) {
        const parsedTeams = JSON.parse(savedTeams);
        const resetTeams = parsedTeams.map((t: any) => ({ ...t, score: 0 }));
        localStorage.setItem('sacet_teams', JSON.stringify(resetTeams));
        setTeams(resetTeams);
        alert('All team scores have been reset to 0.');
      } else {
        alert('No teams found to reset.');
      }
    }
  };

  const clearAllTeams = () => {
    if (confirm('Are you sure you want to delete all teams? This will remove all teams from Round 2 and Round 3.')) {
      localStorage.removeItem('sacet_teams');
      setTeams([]);
      alert('All teams have been deleted.');
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-black/5 w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Admin Login</h2>
            <p className="text-gray-500 text-sm">Enter credentials to access the admin panel.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Username</label>
              <input 
                type="text" 
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <input 
                type="password" 
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('settings')}
              className="hover:rotate-12 transition-transform focus:outline-none"
              title="Go to Settings"
            >
              <Settings className="w-8 h-8 text-indigo-600" />
            </button>
            Admin Panel
          </h2>
          <p className="text-gray-500 font-medium">Manage questions and view student results.</p>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase tracking-widest">R2 Code: sacet@r2</span>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase tracking-widest">R3 Code: sacet@r3</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'questions' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Questions
          </div>
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'results' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Student Results
          </div>
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'teams' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Teams
          </div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'settings' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </button>
      </div>

      {activeTab === 'questions' ? (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button 
              onClick={resetToDefaults}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm uppercase tracking-widest flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Questions to Defaults
            </button>
          </div>

          {/* Round Selector */}
          <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
            {(['round1', 'round2', 'round3'] as RoundKey[]).map((round) => (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className={`px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                  activeRound === round 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {round.replace('round', 'Round ')}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start">
            {/* Add Question Form */}
            <aside className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6 sticky top-24">
              <h3 className="font-bold text-xl">Add New Question</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question Text</label>
                  <textarea 
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                    placeholder="Enter question..."
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question Media (Optional)</label>
                  <div className="flex gap-2">
                    <select 
                      value={newQuestion.media.type}
                      onChange={(e) => setNewQuestion({...newQuestion, media: {...newQuestion.media, type: e.target.value as any}})}
                      className="bg-gray-50 border-none rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                    </select>
                    <input 
                      type="text" 
                      value={newQuestion.media.url}
                      onChange={(e) => setNewQuestion({...newQuestion, media: {...newQuestion.media, url: e.target.value}})}
                      placeholder="Media URL (e.g. https://...)"
                      className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Options & Media</label>
                  {newQuestion.options.map((opt, idx) => (
                    <div key={idx} className="space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex gap-2 items-center">
                        <input 
                          type="radio" 
                          name="correct" 
                          checked={newQuestion.correctAnswer === idx}
                          onChange={() => setNewQuestion({...newQuestion, correctAnswer: idx})}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <input 
                          type="text" 
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...newQuestion.options];
                            newOpts[idx] = e.target.value;
                            setNewQuestion({...newQuestion, options: newOpts});
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="flex gap-2 pl-6">
                        <select 
                          value={newQuestion.optionMedia[idx].type}
                          onChange={(e) => {
                            const newMedia = [...newQuestion.optionMedia];
                            newMedia[idx] = { ...newMedia[idx], type: e.target.value as any };
                            setNewQuestion({...newQuestion, optionMedia: newMedia});
                          }}
                          className="bg-white border-none rounded-lg px-2 py-1 text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none"
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
                          placeholder="Option Media URL"
                          className="flex-1 bg-white border-none rounded-lg px-3 py-1 text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={addQuestion}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Question
                </button>
              </div>
            </aside>

            {/* Question List */}
            <main className="space-y-4">
              <h3 className="font-bold text-xl">Existing Questions ({questions[activeRound].length})</h3>
              <div className="space-y-4">
                {questions[activeRound].map((q, qIdx) => (
                  <div key={q.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex items-start justify-between gap-4">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Q{qIdx + 1}</span>
                        <div className="space-y-2 flex-1">
                          <h4 className="font-bold text-gray-900">{q.text}</h4>
                          {q.media && (
                            <div className="mt-2 text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                              {q.media.type === 'image' && <ImageIcon className="w-3 h-3" />}
                              {q.media.type === 'video' && <Video className="w-3 h-3" />}
                              {q.media.type === 'audio' && <Music className="w-3 h-3" />}
                              Media: {q.media.url.substring(0, 30)}...
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div 
                            key={oIdx} 
                            className={`text-xs p-2 rounded-lg border space-y-1 ${
                              q.correctAnswer === oIdx 
                                ? 'bg-green-50 border-green-200 text-green-700 font-bold' 
                                : 'bg-gray-50 border-gray-100 text-gray-500'
                            }`}
                          >
                            <div>{String.fromCharCode(65 + oIdx)}. {opt}</div>
                            {q.optionMedia?.[oIdx] && (
                              <div className="text-[8px] opacity-70 flex items-center gap-1">
                                {q.optionMedia[oIdx]?.type === 'image' && <ImageIcon className="w-2 h-2" />}
                                {q.optionMedia[oIdx]?.type === 'video' && <Video className="w-2 h-2" />}
                                {q.optionMedia[oIdx]?.type === 'audio' && <Music className="w-2 h-2" />}
                                Media attached
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteQuestion(q.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      ) : activeTab === 'results' ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, hall ticket, or college..."
                className="w-full bg-white border border-black/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              />
            </div>
            <button 
              onClick={clearResults}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm uppercase tracking-widest flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Results
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Student Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">College & Branch</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Score</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No results found.</td>
                    </tr>
                  ) : (
                    filteredResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{result.fullName}</div>
                          <div className="text-xs text-gray-500 font-mono">{result.hallTicketNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">{result.collegeName}</div>
                          <div className="text-xs text-indigo-600 font-bold uppercase tracking-widest">{result.branch}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-black text-xl">
                            {result.score}
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Out of {result.totalQuestions}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-500">
                            {new Date(result.submittedAt).toLocaleDateString()}<br/>
                            {new Date(result.submittedAt).toLocaleTimeString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'teams' ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Registered Teams ({teams.length})</h3>
              <p className="text-gray-500 text-sm">Teams participating in Round 2 and Round 3.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={resetTeamScores}
                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm uppercase tracking-widest flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Scores
              </button>
              <button 
                onClick={clearAllTeams}
                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm uppercase tracking-widest flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete All Teams
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-black/5">
                <p className="text-gray-400 italic">No teams registered yet. Teams are added in Round 2.</p>
              </div>
            ) : (
              teams.map((team) => (
                <div key={team.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900">{team.name}</h4>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase tracking-widest">ID: {team.id.substring(0, 4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-black text-indigo-600">{team.score}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Points</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeTab === 'settings' ? (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-red-600 uppercase tracking-tight">Danger Zone</h3>
              <p className="text-gray-500 text-sm">Be careful! These actions cannot be undone.</p>
            </div>

            <div className="grid gap-4">
              <div className="p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-red-900">Reset Questions</h4>
                  <p className="text-xs text-red-700">Restore all questions to their original default state. This will delete any custom questions you've added.</p>
                </div>
                <button 
                  onClick={resetToDefaults}
                  className="w-full bg-white text-red-600 py-3 rounded-xl font-bold border border-red-200 hover:bg-red-100 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </button>
              </div>

              <div className="p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-red-900">Clear Student Results</h4>
                  <p className="text-xs text-red-700">Permanently delete all screening test results from Round 1.</p>
                </div>
                <button 
                  onClick={clearResults}
                  className="w-full bg-white text-red-600 py-3 rounded-xl font-bold border border-red-200 hover:bg-red-100 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Results
                </button>
              </div>

              <div className="p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-red-900">Reset Team Scores</h4>
                  <p className="text-xs text-red-700">Set all team scores to 0 for Round 2 and Round 3. Teams will remain, but their scores will be cleared.</p>
                </div>
                <button 
                  onClick={resetTeamScores}
                  className="w-full bg-white text-red-600 py-3 rounded-xl font-bold border border-red-200 hover:bg-red-100 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All Scores
                </button>
              </div>

              <div className="p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-red-900">Delete All Teams</h4>
                  <p className="text-xs text-red-700">Remove all teams from the system. This will clear the team list for Round 2 and Round 3.</p>
                </div>
                <button 
                  onClick={clearAllTeams}
                  className="w-full bg-white text-red-600 py-3 rounded-xl font-bold border border-red-200 hover:bg-red-100 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All Teams
                </button>
              </div>

              <div className="p-6 bg-red-600 rounded-2xl border border-red-700 space-y-4 shadow-lg shadow-red-200">
                <div className="space-y-1">
                  <h4 className="font-bold text-white">Reset All Data</h4>
                  <p className="text-xs text-red-100">Wipe everything: questions, results, and teams. The ultimate reset.</p>
                </div>
                <button 
                  onClick={resetAllData}
                  className="w-full bg-white text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
