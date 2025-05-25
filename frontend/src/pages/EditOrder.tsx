import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore, OrderData } from '../store/orderStore';
import { useProductStore } from '../store/productStore';
import { ArrowLeft, Save, Plus, Minus, Trash, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '../types';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

const EditOrder = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { fetchOrderById, updateOrder } = useOrderStore();
    const { products, fetchProducts } = useProductStore();

    const [order, setOrder] = useState<OrderData | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            // Load products
            await fetchProducts();

            // Load order
            if (orderId) {
                try {
                    const orderData = await fetchOrderById(orderId);

                    if (orderData && orderData.status === 'pending') {
                        setOrder(orderData);
                        setItems(orderData.items);
                        calculateTotal(orderData.items);
                    } else {
                        throw new Error(orderData?.status !== 'pending' ?
                            'Only pending orders can be edited' :
                            'Failed to load order details');
                    }
                } catch (err) {
                    console.error('Error loading order for editing:', err);
                    setError(err instanceof Error ? err.message : 'Failed to load order');
                }
            }

            setIsLoading(false);
        };

        loadData();
    }, [orderId, fetchOrderById, fetchProducts]);

    // Calculate order total whenever items change
    const calculateTotal = (orderItems: OrderItem[]) => {
        const total = orderItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        setTotalAmount(total);
    };

    const handleQuantityChange = (index: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        const updatedItems = [...items];
        updatedItems[index].quantity = newQuantity;
        setItems(updatedItems);
        calculateTotal(updatedItems);
    };

    const handleRemoveItem = (index: number) => {
        const updatedItems = [...items];
        updatedItems.splice(index, 1);
        setItems(updatedItems);
        calculateTotal(updatedItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderId || items.length === 0) {
            toast.error('Cannot save an order with no items');
            return;
        }

        setIsSubmitting(true);
        try {
            // Update the order with new items and total
            const result = await updateOrder(orderId, {
                items,
                totalAmount
            });

            if (result) {
                toast.success('Order updated successfully');
                navigate(`/orders/${orderId}`);
            } else {
                throw new Error('Failed to update order');
            }
        } catch (err) {
            console.error('Error updating order:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to update order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openAddProductModal = () => {
        setShowAddProductModal(true);
        setSearchQuery('');
        setSelectedProduct(null);
        setSelectedQuantity(1);
    };

    const closeAddProductModal = () => {
        setShowAddProductModal(false);
    };

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleAddToOrder = () => {
        if (!selectedProduct) return;

        // Check if this product is already in the order
        const existingItemIndex = items.findIndex(item => item.productId === selectedProduct.id);

        if (existingItemIndex !== -1) {
            // Update quantity of existing item
            const updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += selectedQuantity;
            setItems(updatedItems);
            calculateTotal(updatedItems);
            toast.success(`Updated quantity of ${selectedProduct.name}`);
        } else {
            // Add as new item
            const newItem: OrderItem = {
                productId: selectedProduct.id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                quantity: selectedQuantity,
                image: selectedProduct.image
            };

            const updatedItems = [...items, newItem];
            setItems(updatedItems);
            calculateTotal(updatedItems);
            toast.success(`Added ${selectedProduct.name} to order`);
        }

        closeAddProductModal();
    };

    // Filter products based on search query
    const filteredProducts = searchQuery.trim() === ''
        ? products
        : products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

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
                <div className="text-xl font-medium text-red-700 mb-4">{error || 'Order not found'}</div>
                <button
                    onClick={() => navigate('/orders')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(`/orders/${orderId}`)}
                    className="flex items-center text-blue-600"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Order Details
                </button>
                <h1 className="text-2xl font-semibold">Edit Order</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-medium">Order ID: {order._id || order.id}</h2>
                            <p className="text-gray-600">Customer ID: {order.customerId}</p>
                        </div>
                        <div className="text-lg font-medium">
                            Total: ${totalAmount.toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-b">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Items</h3>
                        <button
                            type="button"
                            onClick={openAddProductModal}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <tr key={`${item.productId}-${index}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {item.image && (
                                                    <img
                                                        src={`http://localhost:8000${item.image}`}
                                                        alt={item.name}
                                                        className="h-10 w-10 object-cover rounded mr-3"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-sm text-gray-500">ID: {item.productId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            ${item.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-10 text-center">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {items.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No items in order. Add some items or cancel editing.
                        </div>
                    )}
                </div>

                <div className="p-6 flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate(`/orders/${orderId}`)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || items.length === 0}
                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ${isSubmitting || items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Add Product Modal */}
            {showAddProductModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-medium">Add Product to Order</h3>
                            <button
                                type="button"
                                onClick={closeAddProductModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <div className="flex items-center border rounded-md overflow-hidden">
                                <div className="p-2 bg-gray-50">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 p-2 outline-none"
                                />
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="border rounded-lg overflow-hidden mb-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => handleProductSelect(product)}
                                        className={`border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors ${selectedProduct?.id === product.id ? 'border-blue-500 bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex justify-center mb-3">
                                            <img
                                                src={`http://localhost:8000${product.image}`}
                                                alt={product.name}
                                                className="h-24 w-24 object-cover rounded-md"
                                            />
                                        </div>
                                        <h4 className="font-medium">{product.name}</h4>
                                        <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                                        <p className="text-sm text-gray-500 mt-1">{product.quantity} in stock</p>
                                    </div>
                                ))}

                                {filteredProducts.length === 0 && (
                                    <div className="col-span-3 text-center py-8 text-gray-500">
                                        No products found. Try a different search term.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quantity and Add Button */}
                        {selectedProduct && (
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="mr-4">Quantity:</span>
                                        <div className="flex items-center border rounded overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={selectedQuantity}
                                                onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-16 text-center p-1 outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddToOrder}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add to Order
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditOrder;
