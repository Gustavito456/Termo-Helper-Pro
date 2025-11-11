
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Attempt, LetterState } from './types';
import { loadState, saveState } from './services/storage';
import { calculateBestGuess } from './services/solver';
import { isValidWord, WORD_LENGTH } from './services/dictionary';
import Header from './components/Header';
import AttemptRow from './components/AttemptRow';
import CandidatesPanel from './components/CandidatesPanel';

const App: React.FC = () => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [error, setError] = useState<string>('');
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const resetGame = useCallback(() => {
    const newAttempt: Attempt = {
      word: '',
      feedback: Array(WORD_LENGTH).fill(LetterState.Empty),
      isLocked: false,
      isFeedbackApplied: false,
    };
    setAttempts([newAttempt]);
    setIsSolved(false);
    setError('');
  }, []);
  
  useEffect(() => {
    const savedState = loadState();
    if (savedState && savedState.attempts?.length > 0) {
      // Migrate older state structures that don't have `isFeedbackApplied`
      const migratedAttempts = savedState.attempts.map((a, index) => ({
        ...a,
        isFeedbackApplied: a.isFeedbackApplied ?? (a.isLocked ? index < savedState.attempts.length - 1 : false),
      }));
      setAttempts(migratedAttempts);
      setTheme(savedState.theme || 'light');
      checkIfSolved(migratedAttempts);
    } else {
      resetGame();
    }
  }, [resetGame]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveState({ attempts, theme });
  }, [attempts, theme]);

  const solverResult = useMemo(() => {
    if (isSolved) return { bestGuess: 'Resolvido!', candidates: [] };
    const appliedAttempts = attempts.filter(a => a.isLocked && a.isFeedbackApplied);
    return calculateBestGuess(appliedAttempts);
  }, [attempts, isSolved]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const checkIfSolved = (currentAttempts: Attempt[]) => {
    // FIX: Replace findLast with a compatible alternative for older JS targets.
    const lastAttempt = [...currentAttempts].reverse().find(a => a.isLocked);
    if (lastAttempt?.isLocked && lastAttempt.feedback.every(f => f === LetterState.Correct)) {
        setIsSolved(true);
        return true;
    }
    return false;
  };

  const handleWordConfirm = (index: number, word: string) => {
    if (!isValidWord(word)) {
      setError(`Palavra "${word}" não encontrada no dicionário.`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setError('');
    const newAttempts = [...attempts];
    newAttempts[index].word = word;
    newAttempts[index].isLocked = true;
    newAttempts[index].feedback = Array(WORD_LENGTH).fill(LetterState.Absent);
    newAttempts[index].isFeedbackApplied = false;
    setAttempts(newAttempts);
  };
  
  const handleFeedbackChange = (attemptIndex: number, letterIndex: number, newFeedback: LetterState) => {
      const newAttempts = [...attempts];
      newAttempts[attemptIndex].feedback[letterIndex] = newFeedback;
      setAttempts(newAttempts);
  };

  const handleFeedbackApplied = (index: number) => {
      if (checkIfSolved(attempts)) return;

      const newAttempt: Attempt = {
        word: '',
        feedback: Array(WORD_LENGTH).fill(LetterState.Empty),
        isLocked: false,
        isFeedbackApplied: false,
      };
      
      setAttempts(prev => [
        ...prev.map((attempt, i) =>
          i === index ? { ...attempt, isFeedbackApplied: true } : attempt
        ),
        newAttempt
      ]);
  };
  

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 font-sans p-2 sm:p-4">
      <div className="max-w-md mx-auto">
        <Header 
          suggestion={solverResult.bestGuess}
          onReset={resetGame}
          onToggleTheme={toggleTheme}
          currentTheme={theme}
        />

        {error && (
            <div className="bg-red-500 text-white p-2 rounded-md text-center my-4 animate-pop">
                {error}
            </div>
        )}

        {isSolved && (
            <div className="bg-green-500 text-white p-3 rounded-md text-center my-4 font-bold text-lg animate-pop">
                🎉 Parabéns! Palavra encontrada! 🎉
            </div>
        )}

        <div className="space-y-3 my-4">
          {attempts.map((attempt, index) => (
            <AttemptRow
              key={index}
              attempt={attempt}
              attemptIndex={index}
              isLastAttempt={index === attempts.length - 1}
              isSolved={isSolved}
              onConfirm={handleWordConfirm}
              onFeedbackChange={handleFeedbackChange}
              onFeedbackApplied={handleFeedbackApplied}
            />
          ))}
        </div>
        
        <CandidatesPanel candidates={solverResult.candidates} />
      </div>
    </div>
  );
};

export default App;