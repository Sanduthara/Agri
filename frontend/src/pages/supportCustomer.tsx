import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Plus, Edit, Trash, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import SupportEntryModal from './SupportEntryModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SupportEntry {
  id: string;
  farmerId: string;
  subject: string;  // Subject of the support ticket (Order Issue, Payment Issue, etc.)
  category: "Order Issue" | "Payment Issue" | "Product Inquiry";  // Fixed categories
  description: string;  // Detailed description of the issue
  priority: "Low" | "Medium" | "High";  // Priority of the issue (optional)
  attachment?: string | File;  // Optional file upload (attachment for the support ticket)
  createdAt: string;  // Date and time when the ticket was created
  updatedAt?: string;  // Date and time when the ticket was last updated
}

const SupportCustomer = () => {
  const { user } = useAuthStore();
  const [supportEntries, setSupportEntries] = useState<SupportEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState<SupportEntry | undefined>();

  useEffect(() => {
    fetchSupportEntries();
  }, []);

  const fetchSupportEntries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/support');
      const data = await response.json();
      setSupportEntries(data);
    } catch (error) {
      console.error('Error fetching support entries:', error);
      toast.error('Failed to load support entries');
    }
  };

  const handleAddSupport = async (supportData: Partial<SupportEntry>) => {
    try {
      const formData = new FormData();
      formData.append('subject', supportData.subject || '');
      formData.append('category', supportData.category || '');
      formData.append('description', supportData.description || '');
      formData.append('priority', supportData.priority || 'Medium');
      formData.append('farmerId', user?.id || '');

      // Append the attachment if it's a file
      if (supportData.attachment instanceof File) {
        formData.append('attachment', supportData.attachment);  // Append the file
      }

      const response = await fetch('http://localhost:5000/api/support', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add support entry');
      }

      const newSupport = await response.json();
      setSupportEntries([...supportEntries, newSupport]);
      toast.success('support entry added successfully!');
    } catch (error) {
      console.error('Error adding support entry:', error);
      toast.error('Failed to add support entry');
    }
  };

  const handleUpdateSupport = async (supportData: Partial<SupportEntry>) => {
    if (!selectedSupport) return;

    try {
      const formData = new FormData();
      formData.append('subject', supportData.subject || '');
      formData.append('category', supportData.category || '');
      formData.append('description', supportData.description || '');
      formData.append('priority', supportData.priority || 'Medium');

      // Handle the attachment (file) update
      if (supportData.attachment instanceof File) {
        formData.append('attachment', supportData.attachment);
      }

      const response = await fetch(`http://localhost:5000/api/support/${selectedSupport.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update support entry');
      }

      const updatedSupport = await response.json();
      setSupportEntries(supportEntries.map(support =>
        support.id === updatedSupport.id ? updatedSupport : support
      ));
      toast.success('Support entry updated successfully!');
    } catch (error) {
      console.error('Error updating support entry:', error);
      toast.error('Failed to update support entry');
    }
  };

  const handleDeleteSupport = async (supportId: string) => {
    if (!supportId) {
      console.error('Cannot delete support: No support ID provided');
      toast.error('Failed to delete support entry: Invalid ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this support entry?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/support/${supportId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete support entry');
        }

        setSupportEntries(supportEntries.filter(support => support.id !== supportId));
        toast.success('Support entry deleted successfully!');
      } catch (error) {
        console.error('Error deleting support entry:', error);
        toast.error('Failed to delete support entry');
      }
    }
  };

  const openEditModal = (support: SupportEntry) => {
    setSelectedSupport(support);
    setIsModalOpen(true);
  };

  const downloadCSV = () => {
    if (supportEntries.length === 0) {
      toast.error('No support entries to download');
      return;
    }

    const headers = ['Subject', 'Category', 'Priority', 'Description', 'Created At'];
    const rows = supportEntries.map(entry => [
      `"${entry.subject.replace(/"/g, '""')}"`,
      `"${entry.category}"`,
      `"${entry.priority}"`,
      `"${entry.description.replace(/"/g, '""')}"`,
      `"${new Date(entry.createdAt).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `support-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Support tickets exported as CSV');
  };

  const downloadPDF = async () => {
    if (supportEntries.length === 0) {
      toast.error('No support entries to download');
      return;
    }

    const input = document.getElementById('support-tickets-table');
    if (!input) return;

    toast.loading('Generating PDF...');
    
    try {
      const canvas = await html2canvas(input as HTMLElement, {
        scale: 2,
        scrollY: -window.scrollY
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`support-tickets-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Support tickets exported as PDF');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      toast.dismiss();
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage support tickets.
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'user' && (
            <button
              onClick={() => {
                setSelectedSupport(undefined);
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add a Support Ticket
            </button>
          )}
          <button
            onClick={downloadCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Support Tickets</h3>
        </div>
        <div className="overflow-x-auto">
          <table 
            className="min-w-full divide-y divide-gray-200"
            id="support-tickets-table"
          >
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attachment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                {user?.role === 'user' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supportEntries.map((support) => (
                <tr key={support.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {support.attachment && (
                      <img
                        src={typeof support.attachment === 'string' ? support.attachment : URL.createObjectURL(support.attachment)}
                        alt="Attachment"
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {support.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {support.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {support.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {support.description}
                  </td>
                  {user?.role === 'user' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => openEditModal(support)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupport(support.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Entry Modal */}
      {isModalOpen && (
        <SupportEntryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSupport(undefined);
          }}
          onSubmit={selectedSupport ? handleUpdateSupport : handleAddSupport}
          support={selectedSupport}
        />
      )}
    </div>
  );
};

export default SupportCustomer;