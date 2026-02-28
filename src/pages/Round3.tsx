import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Trophy, Play, Pause, RefreshCcw, Users, ChevronRight, CheckCircle2, Lock, LogIn } from 'lucide-react';
import { getQuestions } from '../utils/questionLoader';
import { Team, Question } from '../types';
import MediaRenderer from '../components/MediaRenderer';

export default function Round3() {
  const [isLocked, setIsLocked] = useState(true);
  const [secretCode, setSecretCode] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('sacet_teams');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const unlocked = sessionStorage.getItem('sacet_round3_unlocked');
    if (unlocked === 'true') {
      setIsLocked(false);
    }
    setQuestions(getQuestions('round3'));
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretCode === 'sacet@r3') {
      setIsLocked(false);
      sessionStorage.setItem('sacet_round3_unlocked', 'true');
    } else {
      alert('Invalid secret code');
    }
  };

  useEffect(() => {
    localStorage.setItem('sacet_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      setRoundCompleted(true);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const skipQuestion = () => {
    if (!isTimerRunning || questions.length === 0) return;
    setCurrentQuestionIndex(prev => (prev + 1) % questions.length);
    setRevealedAnswers({});
  };

  const handleOptionClick = (idx: number) => {
    if (!isTimerRunning || revealedAnswers[currentQuestionIndex] !== undefined || !activeTeamId) return;
    
    setRevealedAnswers(prev => ({ ...prev, [currentQuestionIndex]: idx }));
    
    const isCorrect = idx === currentQuestion.correctAnswer;
    if (isCorrect) {
      setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score + 10 } : t));
    } else {
      setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: Math.max(0, t.score - 5) } : t));
    }
  };

  const nextQuestion = () => {
    if (!isTimerRunning || questions.length === 0) return;
    setCurrentQuestionIndex(prev => (prev + 1) % questions.length);
    setRevealedAnswers({});
  };

  const startTurn = (teamId: string) => {
    if (questions.length === 0) {
      alert('Please add questions in the Manage Questions page first.');
      return;
    }
    setActiveTeamId(teamId);
    setTimeLeft(120);
    setIsTimerRunning(true);
    setRoundCompleted(false);
    setCurrentQuestionIndex(0);
    setRevealedAnswers({});
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetAllScores = () => {
    if (confirm('Are you sure you want to reset all team scores?')) {
      setTeams(teams.map(t => ({ ...t, score: 0 })));
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const activeTeam = teams.find(t => t.id === activeTeamId);
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
            <h2 className="text-2xl font-black uppercase tracking-tight">Round 3 Locked</h2>
            <p className="text-gray-500 text-sm">Enter the secret code to access the Final Round.</p>
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
          <h2 className="text-3xl font-black tracking-tight uppercase">Round 3: Final Round</h2>
          <p className="text-gray-500 font-medium">Rapid Fire Round - 2 minutes per team.</p>
        </div>
        <button 
          onClick={resetAllScores}
          className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm uppercase tracking-widest"
        >
          Reset All Scores
        </button>
      </div>

      <div className="grid lg:grid-cols-[350px_1fr] gap-12">
        {/* Team Selection */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Select Team
            </h3>
            <div className="space-y-3">
              {teams.map((team) => (
                <button
                  key={team.id}
                  disabled={isTimerRunning}
                  onClick={() => startTurn(team.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${
                    activeTeamId === team.id 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-100 hover:border-indigo-200 bg-gray-50'
                  } ${isTimerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div>
                    <div className="font-bold text-gray-900">{team.name}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Score: {team.score}</div>
                  </div>
                  {activeTeamId === team.id && <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />}
                </button>
              ))}
              {teams.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-4">Add teams in Round 2 first.</p>
              )}
            </div>
          </div>
        </aside>

        {/* Rapid Fire Area */}
        <main className="space-y-8">
          {!activeTeamId ? (
            <div className="bg-white rounded-3xl p-12 border border-black/5 shadow-sm text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Play className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">Select a team to begin</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  The timer will start immediately upon selection. The team must answer as many questions as possible in 2 minutes.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Status Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em]">Active Team</p>
                  <h3 className="text-3xl font-black text-gray-900">{activeTeam?.name}</h3>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Score</p>
                    <p className="text-4xl font-black text-indigo-600">{activeTeam?.score}</p>
                  </div>
                  <div className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-mono text-3xl font-bold shadow-inner ${timeLeft < 20 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-900 text-white'}`}>
                    <Timer className="w-8 h-8" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>

              {/* Question Area */}
              <AnimatePresence mode="wait">
                {roundCompleted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-3xl border border-black/5 shadow-sm text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Trophy className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold">Time's Up!</h3>
                      <p className="text-gray-500">Turn completed for {activeTeam?.name}.</p>
                      <p className="text-5xl font-black text-indigo-600 mt-4">Final Score: {activeTeam?.score}</p>
                    </div>
                    <button 
                      onClick={() => setActiveTeamId(null)}
                      className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                    >
                      Next Team
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-12 rounded-3xl border border-black/5 shadow-sm space-y-12"
                  >
                    <div className="space-y-6 text-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Question {currentQuestionIndex + 1}</span>
                      <h3 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900">
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

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                      {selectedOption === undefined ? (
                        <button
                          onClick={skipQuestion}
                          className="w-full md:w-auto px-12 py-5 rounded-2xl border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                          Skip Question
                        </button>
                      ) : (
                        <button
                          onClick={nextQuestion}
                          className="w-full md:w-auto px-12 py-5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                        >
                          Next Question
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-4 rounded-full shadow-lg transition-all ${isTimerRunning ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                >
                  {isTimerRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Reset this turn?')) {
                      setTimeLeft(120);
                      setIsTimerRunning(false);
                      setRoundCompleted(false);
                      setCurrentQuestionIndex(0);
                    }
                  }}
                  className="p-4 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all shadow-lg"
                >
                  <RefreshCcw className="w-8 h-8" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
