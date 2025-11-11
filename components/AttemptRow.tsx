import React, { useState, useEffect, useRef } from 'react';
import { Attempt, LetterState } from '../types';
import { WORD_LENGTH } from '../services/dictionary';
import FeedbackCell from './FeedbackCell';

interface AttemptRowProps {
  attempt: Attempt;
  attemptIndex: number;
  isLastAttempt: boolean;
  isSolved: boolean;
  onConfirm: (index: number, word: string) => void;
  onFeedbackChange: (attemptIndex: number, letterIndex: number, newFeedback: LetterState) => void;
  onFeedbackApplied: (index: number) => void;
}

const AttemptRow: React.FC<AttemptRowProps> = ({
  attempt,
  attemptIndex,
  isLastAttempt,
  isSolved,
  onConfirm,
  onFeedbackChange,
  onFeedbackApplied,
}) => {
  const [inputValue, setInputValue] = useState(attempt.word);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isActive = isLastAttempt && !isSolved;
  const isPendingFeedback = isActive && attempt.isLocked && !attempt.isFeedbackApplied;

  useEffect(() => {
    if (isActive && !attempt.isLocked) {
      inputRef.current?.focus();
    }
  }, [isActive, attempt.isLocked]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-ZÇ]/g, '');
    setInputValue(value);
  };

  const handleConfirmClick = () => {
    if (inputValue.length === WORD_LENGTH) {
      onConfirm(attemptIndex, inputValue);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirmClick();
    }
  };

  const renderInput = () => (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        maxLength={WORD_LENGTH}
        className="flex-grow bg-gray-200 dark:bg-gray-700 p-2 rounded-md text-center font-bold tracking-[0.5em] uppercase focus:outline-none focus:ring-2 focus:ring-sky-500"
        placeholder="DIGITE"
        disabled={!isActive || attempt.isLocked}
      />
      <button
        onClick={handleConfirmClick}
        disabled={inputValue.length !== WORD_LENGTH || !isActive}
        className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed hover:bg-sky-700 transition-colors"
      >
        OK
      </button>
    </div>
  );
  
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
                    const states = [LetterState.Absent, LetterState.Present, LetterState.Correct];
                    const currentStateIndex = states.indexOf(attempt.feedback[index]);
                    const nextState = states[(currentStateIndex + 1) % states.length];
                    onFeedbackChange(attemptIndex, index, nextState);
                }}
            />
        ))}
    </div>
  );

  return (
    <div className={`p-3 rounded-lg ${isActive && !attempt.isLocked ? 'bg-white dark:bg-gray-800 shadow-lg' : 'bg-transparent dark:bg-transparent'}`}>
      <div className="flex items-center gap-4">
        <span className="text-xl font-mono text-gray-400 dark:text-gray-500">{attemptIndex + 1}</span>
        <div className="flex-grow">
          {!attempt.isLocked && isActive ? renderInput() : renderLockedWord()}
        </div>
      </div>
      {isPendingFeedback && (
        <div className="mt-3 text-center">
            <button
                onClick={() => onFeedbackApplied(attemptIndex)}
                className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
            >
                Aplicar Feedback e Próxima Tentativa
            </button>
        </div>
      )}
    </div>
  );
};

export default AttemptRow;
