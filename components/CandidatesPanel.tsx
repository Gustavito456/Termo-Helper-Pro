
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

interface CandidatesPanelProps {
  candidates: string[];
}

const CandidatesPanel: React.FC<CandidatesPanelProps> = ({ candidates }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700 dark:text-gray-200"
      >
        <span>{`Palavras Candidatas (${candidates.length})`}</span>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
          {candidates.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 text-center text-sm">
              {candidates.map((word, index) => (
                <span key={index} className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">Nenhuma palavra corresponde aos filtros.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidatesPanel;
