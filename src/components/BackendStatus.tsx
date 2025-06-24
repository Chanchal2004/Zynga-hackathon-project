import React from 'react';
import { Server, AlertCircle, RefreshCw } from 'lucide-react';

interface BackendStatusProps {
  isConnected: boolean;
  onRetry: () => void;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ isConnected, onRetry }) => {
  return (
    <div className={`mb-6 rounded-lg p-4 border ${
      isConnected 
        ? 'bg-green-50 border-green-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Server className={`w-5 h-5 ${
            isConnected ? 'text-green-600' : 'text-yellow-600'
          }`} />
          <div>
            <div className={`font-medium ${
              isConnected ? 'text-green-800' : 'text-yellow-800'
            }`}>
              Backend Status: {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className={`text-sm ${
              isConnected ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {isConnected 
                ? 'Real verification available' 
                : 'Start backend server for real verification'
              }
            </div>
          </div>
        </div>
        
        {!isConnected && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onRetry}
              className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 
                         rounded hover:bg-yellow-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>
      
      {!isConnected && (
        <div className="mt-3 text-sm text-yellow-700 bg-yellow-100 rounded p-2">
          <div className="font-medium mb-1">To enable real verification:</div>
          <div>1. Open terminal in project folder</div>
          <div>2. Run: <code className="bg-yellow-200 px-1 rounded">cd backend && python app.py</code></div>
          <div>3. Backend will start on http://localhost:5000</div>
        </div>
      )}
    </div>
  );
};

export default BackendStatus;