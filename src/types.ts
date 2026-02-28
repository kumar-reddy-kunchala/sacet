export interface StudentDetails {
  fullName: string;
  collegeName: string;
  branch: string;
  hallTicketNumber: string;
}

export interface StudentResult extends StudentDetails {
  id: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

export interface Media {
  url: string;
  type: 'image' | 'video' | 'audio';
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  media?: Media;
  optionMedia?: (Media | null)[];
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface QuizState {
  round1Score: number | null;
  teams: Team[];
}
