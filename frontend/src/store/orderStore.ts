import { create } from 'zustand';
import axios from 'axios';
import { Order } from '../types';

// Updated Order interface to match backend model
interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface OrderData {
    _id?: string;
    id?: string;
    customerId: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'completed' | 'cancelled';
    createdAt?: string;
    updatedAt?: string;
}

interface OrderState {
    orders: OrderData[];
    userOrders: OrderData[];
    isLoading: boolean;
    error: string | null;

    // CRUD operations
    createOrder: (orderData: Omit<OrderData, '_id' | 'id' | 'createdAt' | 'updatedAt'>) => Promise<OrderData | null>;
    fetchOrders: () => Promise<void>;
    fetchUserOrders: (userId: string) => Promise<void>;
    fetchOrderById: (orderId: string) => Promise<OrderData | null>;
    updateOrder: (orderId: string, orderData: Partial<OrderData>) => Promise<OrderData | null>;
    updateOrderStatus: (orderId: string, status: 'pending' | 'completed' | 'cancelled') => Promise<OrderData | null>;
    cancelOrder: (orderId: string) => Promise<boolean>;
}

const API_URL = 'http://localhost:8000/api/orders';

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    userOrders: [],
    isLoading: false,
    error: null,    // Create a new order
    createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/create`, orderData);
            console.log('Order created:', response.data);
            const responseData = response.data as Record<string, any>;
            const newOrder = responseData.order;

            set((state) => ({
                orders: [...state.orders, newOrder],
                isLoading: false
            }));

            return newOrder;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
            console.error('Error creating order:', error);
            set({ isLoading: false, error: errorMessage });
            return null;
        }
    },    // Fetch all orders (admin access)
    fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/all`);
            console.log('Orders response:', response.data);

            // Check if response.data is an array or if it contains the array in a property
            let ordersArray: any[] = [];
            if (Array.isArray(response.data)) {
                ordersArray = response.data;
            } else if (response.data && typeof response.data === 'object') {
                // Try to find the array in common response structures
                const responseObj = response.data as Record<string, any>;
                ordersArray = responseObj.orders || responseObj.data || [];
            }

            // Map backend orders to frontend format with id property
            const mappedOrders = ordersArray.map((order: any) => ({
                ...order,
                id: order._id || order.id,
            }));

            set({ orders: mappedOrders, isLoading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
            console.error('Error fetching orders:', error);
            set({ isLoading: false, error: errorMessage });
        }
    },    // Fetch orders for a specific user
    fetchUserOrders: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            console.log('User orders response:', response.data);

            // Check if response.data is an array or if it contains the array in a property
            let ordersArray: any[] = [];
            if (Array.isArray(response.data)) {
                ordersArray = response.data;
            } else if (response.data && typeof response.data === 'object') {
                // Try to find the array in common response structures
                const responseObj = response.data as Record<string, any>;
                ordersArray = responseObj.orders || responseObj.data || [];
            }

            // Map backend orders to frontend format with id property
            const mappedOrders = ordersArray.map((order: any) => ({
                ...order,
                id: order._id || order.id,
            }));

            set({ userOrders: mappedOrders, isLoading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user orders';
            console.error('Error fetching user orders:', error);
            set({ isLoading: false, error: errorMessage });
        }
    },    // Fetch order by ID
    fetchOrderById: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/${orderId}`);
            console.log('Order details response:', response.data);

            // Process the order data
            const orderData = response.data;

            // Ensure the order has the expected structure
            const formattedOrder: OrderData = {
                _id: orderData._id || orderData.id,
                id: orderData._id || orderData.id,
                customerId: orderData.customerId || '',
                items: Array.isArray(orderData.items) ? orderData.items : [],
                totalAmount: orderData.totalAmount || 0,
                status: orderData.status || 'pending',
                createdAt: orderData.createdAt,
                updatedAt: orderData.updatedAt
            };

            set({ isLoading: false });
            return formattedOrder;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
            console.error('Error fetching order details:', error);
            set({ isLoading: false, error: errorMessage });
            return null;
        }
    },    // Update an order
    updateOrder: async (orderId, orderData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.put(`${API_URL}/updateOrder`, {
                orderId,
                ...orderData
            });

            const responseData = response.data as Record<string, any>;
            const updatedOrder = responseData.order;

            // Update orders list
            set((state) => ({
                orders: state.orders.map(order =>
                    order._id === orderId || order.id === orderId ? { ...order, ...updatedOrder } : order
                ),
                userOrders: state.userOrders.map(order =>
                    order._id === orderId || order.id === orderId ? { ...order, ...updatedOrder } : order
                ),
                isLoading: false
            }));

            return updatedOrder;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update order';
            console.error('Error updating order:', error);
            set({ isLoading: false, error: errorMessage });
            return null;
        }
    },    // Update order status
    updateOrderStatus: async (orderId, status) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.put(`${API_URL}/${orderId}/status`, { status });
            const responseData = response.data as Record<string, any>;
            const updatedOrder = responseData.order;

            // Update orders list
            set((state) => ({
                orders: state.orders.map(order =>
                    order._id === orderId || order.id === orderId ? { ...order, status } : order
                ),
                userOrders: state.userOrders.map(order =>
                    order._id === orderId || order.id === orderId ? { ...order, status } : order
                ),
                isLoading: false
            }));

            return updatedOrder;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
            console.error('Error updating order status:', error);
            set({ isLoading: false, error: errorMessage });
            return null;
        }
    },    // Cancel an order
    cancelOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            await axios.delete(`${API_URL}/cancel/${orderId}`);

            // Update orders list by changing status to cancelled instead of removing
            set((state) => ({
                orders: state.orders.map(order =>
                    (order._id === orderId || order.id === orderId)
                        ? { ...order, status: 'cancelled' }
                        : order
                ),
                userOrders: state.userOrders.map(order =>
                    (order._id === orderId || order.id === orderId)
                        ? { ...order, status: 'cancelled' }
                        : order
                ),
                isLoading: false
            }));

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
            console.error('Error cancelling order:', error);
            set({ isLoading: false, error: errorMessage });
            return false;
        }
    }
}));
