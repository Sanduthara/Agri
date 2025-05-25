import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useOrderStore, OrderData } from '../store/orderStore';
import { ArrowLeft, Check, X, Clock, AlertCircle, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetail = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { updateOrderStatus, cancelOrder, fetchOrderById } = useOrderStore();

    const [order, setOrder] = useState<OrderData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return;

            setIsLoading(true);
            try {
                // Use the store function to fetch order details
                const orderData = await fetchOrderById(orderId);

                if (orderData) {
                    setOrder(orderData);
                } else {
                    throw new Error('Failed to fetch order details');
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Failed to load order details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, fetchOrderById]);

    const handleStatusChange = async (newStatus: 'pending' | 'completed' | 'cancelled') => {
        if (!orderId) return;

        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result) {
                setOrder((prev: OrderData | null) => prev ? { ...prev, status: newStatus } : null);
                toast.success(`Order status updated to ${newStatus}`);
            }
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const handleCancelOrder = async () => {
        if (!orderId) return;

        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                const result = await cancelOrder(orderId);
                if (result) {
                    toast.success('Order cancelled successfully');
                    navigate('/orders');
                }
            } catch (error) {
                toast.error('Failed to cancel order');
            }
        }
    };

    // Format date to readable string
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const isAdmin = user?.role === 'admin';

    // Get appropriate status badge
    const getStatusBadge = (status: string | undefined) => {
        if (!status) return null;

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-medium text-red-700">{error || 'Order not found'}</h2>
                <button
                    onClick={() => navigate('/orders')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/orders')}
                className="flex items-center text-blue-600 mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Orders
            </button>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-semibold">Order Details</h1>
                        {getStatusBadge(order.status)}
                    </div>
                    <p className="text-gray-600 mt-1">Order ID: {order._id || order.id}</p>
                    <p className="text-gray-600">Placed on: {formatDate(order.createdAt)}</p>
                </div>

                <div className="p-6 border-b">
                    <h2 className="text-lg font-medium mb-4">Items</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {order.items && order.items.map((item: any, index: number) => (
                                    <tr key={index}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-12 w-12 object-cover rounded mr-3"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                    <div className="text-sm text-gray-500">ID: {item.productId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">${(item.price || 0).toFixed(2)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{item.quantity || 1}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t">
                                    <td colSpan={3} className="px-4 py-3 text-right font-medium">Total:</td>
                                    <td className="px-4 py-3 font-medium">${(order.totalAmount || 0).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>                <div className="p-6">
                    {order.status === 'pending' && (
                        <div className="flex space-x-4">
                            {isAdmin && (
                                <button
                                    onClick={() => handleStatusChange('completed')}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark as Completed
                                </button>
                            )}

                            <button
                                onClick={() => navigate(`/edit-order/${orderId}`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Order
                            </button>

                            <button
                                onClick={handleCancelOrder}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel Order
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
