// src/components/ui/TopNavigation.jsx - Top navigation bar
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { School, Mic, Terminal } from 'lucide-react';

const TopNavigation = () => {
  const location = useLocation();

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">QS</span>
            </div>
            <h1 className="ml-3 text-xl font-bold text-white">University Explorer</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-8">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-900 text-blue-200'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <School className="h-4 w-4 mr-2" />
              Explorer
            </Link>
            <Link
              to="/voice-chat"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/voice-chat'
                  ? 'bg-blue-900 text-blue-200'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Mic className="h-4 w-4 mr-2" />
              Voice Assistant
            </Link>
            <Link
              to="/api-debug"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/api-debug'
                  ? 'bg-blue-900 text-blue-200'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Terminal className="h-4 w-4 mr-2" />
              API Debug
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;