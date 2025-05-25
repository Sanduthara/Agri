import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import { Check, X, AlertCircle, Clock, ExternalLink, FileText, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Orders = () => {
    const { user } = useAuthStore();
    const {
        userOrders,
        orders,
        isLoading,
        error,
        fetchOrders,
        fetchUserOrders,
        updateOrderStatus,
        cancelOrder
    } = useOrderStore();

    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                fetchOrders();
            } else {
                fetchUserOrders(user.id);
            }
        }
    }, [user, fetchOrders, fetchUserOrders]);

    const isAdmin = user?.role === 'admin';
    const displayOrders = isAdmin ? orders : userOrders;

    // Filter orders based on status and search term
    const filteredOrders = displayOrders.filter((order) => {
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        const matchesSearch = searchTerm === '' ||
            order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerId?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result) {
                toast.success(`Order status updated to ${newStatus}`);
            }
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                const result = await cancelOrder(orderId);
                if (result) {
                    toast.success('Order cancelled successfully');
                }
            } catch (error) {
                toast.error('Failed to cancel order');
            }
        }
    };

    // Format date to readable string
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };    // Generate PDF report for orders
    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text("Orders Report", 14, 20);

        const tableColumn = ["Order ID", "Customer ID", "Items", "Total Amount", "Status", "Created At"]; const tableRows = filteredOrders.map((order) => [
            order._id || order.id || "",
            order.customerId || "",
            `${Array.isArray(order.items) ? order.items.reduce((total, item) => total + (item?.quantity || 1), 0) : 0} item(s)`,
            `$${(order.totalAmount || 0).toFixed(2)}`,
            order.status || "",
            order.createdAt ? formatDate(order.createdAt) : '-'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save("orders_report.pdf");
    };

    // Generate status badge with appropriate color
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full flex items-center">
                        <X className="h-4 w-4 mr-1" />
                        Cancelled
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending
                    </span>
                );
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Orders Management</h1>

            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                    <div className="flex space-x-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="pl-3 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="pl-3 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                            onClick={generatePDF}
                            className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                            <FileText className="h-5 w-5 mr-1" />
                            Generate PDF
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-40 text-red-500">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex justify-center items-center h-40 text-gray-500">
                        No orders found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Customer ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id || order.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {(order._id || order.id)?.substring(0, 8)}...
                                        </td>                                        <td className="px-6 py-4 text-sm text-gray-900">{order.customerId.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {order.items.reduce((total, item) => total + (item.quantity || 1), 0)} item(s)
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">${order.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm">{getStatusBadge(order.status)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {order.createdAt ? formatDate(order.createdAt) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">                                            <div className="flex space-x-2">
                                            <Link
                                                to={`/orders/${order._id || order.id}`}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View Order Details"
                                            >
                                                <ExternalLink className="h-5 w-5" />
                                            </Link>

                                            {order.status === 'pending' && (
                                                <Link
                                                    to={`/edit-order/${order._id || order.id}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit Order"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                            )}

                                            {isAdmin && order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStatusChange(order._id || order.id || '', 'completed')}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="Mark as Completed"
                                                >
                                                    <Check className="h-5 w-5" />
                                                </button>
                                            )}

                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancelOrder(order._id || order.id || '')}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Cancel Order"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
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

export default Orders;
