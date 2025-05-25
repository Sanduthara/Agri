import { useEffect, useState } from "react";
import axios from "axios";

interface InventoryItem {
  _id: string;
  item_name: string;
  quantity: number;
  warehouse_location: string;
  expiration_date?: string;
}

const ExpiringItems = () => {
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    axios
      .get<InventoryItem[]>("http://localhost:8000/api/inventory")
      .then((res) => {
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);

        const filtered = res.data.filter(item => {
          if (!item.expiration_date) return false;
          const expDate = new Date(item.expiration_date);
          return expDate <= threeDaysLater && expDate >= today;
        });

        setExpiringItems(filtered);
      })
      .catch((err) => console.error("Error fetching expiring items:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ Items Nearing Expiration</h1>
      
      {expiringItems.length === 0 ? (
        <p>No items nearing expiration! 🎉</p>
      ) : (
        <table className="w-full bg-yellow-100 border rounded shadow-md">
          <thead>
            <tr className="bg-yellow-300">
              <th className="p-2 border">Item Name</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Warehouse Location</th>
              <th className="p-2 border">Expiration Date</th>
            </tr>
          </thead>
          <tbody>
            {expiringItems.map(item => (
              <tr key={item._id} className="text-center">
                <td className="p-2 border">{item.item_name}</td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border">{item.warehouse_location}</td>
                <td className="p-2 border">
                  {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpiringItems;
