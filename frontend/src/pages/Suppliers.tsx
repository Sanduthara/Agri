import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Supplier {
  _id: string;
  supplier: string;
  contact: string;
  email: string;
  collectedAmount: number;
  deliveryCount: number;
  qualityRating: number;
  lastDeliveryDate: string;
}

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch suppliers
  useEffect(() => {
    axios.get<Supplier[]>("http://localhost:8000/api/suppliers")
      .then(res => {
        console.log("Suppliers data:", res.data);
        setSuppliers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch suppliers:", err.response?.data || err.message);
        setError("Failed to load suppliers. Please try again.");
        setLoading(false);
      });
  }, []);

  // Search filter
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplier?.toLowerCase().includes(search.toLowerCase()) ||
    supplier.contact?.toLowerCase().includes(search.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(search.toLowerCase()) ||
    supplier.collectedAmount.toString().includes(search) ||
    supplier.deliveryCount.toString().includes(search) ||
    supplier.qualityRating.toString().includes(search) ||
    supplier.lastDeliveryDate.includes(search)
  );

  // Delete supplier
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteId === null) return;
    axios.delete(`http://localhost:8000/api/suppliers/${deleteId}`)
      .then(() => {
        setSuppliers(suppliers.filter(supplier => supplier._id !== deleteId));
        setShowDeleteModal(false);
      })
      .catch(err => console.error("Delete failed:", err));
  };

  // Helper: Format Date to "30 Apr 2025"
const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

  if (loading) return <p className="p-6">Loading suppliers...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (filteredSuppliers.length === 0) {
    return (
      <div className="p-6">
        <p>No suppliers found. <button
          onClick={() => navigate("/add-supplier")}
          className="text-blue-600 underline"
        >
          Add a new supplier
        </button></p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-100 via-indigo-200 to-purple-100 min-h-screen">
      {/* Add New Supplier Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/add-supplier")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Supplier
        </button>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search suppliers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md"
      />

      {/* Suppliers Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border rounded shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Supplier</th>
              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Collected Amount</th>
              <th className="p-2 border">Delivery Count</th>
              <th className="p-2 border">Quality Rating</th>
              <th className="p-2 border">Last Delivery Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier._id} className="hover:bg-gray-50">
                <td className="p-2 border">{supplier.supplier}</td>
                <td className="p-2 border">{supplier.contact}</td>
                <td className="p-2 border">{supplier.email}</td>
                <td className="p-2 border">{supplier.collectedAmount}</td>
                <td className="p-2 border">{supplier.deliveryCount}</td>
                <td className="p-2 border">{supplier.qualityRating}</td>
                <td className="p-2 border">{formatDate(supplier.lastDeliveryDate)}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => navigate(`/update-supplier/${supplier._id}`)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(supplier._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <p className="mb-4">Are you sure you want to delete this supplier?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
