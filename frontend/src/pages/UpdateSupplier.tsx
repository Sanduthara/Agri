import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

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

const UpdateSupplier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (id) {
      axios
        .get<FormData>(`http://localhost:8000/api/suppliers/${id}`)
        .then((res) => {
          const data = res.data;
          data.lastDeliveryDate = formatDate(data.lastDeliveryDate);
          setFormData(data);
        })
        .catch((err) => {
          console.error("Error fetching supplier:", err);
        });
    }
  }, [id]);

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.supplier) newErrors.supplier = "Supplier name is required";
    if (!formData.contact) newErrors.contact = "Contact is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (formData.collectedAmount < 0) newErrors.collectedAmount = "Collected amount cannot be negative";
    if (formData.deliveryCount < 0) newErrors.deliveryCount = "Delivery count cannot be negative";
    if (formData.qualityRating < 0 || formData.qualityRating > 5) newErrors.qualityRating = "Quality rating must be between 0 and 5";
    if (!formData.lastDeliveryDate) newErrors.lastDeliveryDate = "Last delivery date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      axios
        .put(`http://localhost:8000/api/suppliers/${id}`, formData)
        .then(() => {
          navigate("/suppliers");
        })
        .catch((err) => {
          console.error("Error updating supplier:", err);
        })
        .then(() => {
          setLoading(false);
        });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Update Supplier</h2>
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
                loading && "opacity-50 cursor-not-allowed"
              }`}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSupplier;