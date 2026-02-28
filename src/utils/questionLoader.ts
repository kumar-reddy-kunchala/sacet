import { Question } from '../types';
import { ROUND1_QUESTIONS, ROUND2_QUESTIONS, ROUND3_QUESTIONS } from '../constants';

type RoundKey = 'round1' | 'round2' | 'round3';

export const getQuestions = (round: RoundKey): Question[] => {
  const saved = localStorage.getItem('sacet_questions');
  if (saved) {
    const allQuestions = JSON.parse(saved);
    return allQuestions[round] || [];
  }
  
  // Fallback to defaults
  switch (round) {
    case 'round1': return ROUND1_QUESTIONS;
    case 'round2': return ROUND2_QUESTIONS;
    case 'round3': return ROUND3_QUESTIONS;
    default: return [];
  }
};
