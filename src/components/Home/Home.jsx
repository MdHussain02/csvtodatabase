import React from 'react';
import ApiConfig from './ApiConfig.jsx';
import FileUpload from './FileUpload.jsx';
import FieldMapping from './FieldMapping.jsx';
import AdvancedSettings from './AdvancedSettings.jsx';
import ActivityLog from './ActivityLog.jsx';
import { Zap } from 'lucide-react';
import useCsvApiLogic from '../../hooks/useCsvApiLogic.js';


const Home = () => {
  const {
    baseUrl,
    setBaseUrl,
    apiEndpoint,
    setApiEndpoint,
    authToken,
    setAuthToken,
    file,
    setFile,
    status,
    setStatus,
    fieldNames,
    setFieldNames,
    isLoading,
    setIsLoading,
    showAdvanced,
    setShowAdvanced,
    requestMethod,
    setRequestMethod,
    batchSize,
    setBatchSize,
    delay,
    setDelay,
    customHeaders,
    setCustomHeaders,
    logs,
    addLog,
    csvPreview,
    setCsvPreview,
    totalRows,
    setTotalRows,
    dateFields,
    setDateFields,
    imageFields,
    setImageFields,
    parseCSVAndSubmit,
    handleFileChange,
    handleFieldChange,
    addField,
    removeField,
    handleCustomHeaderChange,
    addCustomHeader,
    removeCustomHeader,
    handleDateFieldChange,
    handleImageFieldChange,
    handleImageUpload,
    saveApiConfig,
  } = useCsvApiLogic();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          CSV to API Tool
        </h1>
        <p className="text-gray-600 text-lg">Transform your CSV data into API calls with ease</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
            <ApiConfig
              baseUrl={baseUrl}
              setBaseUrl={setBaseUrl}
              apiEndpoint={apiEndpoint}
              setApiEndpoint={setApiEndpoint}
              authToken={authToken}
              setAuthToken={setAuthToken}
              saveApiConfig={saveApiConfig}
            />
            <FileUpload
              file={file}
              handleFileChange={handleFileChange}
              csvPreview={csvPreview}
              totalRows={totalRows}
            />
            <FieldMapping
              fieldNames={fieldNames}
              dateFields={dateFields}
              imageFields={imageFields}
              handleFieldChange={handleFieldChange}
              handleDateFieldChange={handleDateFieldChange}
              handleImageFieldChange={handleImageFieldChange}
              handleImageUpload={handleImageUpload}
              addField={addField}
              removeField={removeField}
            />
            <AdvancedSettings
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
              requestMethod={requestMethod}
              setRequestMethod={setRequestMethod}
              batchSize={batchSize}
              setBatchSize={setBatchSize}
              delay={delay}
              setDelay={setDelay}
              customHeaders={customHeaders}
              handleCustomHeaderChange={handleCustomHeaderChange}
              addCustomHeader={addCustomHeader}
              removeCustomHeader={removeCustomHeader}
            />
            <button
              onClick={parseCSVAndSubmit}
              disabled={isLoading}
              className="w-full text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center shadow-lg"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <span className="mr-2">📤</span>
              )}
              {isLoading ? 'Processing...' : 'Submit CSV Data'}
            </button>
            {status && (
              <div
                className={`p-4 rounded-xl text-center font-medium ${
                  status.includes('❌')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : status.includes('✅')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {status}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          {csvPreview.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📄</span>
                CSV Preview
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(csvPreview[0]).map((key) => (
                        <th key={key} className="text-left p-2 font-medium text-gray-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="p-2 text-gray-600 truncate max-w-20">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Showing first 3 rows of {totalRows} total rows
              </p>
            </div>
          )}
          <ActivityLog logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default Home;