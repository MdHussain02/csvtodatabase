import React from 'react';
import { Upload, FileText } from 'lucide-react';

const FileUpload = ({ file, handleFileChange, csvPreview, totalRows }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
      <div className="relative">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="w-full h-15 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
  );
};

export default FileUpload;