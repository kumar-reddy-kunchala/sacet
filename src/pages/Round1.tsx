import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, CheckCircle2, AlertCircle, Trophy, RefreshCcw, User, School, BookOpen, CreditCard, ChevronRight } from 'lucide-react';
import { getQuestions } from '../utils/questionLoader';
import { Question, StudentDetails, StudentResult } from '../types';
import MediaRenderer from '../components/MediaRenderer';
import { playSound } from '../utils/audio';

export default function Round1() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [step, setStep] = useState<'register' | 'quiz' | 'result'>('register');
  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    fullName: '',
    collegeName: '',
    branch: '',
    hallTicketNumber: ''
  });

  useEffect(() => {
    setQuestions(getQuestions('round1'));
  }, []);

  const calculateScore = useCallback(() => {
    let newScore = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);
    setIsSubmitted(true);
    setStep('result');

    // Save result to localStorage
    const result: StudentResult = {
      ...studentDetails,
      id: Math.random().toString(36).substr(2, 9),
      score: newScore,
      totalQuestions: questions.length,
      submittedAt: new Date().toISOString()
    };

    const existingResults = JSON.parse(localStorage.getItem('sacet_results') || '[]');
    localStorage.setItem('sacet_results', JSON.stringify([...existingResults, result]));
  }, [answers, questions, studentDetails]);

  useEffect(() => {
    if (step !== 'quiz') return;

    if (timeLeft <= 0 && !isSubmitted && questions.length > 0) {
      calculateScore();
      return;
    }

    const timer = setInterval(() => {
      if (!isSubmitted) {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, calculateScore, questions.length, step]);

  const handleAnswer = (questionId: number, optionIndex: number) => {
    if (isSubmitted || answers[questionId] !== undefined) return;
    
    const question = questions.find(q => q.id === questionId);
    if (question) {
      if (optionIndex === question.correctAnswer) {
        playSound('correct');
      } else {
        playSound('wrong');
      }
    }
    
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(20 * 60);
    setIsSubmitted(false);
    setScore(0);
    setStep('register');
    setStudentDetails({
      fullName: '',
      collegeName: '',
      branch: '',
      hallTicketNumber: ''
    });
  };

  const startQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentDetails.fullName || !studentDetails.collegeName || !studentDetails.branch || !studentDetails.hallTicketNumber) {
      alert('Please fill in all details');
      return;
    }
    
    // Request fullscreen
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }

    setStep('quiz');
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && step === 'quiz' && !isSubmitted) {
        alert('Security Alert: Fullscreen mode exited. Your test is being terminated.');
        calculateScore();
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (step === 'quiz') {
        e.preventDefault();
        alert('Copying is disabled during the test.');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (step === 'quiz') {
        e.preventDefault();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [step, isSubmitted, calculateScore]);

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">No questions available for Round 1.</h2>
        <p className="text-gray-500">Please add questions in the Manage Questions page.</p>
      </div>
    );
  }

  if (step === 'register') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
        <div className="glass-card p-12 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-yellow-500" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase font-display">Registration</h2>
            <p className="text-gray-300 font-medium">Initialize your credentials for the screening test.</p>
          </div>

          <form onSubmit={startQuiz} className="space-y-8">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={studentDetails.fullName}
                  onChange={(e) => setStudentDetails({...studentDetails, fullName: e.target.value})}
                  placeholder="FULL NAME"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold tracking-widest focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder:text-gray-500"
                />
              </div>
              <div className="relative group">
                <School className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={studentDetails.collegeName}
                  onChange={(e) => setStudentDetails({...studentDetails, collegeName: e.target.value})}
                  placeholder="COLLEGE NAME"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold tracking-widest focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder:text-gray-500"
                />
              </div>
              <div className="relative group">
                <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={studentDetails.branch}
                  onChange={(e) => setStudentDetails({...studentDetails, branch: e.target.value})}
                  placeholder="BRANCH (E.G., CSE, ECE)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold tracking-widest focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder:text-gray-500"
                />
              </div>
              <div className="relative group">
                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={studentDetails.hallTicketNumber}
                  onChange={(e) => setStudentDetails({...studentDetails, hallTicketNumber: e.target.value})}
                  placeholder="HALL TICKET NUMBER"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold tracking-widest focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder:text-gray-500"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="neon-button neon-button-yellow w-full text-lg"
            >
              Initialize Test
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  if (step === 'result') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center space-y-8 py-12"
      >
        <div className="glass-card p-16 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500 animate-shimmer" />
          <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(234,179,8,0.2)]">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black tracking-tighter uppercase font-display">Analysis Complete</h2>
            <div className="space-y-1">
              <p className="text-2xl font-black text-white uppercase tracking-tight">{studentDetails.fullName}</p>
              <p className="text-gray-400 font-mono text-sm tracking-widest">{studentDetails.hallTicketNumber}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Final Performance Score</p>
            <p className="text-8xl font-black text-yellow-500 font-display tracking-tighter">{score} <span className="text-3xl text-gray-600">/ {questions.length}</span></p>
          </div>

          <p className="text-gray-300 max-w-md mx-auto text-lg font-medium">
            {score >= (questions.length * 0.6) ? "Exceptional performance. Shortlist probability: HIGH." : "Analysis complete. Shortlist probability: MODERATE."}
          </p>

          <button 
            onClick={resetQuiz}
            className="neon-button neon-button-yellow px-12"
          >
            Terminate Session
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = answers[currentQuestion.id];

  return (
    <div className={`max-w-6xl mx-auto space-y-12 ${step === 'quiz' ? 'select-none' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 glass-card p-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter font-display">Round 1: Screening</h2>
          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-black uppercase tracking-widest border border-yellow-500/20">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-gray-400 font-mono text-xs uppercase tracking-widest">
              ID: {studentDetails.hallTicketNumber}
            </span>
          </div>
        </div>
        <div className={`flex items-center gap-5 px-10 py-5 rounded-3xl font-mono text-4xl font-black border-2 transition-all ${timeLeft < 60 ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
          <Timer className="w-10 h-10" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-12">
        <div className="space-y-10">
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 space-y-12"
          >
            <div className="space-y-10">
              <h3 className="text-3xl md:text-4xl font-black leading-tight text-white font-display tracking-tight">
                {currentQuestion.text}
              </h3>
              
              <MediaRenderer media={currentQuestion.media} className="max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10" />
            </div>

            <div className="grid gap-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswer === idx;
                const isCorrect = idx === currentQuestion.correctAnswer;
                const showResult = userAnswer !== undefined;

                let buttonClass = 'border-white/5 bg-white/5 text-gray-300 hover:border-yellow-500/50 hover:bg-white/10';
                if (showResult) {
                  if (isCorrect) {
                    buttonClass = 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]';
                  } else if (isSelected) {
                    buttonClass = 'border-red-500 bg-red-500/20 text-red-400 shadow-[0_0_30px_rgba(220,38,38,0.2)]';
                  } else {
                    buttonClass = 'border-white/5 bg-white/5 text-gray-600 opacity-30';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showResult}
                    onClick={() => handleAnswer(currentQuestion.id, idx)}
                    className={`w-full text-left p-8 rounded-3xl border-2 transition-all flex flex-col gap-4 group ${buttonClass}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-6">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${showResult && isCorrect ? 'bg-emerald-500 text-white' : 'bg-white/10 border border-white/10 text-gray-400'}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-bold text-xl uppercase tracking-tight">{option}</span>
                      </div>
                      {showResult && isCorrect && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                      {showResult && isSelected && !isCorrect && <AlertCircle className="w-8 h-8 text-red-500" />}
                    </div>
                    {currentQuestion.optionMedia?.[idx] && (
                      <MediaRenderer media={currentQuestion.optionMedia[idx]} className="w-full max-h-[200px] rounded-2xl overflow-hidden border border-white/10" />
                    )}
                  </button>
                );
              })}
            </div>

            {userAnswer !== undefined && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-8 rounded-[32px] text-center font-black text-2xl uppercase tracking-[0.2em] font-display ${userAnswer === currentQuestion.correctAnswer ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/20' : 'bg-red-500/20 text-red-400 border-2 border-red-500/20'}`}
              >
                {userAnswer === currentQuestion.correctAnswer ? 'System Correct' : `System Error: ${currentQuestion.options[currentQuestion.correctAnswer]}`}
              </motion.div>
            )}
          </motion.div>

          <div className="flex items-center justify-between">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-gray-500 disabled:opacity-30 hover:text-white transition-colors"
            >
              Previous
            </button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={calculateScore}
                className="neon-button neon-button-emerald px-16 text-xl"
              >
                Submit Final
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="neon-button neon-button-yellow px-16 text-xl flex items-center gap-3"
              >
                Next Transmission <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="glass-card p-10 h-fit space-y-10 sticky top-12">
          <h4 className="font-black text-xs uppercase tracking-[0.3em] text-gray-500">Transmission Palette</h4>
          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-12 h-12 rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                  currentQuestionIndex === i 
                    ? 'bg-yellow-600 text-white shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-110' 
                    : answers[q.id] !== undefined 
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                      : 'bg-white/5 text-gray-600 border border-white/5 hover:border-white/20'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="pt-8 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="w-3 h-3 rounded-full bg-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.5)]" /> Active
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" /> Answered
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="w-3 h-3 rounded-full bg-white/5 border border-white/5" /> Unvisited
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
