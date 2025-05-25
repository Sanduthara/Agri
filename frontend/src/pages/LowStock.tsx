import { useEffect, useState } from "react";
import axios from "axios";

interface InventoryItem {
  _id: string;
  item_name: string;
  quantity: number;
  warehouse_location: string;
}

const LowStock = () => {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    axios
      .get<InventoryItem[]>("http://localhost:8000/api/inventory")
      .then((res) => {
        const filtered = res.data.filter(item => item.quantity <= 20); 
        setLowStockItems(filtered);
      })
      .catch((err) => console.error("Error fetching low stock items:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">⚠️ Low Stock Items</h1>

      {lowStockItems.length === 0 ? (
        <p>All items are sufficiently stocked! </p>
      ) : (
        <table className="w-full bg-orange-100 border rounded shadow-md">
          <thead>
            <tr className="bg-orange-300">
              <th className="p-2 border">Item Name</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Warehouse Location</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map(item => (
              <tr key={item._id} className="text-center">
                <td className="p-2 border">{item.item_name}</td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border">{item.warehouse_location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LowStock;
