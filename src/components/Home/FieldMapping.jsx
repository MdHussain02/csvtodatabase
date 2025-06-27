import { Calendar, FolderClosed, Image, Plus, RemoveFormatting } from 'lucide-react';

const FieldMapping = ({
  fieldNames,
  dateFields,
  imageFields,
  handleFieldChange,
  handleDateFieldChange,
  handleImageFieldChange,
  handleImageUpload,
  addField,
  removeField,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Field Mapping</label>
      <div className="space-y-2 max-h-100 overflow-y-auto">
        {fieldNames.map((field, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder={`Field ${index + 1}`}
              value={field}
              onChange={(e) => handleFieldChange(index, e.target.value)}
              className="flex-1 p-2 border  h-6 max-w-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <label className="flex items-center text-xs text-gray-600 whitespace-nowrap">
              <input
                type="checkbox"
                checked={dateFields[index] || false}
                onChange={(e) => handleDateFieldChange(index, e.target.checked)}
                className="mr-1 w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
              />
              <Calendar className="w-3 h-3 mr-1" />
              Date
            </label>
            <label className="flex items-center text-xs text-gray-600 whitespace-nowrap">
              <input
                type="checkbox"
                checked={imageFields[index] || false}
                onChange={(e) => handleImageFieldChange(index, e.target.checked)}
                className="mr-1 w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
              />
              <Image className="w-3 h-3 mr-1" />
              Image
            </label>
            {imageFields[index] && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e.target.files[0])}
                className="flex-1 p-1 border border-gray-300 max-w-20 rounded-lg text-xs"
              />
            )}
            <button
              onClick={() => removeField(index)}
              disabled={fieldNames.length === 1}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addField}
        className="mt-2 w-half bg-blue-500 text-white p-2 text-xs rounded hover:bg-blue-600 transition-all flex items-center justify-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Field
      </button>
      {(dateFields.some(Boolean) || imageFields.some(Boolean)) && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">🗓️ Conversions Active</div>
            <div className="text-xs">
              {dateFields.some(Boolean) && (
                <p>
                  Excel dates (e.g., 45848) will be converted to ISO format (YYYY-MM-DD).
                  <br />
                  Example: 45848 → 2025-07-15
                </p>
              )}
              {imageFields.some(Boolean) && (
                <p>Uploaded images will be sent as base64-encoded strings in the API payload.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldMapping;