import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Send, Settings, AlertCircle, CheckCircle, XCircle, Plus, Minus, FileText, Zap, Calendar } from 'lucide-react';

const Home = () => {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [fieldNames, setFieldNames] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [requestMethod, setRequestMethod] = useState('POST');
  const [batchSize, setBatchSize] = useState(1);
  const [delay, setDelay] = useState(0);
  const [customHeaders, setCustomHeaders] = useState([{ key: '', value: '' }]);
  const [logs, setLogs] = useState([]);
  const [csvPreview, setCsvPreview] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [dateFields, setDateFields] = useState([]);
  const [showDateMapping, setShowDateMapping] = useState(false);

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  }, []);

  // Helper function to detect if a value is an Excel date serial number
  const isExcelDate = (value) => {
    return typeof value === 'number' && value > 1 && value < 2958466; // Excel date range
  };

  // Convert Excel serial date to ISO 8601 string
  const excelDateToISO = (serial) => {
    // Excel's epoch is January 1, 1900, but it incorrectly treats 1900 as a leap year
    // So we need to account for this bug
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const date = new Date(excelEpoch.getTime() + (serial * 24 * 60 * 60 * 1000));
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  };

  // Helper function to convert various date formats to ISO 8601
  const convertToISO = (value, fieldName) => {
    if (!value) return '';
    
    // If it's already a string that looks like ISO date, return as is
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.split('T')[0]; // Keep only date part
    }
    
    // If it's an Excel serial number
    if (isExcelDate(value)) {
      return excelDateToISO(value);
    }
    
    // If it's a string that might be a date
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    // If it's already a Date object
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().split('T')[0];
    }
    
    return value; // Return original value if can't convert
  };

  const handleDateFieldChange = (index, isDateField) => {
    const newDateFields = [...dateFields];
    newDateFields[index] = isDateField;
    setDateFields(newDateFields);
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setLogs([]);
    
    if (uploadedFile) {
      addLog(`File selected: ${uploadedFile.name} (${(uploadedFile.size / 1024).toFixed(2)} KB)`, 'success');
      previewCSV(uploadedFile);
    }
  };

  const previewCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
        
        setCsvPreview(jsonData.slice(0, 3)); // Show first 3 rows
        setTotalRows(jsonData.length);
        
        // Auto-populate field names from CSV headers
        if (jsonData.length > 0) {
          const headers = Object.keys(jsonData[0]);
          setFieldNames(headers);
          
          // Auto-detect potential date fields
          const potentialDateFields = headers.map(header => {
            const sampleValue = jsonData[0][header];
            const isLikelyDate = header.toLowerCase().includes('date') || 
                               header.toLowerCase().includes('time') ||
                               isExcelDate(sampleValue);
            return isLikelyDate;
          });
          
          setDateFields(potentialDateFields);
          
          const dateFieldsDetected = potentialDateFields.filter(Boolean).length;
          addLog(`Auto-detected ${headers.length} fields: ${headers.join(', ')}`, 'info');
          if (dateFieldsDetected > 0) {
            addLog(`🗓️ Detected ${dateFieldsDetected} potential date fields`, 'info');
            setShowDateMapping(true);
          }
        }
      } catch (err) {
        addLog(`Error reading file: ${err.message}`, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFieldChange = (index, value) => {
    const newFields = [...fieldNames];
    newFields[index] = value;
    setFieldNames(newFields);
    
    // Ensure dateFields array matches fieldNames length
    if (dateFields.length !== newFields.length) {
      const newDateFields = [...dateFields];
      while (newDateFields.length < newFields.length) {
        newDateFields.push(false);
      }
      if (newDateFields.length > newFields.length) {
        newDateFields.splice(newFields.length);
      }
      setDateFields(newDateFields);
    }
  };

  const addField = () => {
    setFieldNames([...fieldNames, '']);
    setDateFields([...dateFields, false]);
  };

  const removeField = (index) => {
    if (fieldNames.length > 1) {
      const newFields = [...fieldNames];
      newFields.splice(index, 1);
      setFieldNames(newFields);
      
      const newDateFields = [...dateFields];
      newDateFields.splice(index, 1);
      setDateFields(newDateFields);
    }
  };

  const handleCustomHeaderChange = (index, key, value) => {
    const newHeaders = [...customHeaders];
    newHeaders[index] = { ...newHeaders[index], [key]: value };
    setCustomHeaders(newHeaders);
  };

  const addCustomHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  };

  const removeCustomHeader = (index) => {
    if (customHeaders.length > 1) {
      const newHeaders = [...customHeaders];
      newHeaders.splice(index, 1);
      setCustomHeaders(newHeaders);
    }
  };

  const validateInputs = () => {
    const errors = [];
    
    if (!file) errors.push('Please upload a CSV file');
    if (!baseUrl.trim()) errors.push('Base URL is required');
    if (!apiEndpoint.trim()) errors.push('API Endpoint is required');
    if (!authToken.trim()) errors.push('Auth Token is required');
    if (fieldNames.filter(f => f.trim()).length === 0) errors.push('At least one field name is required');
    
    // Validate URL format
    try {
      new URL(baseUrl + apiEndpoint);
    } catch {
      errors.push('Invalid URL format');
    }

    return errors;
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const parseCSVAndSubmit = async () => {
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => addLog(error, 'error'));
      setStatus('❌ Please fix the validation errors above');
      return;
    }

    setIsLoading(true);
    setStatus('🔄 Processing...');
    setLogs([]);

    const cleanedFieldNames = fieldNames.map(f => f.trim()).filter(Boolean);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    // Add custom headers
    customHeaders.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        headers[key.trim()] = value.trim();
      }
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

        addLog(`Starting submission of ${jsonData.length} rows`, 'info');

        let successCount = 0;
        let failCount = 0;
        const failedRows = [];

        // Process in batches
        for (let i = 0; i < jsonData.length; i += batchSize) {
          const batch = jsonData.slice(i, i + batchSize);
          
          for (const [rowIndex, row] of batch.entries()) {
            const actualRowIndex = i + rowIndex + 1;
            
            try {
              const payload = {};
              cleanedFieldNames.forEach((field, fieldIndex) => {
                let value = row[field] !== undefined ? row[field] : '';
                
                // Convert date fields to ISO format if marked as date
                if (dateFields[fieldIndex] && value) {
                  const originalValue = value;
                  value = convertToISO(value, field);
                  
                  // Log conversion for debugging
                  if (originalValue !== value && successCount === 0) {
                    addLog(`🗓️ Converting ${field}: ${originalValue} → ${value}`, 'info');
                  }
                }
                
                payload[field] = value;
              });

              const response = await fetch(`${baseUrl}${apiEndpoint}`, {
                method: requestMethod,
                headers,
                body: JSON.stringify(payload),
              });

              if (response.ok) {
                successCount++;
                if (successCount % 10 === 0) {
                  addLog(`✅ Processed ${successCount} rows successfully`, 'success');
                }
              } else {
                failCount++;
                const errorText = await response.text();
                failedRows.push({
                  row: actualRowIndex,
                  status: response.status,
                  error: errorText
                });
                addLog(`❌ Row ${actualRowIndex} failed: ${response.status} ${response.statusText}`, 'error');
              }
            } catch (err) {
              failCount++;
              failedRows.push({
                row: actualRowIndex,
                error: err.message
              });
              addLog(`❌ Row ${actualRowIndex} error: ${err.message}`, 'error');
            }

            // Add delay between requests if specified
            if (delay > 0 && (i + rowIndex) < jsonData.length - 1) {
              await sleep(delay);
            }
          }

          // Update progress
          const processed = Math.min(i + batchSize, jsonData.length);
          setStatus(`🔄 Processing... ${processed}/${jsonData.length} (${Math.round((processed / jsonData.length) * 100)}%)`);
        }

        // Final status
        const finalStatus = `✅ Complete! Success: ${successCount} | ❌ Failed: ${failCount}`;
        setStatus(finalStatus);
        addLog(finalStatus, successCount > 0 ? 'success' : 'error');

        if (failedRows.length > 0) {
          addLog(`Failed rows: ${failedRows.map(f => f.row).join(', ')}`, 'error');
        }

      } catch (err) {
        const errorMsg = `Error processing file: ${err.message}`;
        addLog(errorMsg, 'error');
        setStatus(`❌ ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="space-y-6">
                {/* API Configuration */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-blue-600" />
                    API Configuration
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
                      <input
                        type="url"
                        placeholder="https://api.example.com"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
                      <input
                        type="text"
                        placeholder="/api/v1/data"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <Upload className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                  {file && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {file.name} - {totalRows} rows detected
                    </div>
                  )}
                </div>

                {/* Field Mapping */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field Mapping</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {fieldNames.map((field, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder={`Field ${index + 1}`}
                          value={field}
                          onChange={(e) => handleFieldChange(index, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <label className="flex items-center text-xs text-gray-600 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={dateFields[index] || false}
                            onChange={(e) => handleDateFieldChange(index, e.target.checked)}
                            className="mr-1 w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                          />
                          Date
                        </label>
                        <button
                          onClick={() => removeField(index)}
                          disabled={fieldNames.length === 1}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addField}
                    className="mt-2 w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </button>
                  
                  {/* Date Conversion Info */}
                  {dateFields.some(Boolean) && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">🗓️ Date Conversion Active</div>
                        <div className="text-xs">
                          Excel dates (like 45848) will be converted to ISO format (YYYY-MM-DD).
                          <br />
                          Example: 45848 → 2025-07-15
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced Settings */}
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

                      {/* Custom Headers */}
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

                {/* Submit Button */}
                <button
                  onClick={parseCSVAndSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Processing...' : 'Submit CSV Data'}
                </button>

                {/* Status */}
                {status && (
                  <div className={`p-4 rounded-xl text-center font-medium ${
                    status.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
                    status.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {status}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CSV Preview */}
            {csvPreview.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  CSV Preview
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(csvPreview[0]).map(key => (
                          <th key={key} className="text-left p-2 font-medium text-gray-700">{key}</th>
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

            {/* Activity Log */}
            {logs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Activity Log
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className={`flex items-start text-sm p-2 rounded-lg ${
                      log.type === 'error' ? 'bg-red-50 text-red-700' :
                      log.type === 'success' ? 'bg-green-50 text-green-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      <div className="mr-2 mt-0.5">
                        {log.type === 'error' ? <XCircle className="w-4 h-4" /> :
                         log.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                         <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{log.message}</div>
                        <div className="text-xs opacity-75">{log.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;