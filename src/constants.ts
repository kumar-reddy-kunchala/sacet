import { Question } from './types';

export const ROUND1_QUESTIONS: Question[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  text: `Sample Technical Question ${i + 1}: What is the output of a basic logic gate operation in this scenario?`,
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswer: Math.floor(Math.random() * 4),
}));

export const ROUND2_QUESTIONS: Question[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  text: `Round 2 Technical Question ${i + 1}: Explain the complexity of this algorithm.`,
  options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
  correctAnswer: Math.floor(Math.random() * 4),
}));

export const ROUND3_QUESTIONS: Question[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  text: `Rapid Fire Question ${i + 1}: Quick technical fact check?`,
  options: ['True', 'False', 'Maybe', 'None'],
  correctAnswer: Math.floor(Math.random() * 4),
}));
