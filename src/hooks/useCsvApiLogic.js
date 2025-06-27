import { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';

const useCsvApiLogic = () => {
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('baseUrl') || '');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || '');
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
  const [imageFields, setImageFields] = useState([]);
  const [uploadedImages, setUploadedImages] = useState({});

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
  }, []);

  const saveApiConfig = useCallback(() => {
    localStorage.setItem('baseUrl', baseUrl);
    localStorage.setItem('authToken', authToken);
    addLog('API configuration saved to local storage', 'success');
  }, [baseUrl, authToken, addLog]);

  const isExcelDate = (value) => {
    return typeof value === 'number' && value > 1 && value < 2958466;
  };

  const excelDateToISO = (serial) => {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  };

  const convertToISO = (value, fieldName) => {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.split('T')[0];
    }
    if (isExcelDate(value)) {
      return excelDateToISO(value);
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().split('T')[0];
    }
    return value;
  };

  const handleImageUpload = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages((prev) => ({
          ...prev,
          [index]: e.target.result, // Store base64 string
        }));
        addLog(`🖼️ Image uploaded for field ${fieldNames[index] || index + 1}: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setLogs([]);
    setUploadedImages({});
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
        setCsvPreview(jsonData.slice(0, 3));
        setTotalRows(jsonData.length);
        if (jsonData.length > 0) {
          const headers = Object.keys(jsonData[0]);
          setFieldNames(headers);
          const potentialDateFields = headers.map((header) => {
            const sampleValue = jsonData[0][header];
            const isLikelyDate =
              header.toLowerCase().includes('date') ||
              header.toLowerCase().includes('time') ||
              isExcelDate(sampleValue);
            return isLikelyDate;
          });
          setDateFields(potentialDateFields);
          setImageFields(new Array(headers.length).fill(false));
          const dateFieldsDetected = potentialDateFields.filter(Boolean).length;
          addLog(`Auto-detected ${headers.length} fields: ${headers.join(', ')}`, 'info');
          if (dateFieldsDetected > 0) {
            addLog(`🗓️ Detected ${dateFieldsDetected} potential date fields`, 'info');
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
    if (dateFields.length !== newFields.length) {
      const newDateFields = [...dateFields];
      const newImageFields = [...imageFields];
      while (newDateFields.length < newFields.length) {
        newDateFields.push(false);
        newImageFields.push(false);
      }
      if (newDateFields.length > newFields.length) {
        newDateFields.splice(newFields.length);
        newImageFields.splice(newFields.length);
      }
      setDateFields(newDateFields);
      setImageFields(newImageFields);
    }
  };

  const handleDateFieldChange = (index, isDateField) => {
    const newDateFields = [...dateFields];
    newDateFields[index] = isDateField;
    setDateFields(newDateFields);
  };

  const handleImageFieldChange = (index, isImageField) => {
    const newImageFields = [...imageFields];
    newImageFields[index] = isImageField;
    setImageFields(newImageFields);
    if (!isImageField) {
      setUploadedImages((prev) => {
        const newImages = { ...prev };
        delete newImages[index];
        return newImages;
      });
    }
  };

  const addField = () => {
    setFieldNames([...fieldNames, '']);
    setDateFields([...dateFields, false]);
    setImageFields([...imageFields, false]);
  };

  const removeField = (index) => {
    if (fieldNames.length > 1) {
      const newFields = [...fieldNames];
      newFields.splice(index, 1);
      setFieldNames(newFields);
      const newDateFields = [...dateFields];
      newDateFields.splice(index, 1);
      setDateFields(newDateFields);
      const newImageFields = [...imageFields];
      newImageFields.splice(index, 1);
      setImageFields(newImageFields);
      setUploadedImages((prev) => {
        const newImages = { ...prev };
        delete newImages[index];
        return newImages;
      });
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
    if (fieldNames.filter((f) => f.trim()).length === 0) errors.push('At least one field name is required');
    try {
      new URL(baseUrl + apiEndpoint);
    } catch {
      errors.push('Invalid URL format');
    }
    imageFields.forEach((isImage, index) => {
      if (isImage && !uploadedImages[index]) {
        errors.push(`Please upload an image for field ${fieldNames[index] || index + 1}`);
      }
    });
    return errors;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const parseCSVAndSubmit = async () => {
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => addLog(error, 'error'));
      setStatus('❌ Please fix the validation errors above');
      return;
    }
    setIsLoading(true);
    setStatus('🔄 Processing...');
    setLogs([]);
    const cleanedFieldNames = fieldNames.map((f) => f.trim()).filter(Boolean);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };
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
        for (let i = 0; i < jsonData.length; i += batchSize) {
          const batch = jsonData.slice(i, i + batchSize);
          for (const [rowIndex, row] of batch.entries()) {
            const actualRowIndex = i + rowIndex + 1;
            try {
              const payload = {};
              cleanedFieldNames.forEach((field, fieldIndex) => {
                let value = row[field] !== undefined ? row[field] : '';
                if (dateFields[fieldIndex] && value) {
                  const originalValue = value;
                  value = convertToISO(value, field);
                  if (originalValue !== value && successCount === 0) {
                    addLog(`🗓️ Converting ${field}: ${originalValue} → ${value}`, 'info');
                  }
                }
                if (imageFields[fieldIndex]) {
                  value = uploadedImages[fieldIndex] || '';
                  if (successCount === 0) {
                    addLog(`🖼️ Using uploaded image for ${field}`, 'info');
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
                  error: errorText,
                });
                addLog(`❌ Row ${actualRowIndex} failed: ${response.status} ${response.statusText}`, 'error');
              }
            } catch (err) {
              failCount++;
              failedRows.push({
                row: actualRowIndex,
                error: err.message,
              });
              addLog(`❌ Row ${actualRowIndex} error: ${err.message}`, 'error');
            }
            if (delay > 0 && i + rowIndex < jsonData.length - 1) {
              await sleep(delay);
            }
          }
          const processed = Math.min(i + batchSize, jsonData.length);
          setStatus(`🔄 Processing... ${processed}/${jsonData.length} (${Math.round((processed / jsonData.length) * 100)}%)`);
        }
        const finalStatus = `✅ Complete! Success: ${successCount} | ❌ Failed: ${failCount}`;
        setStatus(finalStatus);
        addLog(finalStatus, successCount > 0 ? 'success' : 'error');
        if (failedRows.length > 0) {
          addLog(`Failed rows: ${failedRows.map((f) => f.row).join(', ')}`, 'error');
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

  return {
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
  };
};

export default useCsvApiLogic;