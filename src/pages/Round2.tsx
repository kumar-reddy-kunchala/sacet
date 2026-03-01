import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Timer, Trophy, ChevronRight, Users, AlertCircle, Lock, LogIn } from 'lucide-react';
import { getQuestions } from '../utils/questionLoader';
import { Team, Question } from '../types';
import MediaRenderer from '../components/MediaRenderer';
import { playSound } from '../utils/audio';

export default function Round2() {
  const [isLocked, setIsLocked] = useState(true);
  const [secretCode, setSecretCode] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, number>>({});
  const timerAudioRef = useRef<HTMLAudioElement | null>(null);

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
    const saved = localStorage.getItem('sacet_teams');
    if (saved) setTeams(JSON.parse(saved));
  }, []);

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
        playSound('correct');
        setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score + 10 } : t));
      } else {
        playSound('wrong');
        setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score - 5 } : t));
      }
    }
  };

  useEffect(() => {
    if (isQuizActive && timeLeft > 0) {
      if (!timerAudioRef.current) {
        timerAudioRef.current = playSound('timer');
        timerAudioRef.current.loop = true;
      }
    } else {
      if (timerAudioRef.current) {
        timerAudioRef.current.pause();
        timerAudioRef.current = null;
      }
    }

    if (!isQuizActive) return;

    if (timeLeft <= 0) {
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (timerAudioRef.current) {
        timerAudioRef.current.pause();
      }
    };
  }, [timeLeft, isQuizActive, handleNextQuestion]);

  const updateScore = (id: string, amount: number) => {
    setTeams(teams.map(t => t.id === id ? { ...t, score: t.score + amount } : t));
  };

  const resetAllScores = () => {
    if (confirm('Are you sure you want to reset all team scores?')) {
      const resetTeams = teams.map(t => ({ ...t, score: 0 }));
      setTeams(resetTeams);
      localStorage.setItem('sacet_teams', JSON.stringify(resetTeams));
    }
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
      window.location.href = '/round3';
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
            <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Round 2 Locked</h2>
            <p className="text-gray-300 text-sm">Enter the secret code to access this round.</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Secret Code</label>
              <input 
                type="password" 
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-yellow-600 text-white py-4 rounded-xl font-bold hover:bg-yellow-700 transition-all shadow-lg shadow-yellow-900/20 uppercase tracking-widest flex items-center justify-center gap-2"
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
            <h2 className="text-4xl font-black tracking-tighter uppercase font-display">Round 2: Team Technical</h2>
            <p className="text-gray-300 font-medium">Manage teams and conduct the technical round.</p>
          </div>
        <button 
          onClick={resetAllScores}
          className="px-6 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-colors text-sm uppercase tracking-widest border border-red-500/20"
        >
          Reset All Scores
        </button>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-12">
        {/* Team Management */}
        <aside className="space-y-8">
          <div className="glass-card p-8 space-y-6">
            <h3 className="font-black text-xl flex items-center gap-3 uppercase tracking-tight font-display">
              <Users className="w-6 h-6 text-yellow-500" />
              Teams
            </h3>
            
            <div className="space-y-3">
              {teams.length === 0 && (
                <p className="text-center py-8 text-gray-400 text-sm italic">No teams added yet. Add teams in Admin Panel.</p>
              )}
              {teams.map((team) => (
                <motion.div 
                  layout
                  key={team.id}
                  onClick={() => setActiveTeamId(team.id)}
                  className={`p-5 rounded-2xl border-2 transition-all group cursor-pointer ${
                    activeTeamId === team.id 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-black text-lg uppercase tracking-tight">{team.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-black text-yellow-500 font-display">{team.score}</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateScore(team.id, -5); }}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 font-black hover:bg-red-500/20 transition-colors border border-red-500/20"
                      >
                        -5
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateScore(team.id, 10); }}
                        className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-black hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
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
            <div className="glass-card p-16 text-center space-y-10">
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                <Trophy className="w-12 h-12 text-yellow-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                <h3 className="text-5xl font-black tracking-tighter uppercase font-display">
                  {currentQuestionIndex > 0 ? 'Round Completed!' : 'Ready to start?'}
                </h3>
                <p className="text-gray-300 max-w-md mx-auto text-lg font-medium">
                  {currentQuestionIndex > 0 
                    ? 'The technical round has finished. Here are the top performing teams.' 
                    : 'Ensure all teams are added and ready. Each question has a 30-second timer.'}
                </p>
              </div>

              {currentQuestionIndex > 0 && (
                <div className="max-w-md mx-auto space-y-4 py-8">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Top 5 Qualifiers</h4>
                  {[...teams]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5)
                    .map((team, idx) => (
                      <div key={team.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-black text-sm">
                            {idx + 1}
                          </span>
                          <span className="font-bold uppercase tracking-tight text-gray-200">{team.name}</span>
                        </div>
                        <span className="font-black text-yellow-500 font-display">{team.score}</span>
                      </div>
                    ))}
                </div>
              )}

              <div className="flex flex-col gap-4 items-center">
                {currentQuestionIndex > 0 ? (
                  <button 
                    onClick={moveToRound3}
                    className="neon-button neon-button-emerald w-full max-w-sm flex items-center justify-center gap-3 text-xl"
                  >
                    <Trophy className="w-6 h-6" />
                    Advance to Final Round
                  </button>
                ) : (
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
                    className="neon-button neon-button-yellow w-full max-w-sm text-xl"
                  >
                    Start Question Round
                  </button>
                )}
                
                {currentQuestionIndex > 0 && (
                    <button 
                      onClick={() => {
                        setIsQuizActive(true);
                        setCurrentQuestionIndex(0);
                        setTimeLeft(30);
                        setRevealedAnswers({});
                      }}
                      className="text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
                    >
                      Restart Round
                    </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between glass-card p-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-yellow-500/20">
                      {currentQuestionIndex + 1}
                    </div>
                    <span className="font-black text-gray-300 uppercase tracking-[0.2em] text-sm">Question {currentQuestionIndex + 1} / {questions.length}</span>
                  </div>
                  {activeTeamId && (
                    <div className="text-xs font-black text-yellow-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                      Answering: {teams.find(t => t.id === activeTeamId)?.name}
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-mono text-3xl font-black border-2 ${timeLeft < 10 ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                  <Timer className="w-8 h-8" />
                  {timeLeft}s
                </div>
              </div>

              <motion.div 
                key={currentQuestionIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 space-y-12"
              >
                <div className="space-y-8">
                  <h3 className="text-4xl md:text-5xl font-black leading-tight text-white text-center font-display tracking-tight">
                    {currentQuestion?.text}
                  </h3>
                  <MediaRenderer media={currentQuestion?.media} className="max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {currentQuestion?.options.map((option, idx) => {
                    const isRevealed = selectedOption !== undefined;
                    const isCorrect = idx === currentQuestion.correctAnswer;
                    const isSelected = selectedOption === idx;

                    let optionClass = 'border-white/5 bg-white/5 text-gray-300 hover:border-yellow-500/50 hover:bg-white/10 cursor-pointer';
                    if (isRevealed) {
                      if (isCorrect) {
                        optionClass = 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]';
                      } else if (isSelected) {
                        optionClass = 'border-red-500 bg-red-500/20 text-red-400 shadow-[0_0_30px_rgba(220,38,38,0.2)]';
                      } else {
                        optionClass = 'border-white/5 bg-white/5 text-gray-600 opacity-30';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isRevealed}
                        onClick={() => handleOptionClick(idx)}
                        className={`p-8 rounded-3xl border-2 font-black text-xl flex flex-col gap-6 transition-all text-left group ${optionClass}`}
                      >
                        <div className="flex items-center gap-6 w-full">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm flex-shrink-0 transition-all ${isRevealed && isCorrect ? 'bg-emerald-500 text-white' : 'bg-white/10 border border-white/10 text-gray-400 group-hover:border-yellow-500/50 group-hover:text-yellow-400'}`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 uppercase tracking-tight">{option}</span>
                        </div>
                        {currentQuestion.optionMedia?.[idx] && (
                          <MediaRenderer media={currentQuestion.optionMedia[idx]} className="w-full max-h-[200px] rounded-2xl overflow-hidden border border-white/10" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== undefined && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-8 rounded-[32px] text-center font-black text-3xl uppercase tracking-[0.2em] font-display ${selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/20' : 'bg-red-500/20 text-red-400 border-2 border-red-500/20'}`}
                  >
                    {selectedOption === currentQuestion.correctAnswer ? 'System Correct' : `System Error: ${currentQuestion.options[currentQuestion.correctAnswer]}`}
                  </motion.div>
                )}
              </motion.div>

              <div className="flex justify-end">
                <button 
                  onClick={handleNextQuestion}
                  className="neon-button neon-button-yellow flex items-center gap-3"
                >
                  Next Transmission <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
