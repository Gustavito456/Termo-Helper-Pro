import React from 'react';
import { LetterState } from '../types';

interface FeedbackCellProps {
  letter: string;
  state: LetterState;
  isInteractive: boolean;
  onClick: () => void;
}

const stateStyles: { [key in LetterState]: string } = {
  [LetterState.Empty]: 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
  [LetterState.Absent]: 'bg-gray-500 dark:bg-gray-600 text-white border-gray-500 dark:border-gray-600',
  [LetterState.Present]: 'bg-yellow-500 dark:bg-yellow-600 text-white border-yellow-500 dark:border-yellow-600',
  [LetterState.Correct]: 'bg-green-600 dark:bg-green-700 text-white border-green-600 dark:border-green-700',
};

const FeedbackCell: React.FC<FeedbackCellProps> = ({ letter, state, isInteractive, onClick }) => {
  const baseClasses = "w-full aspect-square flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase rounded-md border-2 transition-all duration-200";
  const interactiveClasses = isInteractive ? 'cursor-pointer hover:scale-105 transform animate-flip' : '';

  return (
    <div
      className={`${baseClasses} ${stateStyles[state]} ${interactiveClasses}`}
      onClick={onClick}
    >
      {letter}
    </div>
  );
};

export default FeedbackCell;
