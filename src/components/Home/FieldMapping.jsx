import React from 'react';
import { Calendar, ChevronDown, Image, Plus, X } from 'lucide-react';

const FieldMapping = ({
  fieldNames,
  fieldTypes,
  dateFields,
  imageFields,
  handleFieldChange,
  handleFieldTypeChange,
  handleDateFieldChange,
  handleImageFieldChange,
  handleImageUpload,
  addField,
  removeField,
}) => {
  const dataTypes = [
    { value: 'string', label: 'String', icon: '📝' },
    { value: 'number', label: 'Number', icon: '🔢' },
    { value: 'boolean', label: 'Boolean', icon: '✅' },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">🗂️</span>
        Field Mapping
      </h3>
      <div className="space-y-3">
        {fieldNames.map((field, index) => (
          <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder={`Field ${index + 1} name`}
              value={field}
              onChange={(e) => handleFieldChange(index, e.target.value)}
              className="flex-1 p-2 border h-10 max-w-48 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            
            {/* Data Type Dropdown */}
            <div className="relative">
              <select
                value={fieldTypes[index] || 'string'}
                onChange={(e) => handleFieldTypeChange(index, e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
              >
                {dataTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={dateFields[index]}
                  onChange={(e) => handleDateFieldChange(index, e.target.checked)}
                  className="mr-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <Calendar className="w-4 h-4 mr-1" />
                Date
              </label>
              
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={imageFields[index]}
                  onChange={(e) => handleImageFieldChange(index, e.target.checked)}
                  className="mr-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <Image className="w-4 h-4 mr-1" />
                Image
              </label>
            </div>

            {imageFields[index] && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e.target.files[0])}
                className="p-1 border border-gray-300 rounded-lg text-xs max-w-32"
              />
            )}
            
            <button
              onClick={() => removeField(index)}
              disabled={fieldNames.length === 1}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      
      <button
        onClick={addField}
        className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Field
      </button>

      {(dateFields.some(Boolean) || imageFields.some(Boolean) || fieldTypes.some(type => type !== 'string')) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-blue-700 font-medium">🔧 Active Conversions</span>
          </div>
          <div className="space-y-2 text-sm text-blue-700">
            {fieldTypes.some(type => type !== 'string') && (
              <div>
                <strong>Data Types:</strong> Values will be converted to specified types.
                <br />
                <span className="text-blue-600">
                  Number: "123" → 123, Boolean: "true"/"1"/"yes" → true, "false"/"0"/"no" → false
                </span>
              </div>
            )}
            {dateFields.some(Boolean) && (
              <div>
                <strong>Date Fields:</strong> Excel dates (e.g., 45848) will be converted to ISO format (YYYY-MM-DD).
                <br />
                <span className="text-blue-600">Example: 45848 → 2025-07-15</span>
              </div>
            )}
            {imageFields.some(Boolean) && (
              <div>
                <strong>Image Fields:</strong> Uploaded images will be sent as FormData with the file object to preserve original format and metadata.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldMapping;