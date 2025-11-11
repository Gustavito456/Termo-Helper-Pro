import React from 'react';
import { Attempt, LetterState } from '../types';
import { WORD_LENGTH } from '../services/dictionary';
import FeedbackCell from './FeedbackCell';

interface AttemptRowProps {
  attempt: Attempt;
  attemptIndex: number;
  isLastAttempt: boolean;
  isSolved: boolean;
  currentGuess: string;
  onFeedbackChange: (attemptIndex: number, letterIndex: number, newFeedback: LetterState) => void;
  onFeedbackApplied: (index: number) => void;
}

const AttemptRow: React.FC<AttemptRowProps> = ({
  attempt,
  attemptIndex,
  isLastAttempt,
  isSolved,
  currentGuess,
  onFeedbackChange,
  onFeedbackApplied,
}) => {
  const isActive = isLastAttempt && !isSolved;
  const isPendingFeedback = attempt.isLocked && !attempt.isFeedbackApplied;
  const isFeedbackIncomplete = isPendingFeedback && attempt.feedback.includes(LetterState.Empty);

  const renderActiveWord = () => {
    const letters = currentGuess.padEnd(WORD_LENGTH, ' ').split('');
    return (
        <div className="grid grid-cols-5 gap-1.5">
            {letters.map((letter, index) => (
                <div 
                    key={index}
                    className={`
                        w-full aspect-square flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase rounded-md border-2 transition-colors
                        ${letter !== ' ' ? 'border-gray-500 dark:border-gray-400 animate-pop' : 'border-gray-300 dark:border-gray-600'}
                    `}
                >
                    {letter}
                </div>
            ))}
        </div>
    );
  };
  
  const renderLockedWord = () => (
     <div className="grid grid-cols-5 gap-1.5">
        {attempt.word.split('').map((letter, index) => (
            <FeedbackCell
                key={`${attemptIndex}-${index}-${attempt.feedback[index]}`}
                letter={letter}
                state={attempt.feedback[index]}
                isInteractive={isPendingFeedback}
                onClick={() => {
                    if (!isPendingFeedback) return;
                    
                    const currentFeedback = attempt.feedback[index];
                    let nextState: LetterState;

                    if (currentFeedback === LetterState.Empty) {
                        nextState = LetterState.Absent;
                    } else if (currentFeedback === LetterState.Absent) {
                        nextState = LetterState.Present;
                    } else if (currentFeedback === LetterState.Present) {
                        nextState = LetterState.Correct;
                    } else { // Correct
                        nextState = LetterState.Absent;
                    }
                    onFeedbackChange(attemptIndex, index, nextState);
                }}
            />
        ))}
    </div>
  );

  return (
    <div className={`p-1.5 rounded-lg`}>
      <div className="flex items-center gap-4">
        <span className="text-xl font-mono text-gray-400 dark:text-gray-500">{attemptIndex + 1}</span>
        <div className="flex-grow">
          {!attempt.isLocked && isActive ? renderActiveWord() : renderLockedWord()}
        </div>
      </div>
      {isPendingFeedback && (
        <div className="mt-3 text-center">
            <button
                onClick={() => onFeedbackApplied(attemptIndex)}
                disabled={isFeedbackIncomplete}
                className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Confirmar Feedback e Sugerir Próxima
            </button>
        </div>
      )}
    </div>
  );
};

export default AttemptRow;