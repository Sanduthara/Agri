import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Trash2, Edit, Search, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const Home = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/auth/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const usersData = await response.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/auth/${userId}`,
          { method: "DELETE", headers: { "Content-Type": "application/json" } }
        );
        if (!response.ok) throw new Error("Failed to delete user");
        setUsers(users.filter((user) => user._id !== userId));
        alert("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({ name: user.name, email: user.email, role: user.role });
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/auth/${editingUser._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        }
      );
      if (!response.ok) throw new Error("Failed to update user");
      setUsers(
        users.map((user) =>
          user._id === editingUser._id ? { ...user, ...editFormData } : user
        )
      );
      setEditingUser(null);
      alert("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("User Accounts Report", 14, 20);

    const tableColumn = ["Name", "Email", "Role", "Created"];
    const tableRows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      formatDate(user.createdAt),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("user_accounts_report.pdf");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Welcome back, {currentUser?.name}!
      </h1>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">User Accounts</h3>
          <div className="flex space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={generatePDF}
              className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              <FileText className="h-5 w-5 mr-1" />
              Generate PDF
            </button>
          </div>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Edit User</h3>
              <form onSubmit={handleEditSubmit}>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="Name"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="Email"
                  required
                />
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  className="w-full mb-2 p-2 border rounded"
                  required
                >
                  <option value="user">User</option>
                  <option value="delivery">Delivery</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-gray-500">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
