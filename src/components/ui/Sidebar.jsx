// src/components/ui/Sidebar.jsx - Updated with collapse functionality
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { School, Mic, Terminal, Settings, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`h-full bg-gray-900 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col border-r border-gray-800 transition-all duration-300 ease-in-out`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold">QS</span>
          </div>
          {!isCollapsed && <h1 className="ml-3 text-xl font-bold text-white">Explorer</h1>}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white transition-colors duration-200"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="flex-1 pt-8">
        <ul>
          <li>
            <Link
              to="/"
              className={`flex items-center py-3 px-4 md:px-6 ${
                location.pathname === '/'
                  ? 'bg-blue-900/50 border-l-4 border-blue-500'
                  : 'border-l-4 border-transparent hover:bg-gray-800/50'
              }`}
              title="University Explorer"
            >
              <School className="h-5 w-5 text-blue-400" />
              {!isCollapsed && <span className="ml-4 text-white">University Explorer</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/voice-chat"
              className={`flex items-center py-3 px-4 md:px-6 ${
                location.pathname === '/voice-chat'
                  ? 'bg-blue-900/50 border-l-4 border-blue-500'
                  : 'border-l-4 border-transparent hover:bg-gray-800/50'
              }`}
              title="Voice Assistant"
            >
              <Mic className="h-5 w-5 text-blue-400" />
              {!isCollapsed && <span className="ml-4 text-white">Voice Assistant</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/api-debug"
              className={`flex items-center py-3 px-4 md:px-6 ${
                location.pathname === '/api-debug'
                  ? 'bg-blue-900/50 border-l-4 border-blue-500'
                  : 'border-l-4 border-transparent hover:bg-gray-800/50'
              }`}
              title="API Debug"
            >
              <Terminal className="h-5 w-5 text-blue-400" />
              {!isCollapsed && <span className="ml-4 text-white">API Debug</span>}
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        {!isCollapsed && <div className="text-xs text-gray-500">University Explorer v1.0</div>}
      </div>
    </div>
  );
};

export default Sidebar;