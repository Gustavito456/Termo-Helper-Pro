import React from 'react';
import { LetterState } from '../types';
import { BackspaceIcon } from './Icons';

interface KeyboardProps {
  keyStates: { [key: string]: LetterState };
  onChar: (char: string) => void;
  onDelete: () => void;
  onEnter: () => void;
}

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'],
];

const stateStyles: { [key in LetterState]: string } = {
  [LetterState.Empty]: 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500',
  [LetterState.Absent]: 'bg-gray-500 dark:bg-gray-700 text-white',
  [LetterState.Present]: 'bg-yellow-500 dark:bg-yellow-600 text-white',
  [LetterState.Correct]: 'bg-green-600 dark:bg-green-700 text-white',
};


export const Keyboard: React.FC<KeyboardProps> = ({ keyStates, onChar, onDelete, onEnter }) => {
  const getKeyStyle = (key: string) => {
    const normalizedKey = normalizeWord(key);
    const state = keyStates[normalizedKey] || LetterState.Empty;
    return stateStyles[state];
  };

  const handleKeyClick = (key: string) => {
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'DELETE') {
      onDelete();
    } else {
      onChar(key);
    }
  };
  
  // Helper to avoid re-importing in this component
  const normalizeWord = (word: string): string => {
    return word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      {KEY_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
          {row.map(key => {
            const isSpecialKey = key === 'ENTER' || key === 'DELETE';
            const buttonClasses = `
              h-12 rounded-md font-bold uppercase flex items-center justify-center transition-colors select-none
              ${isSpecialKey ? 'px-2 sm:px-3 text-xs flex-1' : 'w-7 sm:w-10'}
              ${getKeyStyle(key)}
            `;
            
            return (
              <button key={key} onClick={() => handleKeyClick(key)} className={buttonClasses}>
                {key === 'DELETE' ? <BackspaceIcon /> : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
