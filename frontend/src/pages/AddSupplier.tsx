import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Define types for the form data and errors
interface FormData {
  supplier: string;
  contact: string;
  email: string;
  collectedAmount: number;
  deliveryCount: number;
  qualityRating: number;
  lastDeliveryDate: string;
}

interface Errors {
  supplier?: string;
  contact?: string;
  email?: string;
  collectedAmount?: string;
  deliveryCount?: string;
  qualityRating?: string;
  lastDeliveryDate?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AddSupplier: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    supplier: "",
    contact: "",
    email: "",
    collectedAmount: 0,
    deliveryCount: 0,
    qualityRating: 3,
    lastDeliveryDate: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>("");
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier name is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (formData.collectedAmount < 0) newErrors.collectedAmount = "Collected amount cannot be negative";
    if (formData.deliveryCount < 0) newErrors.deliveryCount = "Delivery count cannot be negative";
    if (formData.qualityRating < 0 || formData.qualityRating > 5) newErrors.qualityRating = "Quality rating must be between 0 and 5";
    if (!formData.lastDeliveryDate) newErrors.lastDeliveryDate = "Last delivery date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");

    if (validate() && !isSubmitting) {
      setIsSubmitting(true);

      try {
        const response = await axios.post(
          "http://localhost:5000/api/suppliers",
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 201) {
          navigate("/suppliers");
        }
      } catch (err: any) {
        console.error("Error adding supplier:", err);
        setServerError(
          err.response?.data?.message ||
          err.message ||
          "Failed to add supplier. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'lastDeliveryDate' && value) {
      newValue = formatDate(value);
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Add New Supplier</h2>
        {serverError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Collected Amount (kg)</label>
              <input
                type="number"
                name="collectedAmount"
                value={formData.collectedAmount}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.collectedAmount && <p className="text-red-500 text-xs mt-1">{errors.collectedAmount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Count</label>
              <input
                type="number"
                name="deliveryCount"
                value={formData.deliveryCount}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.deliveryCount && <p className="text-red-500 text-xs mt-1">{errors.deliveryCount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quality Rating (1-5)</label>
              <input
                type="number"
                name="qualityRating"
                value={formData.qualityRating}
                onChange={handleChange}
                min={1}
                max={5}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.qualityRating && <p className="text-red-500 text-xs mt-1">{errors.qualityRating}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Last Delivery Date</label>
              <input
                type="date"
                name="lastDeliveryDate"
                value={formData.lastDeliveryDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.lastDeliveryDate && <p className="text-red-500 text-xs mt-1">{errors.lastDeliveryDate}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full p-2 rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isSubmitting && "opacity-50 cursor-not-allowed"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplier;
