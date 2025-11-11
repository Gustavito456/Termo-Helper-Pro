
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Attempt, LetterState } from './types';
import { loadState, saveState } from './services/storage';
import { calculateBestGuess } from './services/solver';
import { isValidWord, WORD_LENGTH, normalizeWord } from './services/dictionary';
import Header from './components/Header';
import AttemptRow from './components/AttemptRow';
import CandidatesPanel from './components/CandidatesPanel';
import { Keyboard } from './components/Keyboard';

const App: React.FC = () => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
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
    setCurrentGuess('');
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
    const lastAttempt = [...currentAttempts].reverse().find(a => a.isLocked && a.isFeedbackApplied);
    if (lastAttempt?.feedback.every(f => f === LetterState.Correct)) {
        setIsSolved(true);
        return true;
    }
    return false;
  };
  
  const handleFeedbackChange = (attemptIndex: number, letterIndex: number, newFeedback: LetterState) => {
      const newAttempts = [...attempts];
      newAttempts[attemptIndex].feedback[letterIndex] = newFeedback;
      setAttempts(newAttempts);
  };

  const handleFeedbackApplied = (index: number) => {
      const newAttempts = attempts.map((attempt, i) =>
        i === index ? { ...attempt, isFeedbackApplied: true } : attempt
      );
      
      if (checkIfSolved(newAttempts)) {
        setAttempts(newAttempts);
        return;
      }

      const newAttempt: Attempt = {
        word: '',
        feedback: Array(WORD_LENGTH).fill(LetterState.Empty),
        isLocked: false,
        isFeedbackApplied: false,
      };
      
      setAttempts([...newAttempts, newAttempt]);
  };

  const handleChar = useCallback((char: string) => {
    if (currentGuess.length < WORD_LENGTH && !isSolved) {
      setCurrentGuess(prev => prev + char);
    }
  }, [currentGuess.length, isSolved]);

  const handleDelete = useCallback(() => {
    setCurrentGuess(prev => prev.slice(0, -1));
  }, []);

  const handleEnter = useCallback(() => {
    const lastAttempt = attempts[attempts.length - 1];
    if (isSolved || !lastAttempt || lastAttempt.isLocked || currentGuess.length !== WORD_LENGTH) {
      return;
    }

    if (!isValidWord(currentGuess)) {
      setError(`Palavra "${currentGuess}" não encontrada no dicionário.`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setError('');
    const newAttempts = [...attempts];
    newAttempts[attempts.length - 1] = {
        ...lastAttempt,
        word: currentGuess.toUpperCase(),
        isLocked: true,
        feedback: Array(WORD_LENGTH).fill(LetterState.Absent),
        isFeedbackApplied: false,
    };
    setAttempts(newAttempts);
    setCurrentGuess('');
  }, [attempts, isSolved, currentGuess]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        
        const key = event.key.toUpperCase();
        
        if (key === 'ENTER') {
            handleEnter();
        } else if (key === 'BACKSPACE') {
            handleDelete();
        } else if ("QWERTYUIOPASDFGHJKLZXCVBNMÇ".includes(key)) {
            handleChar(key);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleEnter, handleDelete, handleChar]);
  
  const keyStates = useMemo(() => {
    const states: { [key: string]: LetterState } = {};
    
    for (const attempt of attempts) {
        if (!attempt.isLocked) continue;
        const normalizedWord = normalizeWord(attempt.word);
        for (let i = 0; i < normalizedWord.length; i++) {
            const letter = normalizedWord[i];
            const feedback = attempt.feedback[i];
            const currentState = states[letter];
            
            if (currentState !== LetterState.Correct) {
                 if (feedback === LetterState.Correct) {
                    states[letter] = LetterState.Correct;
                // Fix: Removed redundant check `&& currentState !== LetterState.Correct`.
                // The outer `if` block already ensures this condition is met, and the check
                // was causing a TypeScript type comparison error.
                } else if (feedback === LetterState.Present) {
                    states[letter] = LetterState.Present;
                } else if (feedback === LetterState.Absent && !currentState) {
                    states[letter] = LetterState.Absent;
                }
            }
        }
    }
    return states;
}, [attempts]);

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 font-sans p-2 sm:p-4 flex flex-col">
      <div className="max-w-md mx-auto w-full">
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
              currentGuess={index === attempts.length - 1 ? currentGuess : ''}
              onFeedbackChange={handleFeedbackChange}
              onFeedbackApplied={handleFeedbackApplied}
            />
          ))}
        </div>
        
        <CandidatesPanel candidates={solverResult.candidates} />
      </div>
      <div className="max-w-2xl w-full mx-auto mt-auto pb-2">
         <Keyboard 
            keyStates={keyStates}
            onChar={handleChar}
            onDelete={handleDelete}
            onEnter={handleEnter}
        />
      </div>
    </div>
  );
};

export default App;
