import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface InventoryFormData {
  item_name: string;
  quantity: number;
  warehouse_location: string;
  stored_date: string;
  expiration_date?: string;
}

interface InventoryFormErrors {
  item_name?: string;
  quantity?: string;
  warehouse_location?: string;
  stored_date?: string;
  expiration_date?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AddInventory = () => {
  const [formData, setFormData] = useState<InventoryFormData>({
    item_name: "",
    quantity: 1,
    warehouse_location: "",
    stored_date: "",
    expiration_date: "",
  });

  const [errors, setErrors] = useState<InventoryFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: InventoryFormErrors = {};
    if (!formData.item_name.trim()) newErrors.item_name = "Item name is required";
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";
    if (!formData.warehouse_location.trim()) newErrors.warehouse_location = "Warehouse location is required";
    if (!formData.stored_date) newErrors.stored_date = "Stored date is required";

    if (
      formData.expiration_date &&
      new Date(formData.expiration_date) <= new Date(formData.stored_date)
    ) {
      newErrors.expiration_date = "Expiration date must be after stored date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (validate() && !isSubmitting) {
      setIsSubmitting(true);

      try {
        const payload = {
          ...formData,
          quantity: Number(formData.quantity),
          expiration_date: formData.expiration_date || null,
        };

        const response = await axios.post("http://localhost:5000/api/inventory", payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 201) {
          navigate("/inventory");
        }
      } catch (err: any) {
        console.error("Error adding inventory:", err);
        setServerError(
          err.response?.data?.message ||
          err.message ||
          "Failed to add inventory. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue =
      name === "stored_date" || name === "expiration_date"
        ? formatDate(value)
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Add New Inventory Item</h2>
        {serverError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Item Name</label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.item_name && <p className="text-red-500 text-xs mt-1">{errors.item_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min={1}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Warehouse Location</label>
              <input
                type="text"
                name="warehouse_location"
                value={formData.warehouse_location}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.warehouse_location && (
                <p className="text-red-500 text-xs mt-1">{errors.warehouse_location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stored Date</label>
              <input
                type="date"
                name="stored_date"
                value={formData.stored_date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.stored_date && <p className="text-red-500 text-xs mt-1">{errors.stored_date}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Expiration Date (Optional)</label>
              <input
                type="date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.expiration_date && (
                <p className="text-red-500 text-xs mt-1">{errors.expiration_date}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full p-2 rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isSubmitting && "opacity-50 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Adding..." : "Add Inventory Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventory;
