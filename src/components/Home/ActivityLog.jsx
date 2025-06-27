import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const ActivityLog = ({ logs }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
        Activity Log
      </h3>
      <div className="max-h-64 overflow-y-auto space-y-2">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`flex items-start text-sm p-2 rounded-lg ${
              log.type === 'error'
                ? 'bg-red-50 text-red-700'
                : log.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            <div className="mr-2 mt-0.5">
              {log.type === 'error' ? (
                <XCircle className="w-4 h-4" />
              ) : log.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{log.message}</div>
              <div className="text-xs opacity-75">{log.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;