import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Timer, Trophy, ChevronRight, Users, AlertCircle, Lock, LogIn } from 'lucide-react';
import { getQuestions } from '../utils/questionLoader';
import { Team, Question } from '../types';
import MediaRenderer from '../components/MediaRenderer';

export default function Round2() {
  const [isLocked, setIsLocked] = useState(true);
  const [secretCode, setSecretCode] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('sacet_teams');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTeamName, setNewTeamName] = useState('');
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const unlocked = sessionStorage.getItem('sacet_round2_unlocked');
    if (unlocked === 'true') {
      setIsLocked(false);
    }
    setQuestions(getQuestions('round2'));
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretCode === 'sacet@r2') {
      setIsLocked(false);
      sessionStorage.setItem('sacet_round2_unlocked', 'true');
    } else {
      alert('Invalid secret code');
    }
  };

  useEffect(() => {
    localStorage.setItem('sacet_teams', JSON.stringify(teams));
  }, [teams]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(30);
    } else {
      setIsQuizActive(false);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleOptionClick = (idx: number) => {
    if (revealedAnswers[currentQuestionIndex] !== undefined) return;
    setRevealedAnswers(prev => ({ ...prev, [currentQuestionIndex]: idx }));

    if (activeTeamId) {
      const isCorrect = idx === currentQuestion.correctAnswer;
      if (isCorrect) {
        setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score + 10 } : t));
      } else {
        setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: Math.max(0, t.score - 5) } : t));
      }
    }
  };

  useEffect(() => {
    if (!isQuizActive) return;

    if (timeLeft <= 0) {
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isQuizActive, handleNextQuestion]);

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTeamName,
      score: 0
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  const updateScore = (id: string, amount: number) => {
    setTeams(teams.map(t => t.id === id ? { ...t, score: t.score + amount } : t));
  };

  const resetAllScores = () => {
    if (confirm('Are you sure you want to reset all team scores?')) {
      setTeams(teams.map(t => ({ ...t, score: 0 })));
    }
  };

  if (questions.length === 0 && isQuizActive) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">No questions available for Round 2.</h2>
        <p className="text-gray-500">Please add questions in the Manage Questions page.</p>
        <button onClick={() => setIsQuizActive(false)} className="text-indigo-600 font-bold">Go back</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = revealedAnswers[currentQuestionIndex];

  if (isLocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-black/5 w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Round 2 Locked</h2>
            <p className="text-gray-500 text-sm">Enter the secret code to access this round.</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Secret Code</label>
              <input 
                type="password" 
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Unlock Round
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase">Round 2: Team Technical</h2>
          <p className="text-gray-500 font-medium">Manage teams and conduct the technical round.</p>
        </div>
        <button 
          onClick={resetAllScores}
          className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm uppercase tracking-widest"
        >
          Reset All Scores
        </button>
      </div>

      <div className="grid lg:grid-cols-[350px_1fr] gap-12">
        {/* Team Management */}
        <aside className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Teams
            </h3>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team Name"
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addTeam()}
              />
              <button 
                onClick={addTeam}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {teams.length === 0 && (
                <p className="text-center py-8 text-gray-400 text-sm italic">No teams added yet.</p>
              )}
              {teams.map((team) => (
                <motion.div 
                  layout
                  key={team.id}
                  onClick={() => setActiveTeamId(team.id)}
                  className={`p-4 rounded-2xl border transition-all group cursor-pointer ${
                    activeTeamId === team.id 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-100 bg-gray-50 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900">{team.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeTeam(team.id); }}
                      className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-black text-indigo-600">{team.score}</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateScore(team.id, -5); }}
                        className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-red-500 font-bold hover:bg-red-50 transition-colors"
                      >
                        -5
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateScore(team.id, 10); }}
                        className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-green-600 font-bold hover:bg-green-50 transition-colors"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </aside>

        {/* Question System */}
        <main className="space-y-8">
          {!isQuizActive ? (
            <div className="bg-white rounded-3xl p-12 border border-black/5 shadow-sm text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">Ready to start?</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Ensure all teams are added and ready. Each question has a 30-second timer.
                </p>
              </div>
              <button 
                onClick={() => {
                  if (questions.length === 0) {
                    alert('Please add questions in the Manage Questions page first.');
                    return;
                  }
                  setIsQuizActive(true);
                  setCurrentQuestionIndex(0);
                  setTimeLeft(30);
                  setRevealedAnswers({});
                }}
                className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl"
              >
                Start Question Round
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                      {currentQuestionIndex + 1}
                    </div>
                    <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  </div>
                  {activeTeamId && (
                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">
                      Answering: {teams.find(t => t.id === activeTeamId)?.name}
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl font-mono text-2xl font-bold ${timeLeft < 10 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Timer className="w-6 h-6" />
                  {timeLeft}s
                </div>
              </div>

              <motion.div 
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-12 rounded-3xl border border-black/5 shadow-sm space-y-12"
              >
                <div className="space-y-6">
                  <h3 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 text-center">
                    {currentQuestion?.text}
                  </h3>
                  <MediaRenderer media={currentQuestion?.media} className="max-w-3xl mx-auto" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {currentQuestion?.options.map((option, idx) => {
                    const isRevealed = selectedOption !== undefined;
                    const isCorrect = idx === currentQuestion.correctAnswer;
                    const isSelected = selectedOption === idx;

                    let optionClass = 'border-gray-100 bg-gray-50 text-gray-700 hover:border-indigo-200 cursor-pointer';
                    if (isRevealed) {
                      if (isCorrect) {
                        optionClass = 'border-green-500 bg-green-50 text-green-900';
                      } else if (isSelected) {
                        optionClass = 'border-red-500 bg-red-50 text-red-900';
                      } else {
                        optionClass = 'border-gray-100 bg-gray-50 text-gray-300 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isRevealed}
                        onClick={() => handleOptionClick(idx)}
                        className={`p-6 rounded-2xl border-2 font-bold text-lg flex flex-col gap-4 transition-all text-left ${optionClass}`}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${isRevealed && isCorrect ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1">{option}</span>
                        </div>
                        {currentQuestion.optionMedia?.[idx] && (
                          <MediaRenderer media={currentQuestion.optionMedia[idx]} className="w-full max-h-[150px]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== undefined && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-2xl text-center font-black text-2xl uppercase tracking-widest ${selectedOption === currentQuestion.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {selectedOption === currentQuestion.correctAnswer ? 'Correct Answer!' : `Wrong! Correct: ${currentQuestion.options[currentQuestion.correctAnswer]}`}
                  </motion.div>
                )}
              </motion.div>

              <div className="flex justify-end">
                <button 
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
                >
                  Next Question <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
