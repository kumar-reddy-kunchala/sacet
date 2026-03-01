import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Trophy, Play, Pause, RefreshCcw, Users, ChevronRight, CheckCircle2, Lock, LogIn, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getQuestions } from '../utils/questionLoader';
import { Team, Question } from '../types';
import MediaRenderer from '../components/MediaRenderer';
import { playSound } from '../utils/audio';

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
  const [showWinner, setShowWinner] = useState(false);
  const timerAudioRef = useRef<HTMLAudioElement | null>(null);

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
    if (isTimerRunning && timeLeft > 0) {
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

    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      setRoundCompleted(true);
    }
    return () => {
      clearInterval(timer);
      if (timerAudioRef.current) {
        timerAudioRef.current.pause();
      }
    };
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
      playSound('correct');
      setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score + 10 } : t));
    } else {
      playSound('wrong');
      setTeams(prev => prev.map(t => t.id === activeTeamId ? { ...t, score: t.score - 5 } : t));
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

  const announceWinner = () => {
    if (teams.length === 0) return;
    setShowWinner(true);
    playSound('winner');
    
    // Multiple bursts for "cracker blast" effect
    const duration = 7 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 1000, scalar: 1.2 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 150 * (timeLeft / duration);
      
      // Burst 1
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#4F46E5', '#10B981', '#F59E0B']
      });
      
      // Burst 2
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#EC4899', '#8B5CF6', '#3B82F6']
      });

      // Center Burst
      if (Math.random() > 0.7) {
        confetti({
          ...defaults,
          particleCount: particleCount * 2,
          origin: { x: 0.5, y: 0.5 },
          shapes: ['star'],
          gravity: 1.2
        });
      }
    }, 300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetAllScores = () => {
    if (confirm('Are you sure you want to reset all team scores?')) {
      const resetTeams = teams.map(t => ({ ...t, score: 0 }));
      setTeams(resetTeams);
      localStorage.setItem('sacet_teams', JSON.stringify(resetTeams));
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
            <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Round 3 Locked</h2>
            <p className="text-gray-300 text-sm">Enter the secret code to access the Final Round.</p>
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
    <div className="space-y-12 relative">
      <AnimatePresence>
        {showWinner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100, rotate: -5 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              className="glass-card p-16 text-center space-y-10 max-w-3xl w-full shadow-[0_0_100px_rgba(234,179,8,0.2)] relative overflow-hidden border-2 border-yellow-500/30"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-shimmer" />
              
              <div className="space-y-6">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-32 h-32 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-yellow-500/20"
                >
                  <Trophy className="w-16 h-16 text-yellow-500" />
                </motion.div>
                
                <h2 className="text-2xl font-black tracking-[0.4em] uppercase text-yellow-500/60 font-display">Grand Champion</h2>
                
                <div className="text-8xl font-black text-white tracking-tighter py-6 font-display drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  {[...teams].sort((a, b) => b.score - a.score)[0]?.name}
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-12 bg-white/20" />
                  <p className="text-xl font-bold text-gray-400 uppercase tracking-[0.2em]">
                    TechTreck 2025 Winner
                  </p>
                  <div className="h-px w-12 bg-white/20" />
                </div>
              </div>

              <div className="pt-12">
                <button 
                  onClick={() => setShowWinner(false)}
                  className="neon-button neon-button-yellow px-16"
                >
                  Return to Base
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter uppercase font-display">Round 3: Final Round</h2>
            <p className="text-gray-300 font-medium">Rapid Fire Round - 2 minutes per team.</p>
          </div>
        <div className="flex gap-4">
          <button 
            onClick={announceWinner}
            className="neon-button neon-button-yellow flex items-center gap-3"
          >
            <PartyPopper className="w-6 h-6" />
            Announce Winner
          </button>
          <button 
            onClick={resetAllScores}
            className="px-6 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-colors text-sm uppercase tracking-widest border border-red-500/20"
          >
            Reset Scores
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-12">
        {/* Teams List */}
        <aside className="space-y-8">
          <div className="glass-card p-8 space-y-6">
            <h3 className="font-black text-xl flex items-center gap-3 uppercase tracking-tight font-display">
              <Users className="w-6 h-6 text-yellow-500" />
              Finalists
            </h3>
            <div className="space-y-3">
              {teams.map((team) => (
                <div 
                  key={team.id}
                  onClick={() => !isTimerRunning && startTurn(team.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    activeTeamId === team.id 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-lg uppercase tracking-tight">{team.name}</span>
                    {activeTeamId === team.id && isTimerRunning && (
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                    )}
                  </div>
                  <div className="text-3xl font-black text-yellow-500 font-display">{team.score}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Quiz Area */}
        <main className="space-y-8">
          {!isTimerRunning && !roundCompleted ? (
            <div className="glass-card p-16 text-center space-y-10">
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                <Timer className="w-12 h-12 text-yellow-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-5xl font-black tracking-tighter uppercase font-display">Final Showdown</h3>
                <p className="text-gray-300 max-w-md mx-auto text-lg font-medium">
                  Select a team from the left to start their 2-minute rapid fire round.
                </p>
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
                    <span className="font-black text-gray-300 uppercase tracking-[0.2em] text-sm">Question {currentQuestionIndex + 1}</span>
                  </div>
                  <div className="text-xs font-black text-yellow-500 uppercase tracking-widest mt-2">
                    Active Team: {teams.find(t => t.id === activeTeamId)?.name}
                  </div>
                </div>
                <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-mono text-4xl font-black border-2 ${timeLeft < 20 ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                  <Timer className="w-10 h-10" />
                  {formatTime(timeLeft)}
                </div>
              </div>

              <motion.div 
                key={currentQuestionIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 space-y-12"
              >
                <div className="space-y-8 text-center">
                  <h3 className="text-4xl md:text-5xl font-black leading-tight text-white font-display tracking-tight">
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
                        disabled={isRevealed || !isTimerRunning}
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
              </motion.div>

              <div className="flex justify-between items-center">
                <button 
                  onClick={skipQuestion}
                  className="px-8 py-4 text-gray-400 font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Skip Question
                </button>
                <button 
                  onClick={nextQuestion}
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
