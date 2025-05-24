// src/components/ui/TopNavigation.jsx - Updated with Ditto logo and light theme
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { School, Mic, Terminal, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import DittoLogo from './DittoLogo';

const TopNavigation = () => {
  const location = useLocation();
  const { theme, toggleTheme, isLight } = useTheme();

  return (
    <div className={`border-b transition-colors duration-200 ${
      isLight
        ? 'bg-white border-gray-200'
        : 'bg-gray-900 border-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <DittoLogo
              size="default"
              className={isLight ? 'text-gray-800' : 'text-white'}
            />
            <span className={`ml-3 text-xl font-semibold ${
              isLight ? 'text-gray-800' : 'text-white'
            }`}>
              University Explorer
            </span>
          </div>

          {/* Navigation Links and Theme Toggle */}
          <div className="flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/'
                    ? isLight
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-blue-900 text-blue-200'
                    : isLight
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <School className="h-4 w-4 mr-2" />
                Explorer
              </Link>
              <Link
                to="/voice-chat"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/voice-chat'
                    ? isLight
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-blue-900 text-blue-200'
                    : isLight
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice Assistant
              </Link>
              <Link
                to="/api-debug"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/api-debug'
                    ? isLight
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-blue-900 text-blue-200'
                    : isLight
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Terminal className="h-4 w-4 mr-2" />
                API Debug
              </Link>
            </nav>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md transition-all duration-200 ${
                isLight
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            >
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;