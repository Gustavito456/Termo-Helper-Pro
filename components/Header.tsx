
import React from 'react';
import { SunIcon, MoonIcon, RefreshIcon } from './Icons';

interface HeaderProps {
  suggestion: string;
  onReset: () => void;
  onToggleTheme: () => void;
  currentTheme: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ suggestion, onReset, onToggleTheme, currentTheme }) => {
  return (
    <header className="text-center space-y-4 pt-4">
      <div className="flex justify-between items-center">
        <button
          onClick={onReset}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Reiniciar Jogo"
        >
          <RefreshIcon />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Termo Helper Pro
        </h1>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Mudar Tema"
        >
          {currentTheme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Melhor Sugestão:</p>
        <p className="text-3xl font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
          {suggestion}
        </p>
      </div>
    </header>
  );
};

export default Header;
