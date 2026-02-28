import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, CheckCircle2, AlertCircle, Trophy, RefreshCcw, User, School, BookOpen, CreditCard } from 'lucide-react';
import { getQuestions } from '../utils/questionLoader';
import { Question, StudentDetails, StudentResult } from '../types';
import MediaRenderer from '../components/MediaRenderer';

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
    setStep('quiz');
  };

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
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-black/5 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight uppercase">Student Registration</h2>
            <p className="text-gray-500">Please provide your details to start the screening test.</p>
          </div>

          <form onSubmit={startQuiz} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={studentDetails.fullName}
                  onChange={(e) => setStudentDetails({...studentDetails, fullName: e.target.value})}
                  placeholder="Full Name"
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={studentDetails.collegeName}
                  onChange={(e) => setStudentDetails({...studentDetails, collegeName: e.target.value})}
                  placeholder="College Name"
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={studentDetails.branch}
                  onChange={(e) => setStudentDetails({...studentDetails, branch: e.target.value})}
                  placeholder="Branch (e.g., CSE, ECE)"
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={studentDetails.hallTicketNumber}
                  onChange={(e) => setStudentDetails({...studentDetails, hallTicketNumber: e.target.value})}
                  placeholder="Hall Ticket Number"
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
            >
              Start Screening Test
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
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-black/5 space-y-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-4xl font-black tracking-tight">QUIZ COMPLETED!</h2>
          <div className="space-y-1">
            <p className="text-xl font-bold text-gray-900">{studentDetails.fullName}</p>
            <p className="text-gray-500 text-sm">{studentDetails.hallTicketNumber}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-500 font-medium uppercase tracking-widest">Your Final Score</p>
            <p className="text-7xl font-black text-indigo-600">{score} / {questions.length}</p>
          </div>
          <p className="text-gray-600 max-w-md mx-auto">
            {score >= (questions.length * 0.6) ? "Excellent performance! You're likely to be shortlisted." : "Good effort! Stay tuned for the results."}
          </p>
          <button 
            onClick={resetQuiz}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
            Finish
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = answers[currentQuestion.id];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Round 1: Qualifying</h2>
          <p className="text-sm text-gray-500 font-medium">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-xl font-mono text-xl font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
          <Timer className="w-6 h-6" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-2xl font-bold leading-tight text-gray-900">
                {currentQuestion.text}
              </h3>
              
              <MediaRenderer media={currentQuestion.media} className="max-w-2xl mx-auto" />
            </div>

            <div className="grid gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswer === idx;
                const isCorrect = idx === currentQuestion.correctAnswer;
                const showResult = userAnswer !== undefined;

                let buttonClass = 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-700';
                if (showResult) {
                  if (isCorrect) {
                    buttonClass = 'border-green-500 bg-green-50 text-green-900';
                  } else if (isSelected) {
                    buttonClass = 'border-red-500 bg-red-50 text-red-900';
                  } else {
                    buttonClass = 'border-gray-100 opacity-50 text-gray-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showResult}
                    onClick={() => handleAnswer(currentQuestion.id, idx)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex flex-col gap-3 group ${buttonClass}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{option}</span>
                      {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {showResult && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-red-600" />}
                    </div>
                    {currentQuestion.optionMedia?.[idx] && (
                      <MediaRenderer media={currentQuestion.optionMedia[idx]} className="w-full max-h-[150px]" />
                    )}
                  </button>
                );
              })}
            </div>

            {userAnswer !== undefined && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl font-bold text-center ${userAnswer === currentQuestion.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {userAnswer === currentQuestion.correctAnswer ? 'Correct!' : `Incorrect. The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswer]}`}
              </motion.div>
            )}
          </motion.div>

          <div className="flex items-center justify-between">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-6 py-3 rounded-xl font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition-colors"
            >
              Previous
            </button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={calculateScore}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
              >
                Next Question
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm h-fit space-y-6">
          <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400">Question Palette</h4>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  currentQuestionIndex === i 
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                    : answers[q.id] !== undefined 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
              <div className="w-3 h-3 rounded bg-indigo-600" /> Current
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
              <div className="w-3 h-3 rounded bg-indigo-100" /> Answered
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
              <div className="w-3 h-3 rounded bg-gray-50" /> Unvisited
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
