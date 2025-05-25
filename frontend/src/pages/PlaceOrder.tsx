import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import { ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const PlaceOrder = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { items, total, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const { createOrder } = useOrderStore();

    // Get shipping address and payment method from location state
    const { address, paymentMethod } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            toast.error('Please log in to complete your order');
            return;
        }

        if (items.length === 0) {
            navigate('/marketplace');
            toast.error('Your cart is empty');
            return;
        }

        if (!address) {
            navigate('/checkout');
            toast.error('Please complete the checkout process first');
            return;
        }
    }, [user, items, address, navigate]);

    const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaymentDetails({
            ...paymentDetails,
            [name]: value
        });
    };

    const validateForm = () => {
        // Basic validation for card payments
        if (paymentMethod === 'card') {
            if (!paymentDetails.cardNumber || !paymentDetails.cardHolder ||
                !paymentDetails.expiryDate || !paymentDetails.cvv) {
                toast.error('Please fill in all payment details');
                return false;
            }
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;
        if (!user || !user.id) {
            toast.error('User information missing');
            return;
        }

        setLoading(true);

        try {
            // Format order items from cart
            const orderItems = items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.cartQuantity,
                image: item.image
            }));

            // Create new order
            const orderData = {
                customerId: user.id,
                items: orderItems,
                totalAmount: total(),
                status: 'pending' as const,
                paymentDetails: {
                    method: paymentMethod,
                    ...paymentDetails,
                    billingAddress: address
                }
            };

            const result = await createOrder(orderData);

            if (result) {
                toast.success('Order placed successfully!');
                clearCart();
                navigate('/orders');
            } else {
                toast.error('Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('An error occurred while placing your order');
        } finally {
            setLoading(false);
        }
    };

    // Summary of items in the order
    const renderOrderSummary = () => {
        return (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div className="flex items-center">
                                {item.image && (
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded mr-3" 
                                    />
                                )}
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.cartQuantity}</p>
                                </div>
                            </div>
                            <p className="font-medium">${(item.price * item.cartQuantity).toFixed(2)}</p>
                        </div>
                    ))}

                    <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between font-medium">
                            <p>Total</p>
                            <p>${total().toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Shipping address summary
    const renderAddressSummary = () => {
        if (!address) return null;
        
        return (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
                <div className="space-y-2 text-gray-700">
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} {address.zipCode}</p>
                    <p>{address.country}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/checkout')}
                className="flex items-center text-blue-600 mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Checkout
            </button>

            <h1 className="text-2xl font-semibold mb-8">Payment & Order Confirmation</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Shipping address summary */}
                    {renderAddressSummary()}

                    {/* Payment Section */}
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-medium mb-4">Payment Details</h2>
                        <div className="mb-4">
                            <p className="font-medium mb-2">Payment Method: {paymentMethod === 'card' ? 'Credit Card' : 'Bank Transfer'}</p>
                        </div>

                        {paymentMethod === 'card' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={paymentDetails.cardNumber}
                                        onChange={handlePaymentDetailsChange}
                                        className="w-full p-2 border rounded"
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={19}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                                    <input
                                        type="text"
                                        name="cardHolder"
                                        value={paymentDetails.cardHolder}
                                        onChange={handlePaymentDetailsChange}
                                        className="w-full p-2 border rounded"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (MM/YY)</label>
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            value={paymentDetails.expiryDate}
                                            onChange={handlePaymentDetailsChange}
                                            className="w-full p-2 border rounded"
                                            placeholder="MM/YY"
                                            maxLength={5}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                        <input
                                            type="text"
                                            name="cvv"
                                            value={paymentDetails.cvv}
                                            onChange={handlePaymentDetailsChange}
                                            className="w-full p-2 border rounded"
                                            placeholder="123"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'bank' && (
                            <div className="p-4 bg-gray-50 rounded border">
                                <p className="text-gray-700">Please use the following details for bank transfer:</p>
                                <div className="mt-2 space-y-1 text-sm">
                                    <p><span className="font-medium">Bank:</span> Agricultural National Bank</p>
                                    <p><span className="font-medium">Account Name:</span> FarmConnect</p>
                                    <p><span className="font-medium">Account Number:</span> 12345678</p>
                                    <p><span className="font-medium">Sort Code:</span> 01-02-03</p>
                                    <p><span className="font-medium">Reference:</span> Your name + Order</p>
                                </div>
                                <p className="mt-3 text-gray-700 text-sm">Note: Your order will be processed after payment confirmation.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className={`px-6 py-3 flex items-center ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md`}
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <Check className="h-5 w-5 mr-2" />
                                    Place Order
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    {renderOrderSummary()}
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;
