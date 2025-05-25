import React from 'react';
import { X } from 'lucide-react';

interface SupportEntry {
  subject: string;
  category: "Harvest Issue" | "Crop Issue" | "Farming Advisory"; 
  description: string;
  priority: "Low" | "Medium" | "High"; 
  attachment?: File | string; 
  id?: string;  // Add `id` for editing
  farmLocation?: string; // Optional farm location
  cropType?: string; // Optional crop type
  farmSize?: string; // Optional farm size
}

interface SupportEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (supportData: Partial<SupportEntry>) => void;
  support?: SupportEntry; 
}

const SupportEntryModal: React.FC<SupportEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  support,
}) => {
  const [formData, setFormData] = React.useState<Partial<SupportEntry>>(
    support || {
      subject: '',
      category: 'Crop Issue', // Default category for farmer
      description: '',
      priority: 'Low',
      attachment: '',
      farmLocation: '', // Optional fields for farm location
      cropType: '', // Optional fields for crop type
      farmSize: '', // Optional fields for farm size
    }
  );

  if (!isOpen) return null;

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, attachment: file });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include the support id if present (for editing)
    onSubmit({ ...formData, id: support?.id }); 
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {support ? 'Edit Support Entry' : 'Add Support Entry'}
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, cropType: e.target.value as "Crop Issue" | "Equipment Issue" | "Soil Quality" | "Weather-related" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="Crop Issue">Crop Issue</option>
              <option value="Equipment Issue">Equipment Issue</option>
              <option value="Soil Quality">Soil Quality</option>
              <option value="Weather-related">Weather-related</option>
            </select>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          {/* Priority Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as "Low" | "Medium" | "High" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Attachment Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Attachment</label>
            <input
              type="file"
              accept="image/*, .pdf, .docx, .txt"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.attachment && typeof formData.attachment !== 'string' && (
              <div className="mt-2">
                <span>Attachment: {formData.attachment.name}</span>
              </div>
            )}
          </div>

          {/* Optional Fields for Farmer */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Farm Location</label>
            <input
              type="text"
              value={formData.farmLocation}
              onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Crop Type</label>
            <input
              type="text"
              value={formData.cropType}
              onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Farm Size (acres)</label>
            <input
              type="text"
              value={formData.farmSize}
              onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {support ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportEntryModal;




