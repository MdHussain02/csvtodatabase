import React from 'react';
import { Minus } from 'lucide-react';

const AdvancedSettings = ({
  showAdvanced,
  setShowAdvanced,
  requestMethod,
  setRequestMethod,
  batchSize,
  setBatchSize,
  delay,
  setDelay,
  customHeaders,
  handleCustomHeaderChange,
  addCustomHeader,
  removeCustomHeader,
}) => {
  return (
    <div>
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
      >
        {showAdvanced ? '▼' : '▶'} Advanced Settings
      </button>
      {showAdvanced && (
        <div className="mt-4 space-y-4 bg-gray-50 rounded-xl p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={requestMethod}
                onChange={(e) => setRequestMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
              <input
                type="number"
                min="1"
                max="100"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delay (ms)</label>
              <input
                type="number"
                min="0"
                value={delay}
                onChange={(e) => setDelay(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Headers</label>
            {customHeaders.map((header, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Header Key"
                  value={header.key}
                  onChange={(e) => handleCustomHeaderChange(index, 'key', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Header Value"
                  value={header.value}
                  onChange={(e) => handleCustomHeaderChange(index, 'value', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeCustomHeader(index)}
                  disabled={customHeaders.length === 1}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addCustomHeader}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              + Add Custom Header
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;