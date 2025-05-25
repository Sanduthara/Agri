import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, X } from 'lucide-react';
import axios from 'axios';

interface Delivery {
  _id: string;
  orderNumber: string;
  customer: string;
  address: string;
  items: string;
  scheduledDate: string;
  status: 'pending' | 'in_transit' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const base = 'px-2 py-1 text-xs font-semibold rounded-full';
  const color =
    status === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : status === 'in_transit'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800';
  return <span className={`${base} ${color}`}>{status.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</span>;
};

const MetricCard = ({ icon: Icon, label, value, onClick, onDoubleClick }: { icon: any; label: string; value: number, onClick: () => void, onDoubleClick: () => void }) => (
  <div
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    className="bg-white rounded-xl shadow p-6 flex items-center transition hover:shadow-lg cursor-pointer"
  >
    <div className="bg-blue-100 p-4 rounded-full">
      <Icon className="h-7 w-7 text-blue-600" />
    </div>
    <div className="ml-5">
      <p className="text-gray-700 text-lg font-semibold">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ pending: 0, in_transit: 0, completed: 0 });
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [metricFilter, setMetricFilter] = useState<'all' | 'pending' | 'in_transit' | 'completed'>('all'); // For filtering by metric

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    filterDeliveriesByStatus();
  }, [metricFilter, deliveries]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Delivery[]>('http://localhost:8000/api/deliveries/all');
      const data = response.data;

      setDeliveries(data);
      updateMetrics(data);
    } catch {
      setError('Failed to load deliveries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateMetrics = (data: Delivery[]) => {
    const pending = data.filter(d => d.status === 'pending').length;
    const inTransit = data.filter(d => d.status === 'in_transit').length;
    const completed = data.filter(d => d.status === 'completed').length;
    setMetrics({ pending, in_transit: inTransit, completed });
  };

  const filterDeliveriesByStatus = () => {
    if (metricFilter === 'all') {
      setFilteredDeliveries(deliveries);
    } else {
      setFilteredDeliveries(deliveries.filter(d => d.status === metricFilter));
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const formatDateTime = (date: string) => new Date(date).toLocaleString();

  const handleStatusUpdate = async (id: string, status: Delivery['status']) => {
    try {
      setUpdatingId(id);
      setStatusLoading(true);

      await axios.put(`http://localhost:8000/api/deliveries/${id}/status`, { status });

      setDeliveries(prev =>
        prev.map(d => (d._id === id ? { ...d, status } : d))
      );
      updateMetrics(deliveries.map(d => (d._id === id ? { ...d, status } : d)));
    } catch {
      alert('Update failed.');
    } finally {
      setStatusLoading(false);
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-6">
      <header className="bg-white shadow mb-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-blue-600">Delivery Manager</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back 👋</h2>
          <p className="text-gray-500">Here are the latest delivery stats and actions.</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <MetricCard
            icon={Truck}
            label="Pending Deliveries"
            value={metrics.pending}
            onClick={() => setMetricFilter('pending')}
            onDoubleClick={() => setMetricFilter('all')}
          />
          <MetricCard
            icon={MapPin}
            label="In Transit"
            value={metrics.in_transit}
            onClick={() => setMetricFilter('in_transit')}
            onDoubleClick={() => setMetricFilter('all')}
          />
          <MetricCard
            icon={Clock}
            label="Completed Today"
            value={metrics.completed}
            onClick={() => setMetricFilter('completed')}
            onDoubleClick={() => setMetricFilter('all')}
          />
        </div>

        {/* Delivery Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">Order #</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Items</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 p-6">
                    No deliveries found
                  </td>
                </tr>
              )}
              {filteredDeliveries.map(d => (
                <tr key={d._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{d.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{d.customer}</div>
                    <div className="text-gray-400">{d.address}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.items}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(d.scheduledDate)}</td>
                  <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <select
                        value={d.status}
                        onChange={(e) => handleStatusUpdate(d._id, e.target.value as Delivery['status'])}
                        disabled={statusLoading && updatingId === d._id}
                        className="border p-1 rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => {
                          setSelectedDelivery(d);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Delivery Details</h3>
            <div className="space-y-3 text-sm">
              <div><strong>Order:</strong> {selectedDelivery.orderNumber}</div>
              <div><strong>Customer:</strong> {selectedDelivery.customer}</div>
              <div><strong>Address:</strong> {selectedDelivery.address}</div>
              <div><strong>Items:</strong> {selectedDelivery.items}</div>
              <div><strong>Date:</strong> {formatDateTime(selectedDelivery.scheduledDate)}</div>
              <div><strong>Status:</strong> <StatusBadge status={selectedDelivery.status} /></div>
              {selectedDelivery.createdAt && (
                <div><strong>Created:</strong> {formatDateTime(selectedDelivery.createdAt)}</div>
              )}
              {selectedDelivery.updatedAt && (
                <div><strong>Updated:</strong> {formatDateTime(selectedDelivery.updatedAt)}</div>
              )}
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
