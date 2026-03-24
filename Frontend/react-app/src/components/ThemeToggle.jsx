import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="p-2.5 rounded-lg transition-all duration-300 hover:shadow-md"
      style={{
        backgroundColor: isDarkMode ? '#414854' : '#e9f0f9',
      }}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" style={{ color: '#FDB813' }} />
      ) : (
        <Moon className="w-5 h-5" style={{ color: '#4CA1AF' }} />
      )}
    </button>
  );
};

export default ThemeToggle;
