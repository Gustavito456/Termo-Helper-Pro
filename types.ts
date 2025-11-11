export enum LetterState {
  Empty = 'empty',      // Not yet evaluated
  Absent = 'absent',    // Gray: Letter not in word
  Present = 'present',  // Yellow: Letter in word, wrong position
  Correct = 'correct',    // Green: Letter in word, correct position
}

export interface Attempt {
  word: string;
  feedback: LetterState[];
  isLocked: boolean;
  isFeedbackApplied: boolean;
}

export interface StoredState {
  attempts: Attempt[];
  theme: 'light' | 'dark';
}