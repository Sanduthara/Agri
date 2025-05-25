import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import axios from "axios";

interface InventoryItem {
  _id: string;
  item_name: string;
  quantity: number;
  warehouse_location: string;
  stored_date: string;
  expiration_date?: string;
}

// Helper: Format Date to "30 Apr 2025"
const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch inventory data
  useEffect(() => {
    axios
      .get<InventoryItem[]>("http://localhost:8000/api/inventory")
      .then((res) => {
        setInventory(res.data);

        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);

        // Check for expiring items
        const expiringItems = res.data.filter(item => {
          if (!item.expiration_date) return false;
          const expDate = new Date(item.expiration_date);
          return expDate <= threeDaysLater && expDate >= today;
        });

        if (expiringItems.length > 0) {
          notification.warning({
            key: "expiring-inventory-warning",
            message: "Expiring Inventory Alert!",
            description: `${expiringItems.length} item(s) will expire within 3 days. Click to view.`,
            duration: 6,
            onClick: () => {
              navigate("/expiring-items");
            },
          });
        }

        // Check for low stock items
        const lowStockItems = res.data.filter(item => item.quantity <= 5);

        if (lowStockItems.length > 0) {
          notification.error({
            key: "low-stock-warning",
            message: "Low Stock Alert!",
            description: `${lowStockItems.length} item(s) are low on stock. Click to view.`,
            duration: 6,
            onClick: () => {
              navigate("/low-stock-items");
            },
          });
        }
      })
      .catch((err) => console.error("Error fetching inventory:", err));
  }, [navigate]);

  // Filter inventory items based on search query
  const filteredInventory = inventory.filter((item) =>
    item.item_name.toLowerCase().includes(search.toLowerCase()) ||
    item.warehouse_location.toLowerCase().includes(search.toLowerCase())
  );

  // Delete inventory item
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    axios
      .delete(`http://localhost:8000/api/inventory/${deleteId}`)
      .then(() => {
        setInventory(inventory.filter((item) => item._id !== deleteId));
        setShowDeleteModal(false);
        setDeleteId(null);
      })
      .catch((err) => console.error("Failed to delete item:", err));
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-100 via-indigo-200 to-purple-100 min-h-screen">
  {/* Header + Add Button */}
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Inventory List</h1>
        <button
          onClick={() => navigate("/add-inventory")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Item
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search inventory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      {/* Inventory Table */}
      <table className="w-full bg-white border rounded shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Item Name</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Warehouse Location</th>
            <th className="p-2 border">Stored Date</th>
            <th className="p-2 border">Expiration Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.map((item) => (
            <tr key={item._id} className="text-center hover:bg-gray-100">
              <td className="p-2 border">{item.item_name}</td>
              <td className="p-2 border">{item.quantity}</td>
              <td className="p-2 border">{item.warehouse_location}</td>
              <td className="p-2 border">{formatDate(item.stored_date)}</td>
              <td className="p-2 border">
                {item.expiration_date ? formatDate(item.expiration_date) : "N/A"}
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => navigate(`/update-inventory/${item._id}`)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-600 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <p className="mb-4">Are you sure you want to delete this inventory item?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
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

export default Inventory;
