import { Attempt, LetterState } from '../types';
import { DICTIONARY, normalizeWord, WORD_LENGTH } from './dictionary';

interface SolverResult {
  bestGuess: string;
  candidates: string[];
}

export const calculateBestGuess = (attempts: Attempt[]): SolverResult => {
  if (attempts.length === 0) {
    return { bestGuess: 'TERMO', candidates: [...DICTIONARY] };
  }

  const correctLetters: { [key: number]: string } = {};
  const presentLetters: { [key: string]: Set<number> } = {};
  const absentLetters = new Set<string>();
  const minLetterCounts: { [key: string]: number } = {};

  // Build constraints from attempts
  for (const attempt of attempts) {
    const normalizedAttemptWord = normalizeWord(attempt.word);
    
    // First pass to establish minimum counts of letters
    const attemptLetterCounts: { [key: string]: number } = {};
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = normalizedAttemptWord[i];
        const state = attempt.feedback[i];
        if (state === LetterState.Correct || state === LetterState.Present) {
            attemptLetterCounts[letter] = (attemptLetterCounts[letter] || 0) + 1;
        }
    }
    for (const letter in attemptLetterCounts) {
        minLetterCounts[letter] = Math.max(minLetterCounts[letter] || 0, attemptLetterCounts[letter]);
    }
  }

  // Second pass to build detailed constraints
  for (const attempt of attempts) {
    const normalizedAttemptWord = normalizeWord(attempt.word);
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = normalizedAttemptWord[i];
        const state = attempt.feedback[i];
        
        if (state === LetterState.Correct) {
            correctLetters[i] = letter;
        } else if (state === LetterState.Present) {
            if (!presentLetters[letter]) {
                presentLetters[letter] = new Set();
            }
            presentLetters[letter].add(i);
        } else if (state === LetterState.Absent) {
            if (!minLetterCounts[letter]) { // Only add to absent if we don't know it's in the word
                absentLetters.add(letter);
            }
        }
    }
  }

  const candidates = DICTIONARY.filter(word => {
    const normalizedWord = normalizeWord(word);
    const wordLetterCounts: { [key: string]: number } = {};
    
    for (const char of normalizedWord) {
        wordLetterCounts[char] = (wordLetterCounts[char] || 0) + 1;
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = normalizedWord[i];
      // Rule 1: Correct letters must match
      if (correctLetters[i] && correctLetters[i] !== letter) {
        return false;
      }
      
      // Rule 2: Present letters cannot be in this position
      if (presentLetters[letter]?.has(i)) {
          return false;
      }
    }
    
    // Rule 3: Absent letters cannot be in the word, unless they are also present/correct
    for (const letter of absentLetters) {
      if (normalizedWord.includes(letter)) {
        return false;
      }
    }
    
    // Rule 4: Must contain all present letters
    for (const letter in presentLetters) {
        if (!normalizedWord.includes(letter)) {
            return false;
        }
    }
    
    // Rule 5: Must satisfy minimum letter counts
    for (const letter in minLetterCounts) {
        if ((wordLetterCounts[letter] || 0) < minLetterCounts[letter]) {
            return false;
        }
    }

    // Rule 6: Handle cases like 'ARARA' with one yellow 'A' and one gray 'A'.
    // If a letter is marked gray, the solution can't have *more* copies than are already confirmed yellow/green.
    for (const attempt of attempts) {
        const normalizedAttemptWord = normalizeWord(attempt.word);
        for(let i=0; i<WORD_LENGTH; i++) {
            const letter = normalizedAttemptWord[i];
            const state = attempt.feedback[i];
            if (state === LetterState.Absent && minLetterCounts[letter]) {
                if ((wordLetterCounts[letter] || 0) > minLetterCounts[letter]) {
                    return false;
                }
            }
        }
    }
    
    return true;
  });

  if (candidates.length === 0) {
    return { bestGuess: 'Nenhuma palavra encontrada', candidates: [] };
  }
  
  if (candidates.length <= 2) {
    return { bestGuess: candidates[0], candidates };
  }

  // Scoring: find the word that is most likely to eliminate other candidates,
  // using positional frequency and a bonus for distinct letters in early guesses.
  
  // 1. Calculate positional letter frequencies from the remaining candidates.
  const positionalFrequencies: Array<{ [key: string]: number }> = Array(WORD_LENGTH).fill(null).map(() => ({}));
  for (const candidate of candidates) {
    const normalized = normalizeWord(candidate);
    for (let i = 0; i < normalized.length; i++) {
      const letter = normalized[i];
      positionalFrequencies[i][letter] = (positionalFrequencies[i][letter] || 0) + 1;
    }
  }

  const scoreWord = (word: string): number => {
    const normalized = normalizeWord(word);
    let score = 0;

    // Part 1: Score based on positional frequency.
    // score(word) = sum(freqPos[i][word[i]])
    for (let i = 0; i < normalized.length; i++) {
        const letter = normalized[i];
        score += positionalFrequencies[i][letter] || 0;
    }

    // Part 2: Add a bonus for having distinct letters in the first 3 attempts
    // to cover the alphabet faster and gain more information.
    if (attempts.length < 3) {
      const uniqueLetters = new Set(normalized.split(''));
      // The bonus needs to be significant enough to outweigh the positional score
      // of words with common, but repeated, letters. A factor of the candidate count works well.
      const distinctBonusFactor = candidates.length / 2;
      score += uniqueLetters.size * distinctBonusFactor;
    }
    
    return score;
  };
  
  // We check the entire dictionary for the best guess, not just candidates.
  // This helps eliminate more possibilities by suggesting good "eliminator" words.
  let bestGuess = candidates[0];
  let maxScore = -1;

  for (const word of DICTIONARY) {
    // Don't suggest words that have already been tried.
    if (attempts.some(a => normalizeWord(a.word) === normalizeWord(word))) {
        continue;
    }
    const score = scoreWord(word);
    if (score > maxScore) {
        maxScore = score;
        bestGuess = word;
    }
  }
  
  return {
    bestGuess: bestGuess,
    candidates: candidates,
  };
};