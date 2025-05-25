import { useEffect, useState } from 'react';
import { useOrderStore, OrderData } from '../store/orderStore';
import { useProductStore } from '../store/productStore';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer
} from 'recharts';
import { Check, X, AlertCircle, ExternalLink, FileText, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminOrderDashboard = () => {
    const { orders, isLoading, error, fetchOrders, updateOrderStatus, cancelOrder } = useOrderStore();
    const { totalOrders, fetchTotalOrders } = useProductStore();

    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: '',
    });
    const [statusStats, setStatusStats] = useState<{ name: string, value: number }[]>([]);
    const [monthlyOrderCounts, setMonthlyOrderCounts] = useState<{ name: string, orders: number }[]>([]);
    const [mostOrderedProducts, setMostOrderedProducts] = useState<{ name: string, count: number }[]>([]);

    useEffect(() => {
        fetchOrders();
        fetchTotalOrders();
    }, [fetchOrders, fetchTotalOrders]);

    useEffect(() => {
        if (orders.length > 0) {
            // Calculate status statistics
            const statusCounts = orders.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const statusData = Object.entries(statusCounts).map(([name, value]) => ({
                name,
                value
            }));

            setStatusStats(statusData);

            // Calculate monthly order counts (last 6 months)
            const now = new Date();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const monthlyData = Array(6).fill(0).map((_, i) => {
                const month = new Date(now);
                month.setMonth(now.getMonth() - i);
                const monthYear = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;

                // Count orders for this month
                const count = orders.filter(order => {
                    if (!order.createdAt) return false;
                    const orderDate = new Date(order.createdAt);
                    return orderDate.getMonth() === month.getMonth() &&
                        orderDate.getFullYear() === month.getFullYear();
                }).length;

                return {
                    name: monthYear,
                    orders: count
                };
            }).reverse();

            setMonthlyOrderCounts(monthlyData);

            // Calculate most ordered products
            const productCounts: Record<string, { name: string, count: number }> = {};

            orders.forEach(order => {
                order.items.forEach(item => {
                    if (!productCounts[item.productId]) {
                        productCounts[item.productId] = {
                            name: item.name || 'Unknown Product',
                            count: 0
                        };
                    }
                    productCounts[item.productId].count += item.quantity;
                });
            });

            const topProducts = Object.values(productCounts)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setMostOrderedProducts(topProducts);
        }
    }, [orders]);

    // Filter orders based on status, search term, and date range
    const filteredOrders = orders.filter((order) => {
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;

        const matchesSearch = searchTerm === '' ||
            (order._id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.customerId?.toLowerCase().includes(searchTerm.toLowerCase()));

        let matchesDateRange = true;
        if (dateFilter.startDate && dateFilter.endDate && order.createdAt) {
            const orderDate = new Date(order.createdAt);
            const startDate = new Date(dateFilter.startDate);
            const endDate = new Date(dateFilter.endDate);
            endDate.setHours(23, 59, 59); // Include the full end date

            matchesDateRange = orderDate >= startDate && orderDate <= endDate;
        }

        return matchesStatus && matchesSearch && matchesDateRange;
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
    };

    // Generate PDF report for orders
    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Add title and date
        const title = "Orders Report";
        const today = new Date().toLocaleDateString();
        const titleWidth = doc.getStringUnitWidth(title) * 14 / doc.internal.scaleFactor;
        const titleX = (pageWidth - titleWidth) / 2;

        doc.setFontSize(18);
        doc.text(title, titleX, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${today}`, 14, 28);

        // Add filters applied
        doc.setFontSize(11);
        doc.text(`Filters: Status - ${selectedStatus}, Date Range: ${dateFilter.startDate || 'All'} to ${dateFilter.endDate || 'All'}`, 14, 35);

        // Add summary data
        doc.setFontSize(13);
        doc.text("Order Summary", 14, 45);

        const summaryData = [
            ["Total Orders", orders.length.toString()],
            ["Pending Orders", orders.filter(o => o.status === 'pending').length.toString()],
            ["Completed Orders", orders.filter(o => o.status === 'completed').length.toString()],
            ["Cancelled Orders", orders.filter(o => o.status === 'cancelled').length.toString()],
        ];

        autoTable(doc, {
            startY: 50,
            head: [["Metric", "Count"]],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
            margin: { left: 14 },
            width: pageWidth - 28
        });

        // Add orders table
        doc.setFontSize(13);
        doc.text("Orders List", 14, doc.lastAutoTable.finalY + 15);

        const tableColumn = ["Order ID", "Customer ID", "Total Amount", "Status", "Date"];
        const tableRows = filteredOrders.map((order) => [
            order._id || order.id || '',
            order.customerId || '',
            `$${order.totalAmount.toFixed(2)}`,
            order.status,
            order.createdAt ? formatDate(order.createdAt) : '-'
        ]);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
            margin: { left: 14 },
            width: pageWidth - 28
        });

        doc.save("admin_orders_report.pdf");
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
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Pending
                    </span>
                );
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Order Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Total Orders</h3>
                    <div className="text-3xl font-bold">{orders.length}</div>
                </div>

                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue</h3>
                    <div className="text-3xl font-bold">
                        ${orders
                            .filter(order => order.status !== 'cancelled')
                            .reduce((sum, order) => sum + order.totalAmount, 0)
                            .toFixed(2)}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Orders</h3>
                    <div className="text-3xl font-bold">
                        {orders.filter(order => order.status === 'pending').length}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Order Status Chart */}
                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusStats}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {statusStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Orders Chart */}
                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Orders</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={monthlyOrderCounts}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#3498db" name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products Chart */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={mostOrderedProducts}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" name="Quantity Ordered" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                    <h3 className="text-lg font-medium text-gray-900">Orders</h3>

                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <input
                            type="date"
                            className="pl-3 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                            value={dateFilter.startDate}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            placeholder="Start Date"
                        />

                        <input
                            type="date"
                            className="pl-3 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                            value={dateFilter.endDate}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                            placeholder="End Date"
                        />

                        <button
                            onClick={generatePDF}
                            className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                            <Download className="h-5 w-5 mr-1" />
                            Export Report
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-40 text-red-500">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex justify-center items-center h-40 text-gray-500">
                        No orders found matching your filters.
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
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{order.customerId.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {order.items.length} item(s)
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">${order.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm">{getStatusBadge(order.status)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {order.createdAt ? formatDate(order.createdAt) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/orders/${order._id || order.id}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="View Details"
                                                >
                                                    <ExternalLink className="h-5 w-5" />
                                                </Link>

                                                {order.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(order._id || order.id || '', 'completed')}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Mark as Completed"
                                                        >
                                                            <Check className="h-5 w-5" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleCancelOrder(order._id || order.id || '')}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Cancel Order"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </>
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

export default AdminOrderDashboard;
