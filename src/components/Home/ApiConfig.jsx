import React from 'react';
import { Settings, Save } from 'lucide-react';

const ApiConfig = ({ setBaseUrl, apiEndpoint, setApiEndpoint, setAuthToken, saveApiConfig ,baseUrl , authToken }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-blue-600" />
        API Configuration
      </h2>
      <div className="grid md:grid-cols-2 ">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
          <input
            type="url"
            placeholder="https://api.example.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-half h-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
          <input
            type="text"
            placeholder="/api/v1/data"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            className="w-half h-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Authorization Token</label>
        <input
          type="password"
          placeholder="Bearer token or API key"
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
          className="w-5/6 h-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      <button
        onClick={saveApiConfig}
        className="mt-4 w-half bg-blue-500 text-white p-2  text-xs rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center"
      >
        <Save className="w-3 h-3 mr-1" />
        Save Configuration
      </button>
    </div>
  );
};

export default ApiConfig;