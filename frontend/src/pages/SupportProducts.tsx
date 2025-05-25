import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  description: string;
  priority: string;
  createdAt: string;
  attachment?: string;
}

interface TicketRowProps {
  ticket: SupportTicket;
  isFarmer: boolean;
  onReplySent: () => void;
}

const TicketRow: React.FC<TicketRowProps> = ({ ticket, isFarmer, onReplySent }) => {
  const { user } = useAuthStore();
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const getFullAttachmentUrl = (attachment: string) => {
    return `http://localhost:8000/${attachment}`;
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }

    if (!ticket?._id) {
      console.error('Ticket data structure issue - missing _id:', ticket);
      toast.error('Ticket data issue. Please refresh and try again.');
      return;
    }

    setIsSending(true);
    try {
      const endpoint = `http://localhost:8000/api/${isFarmer ? 'farmer-support' : 'support'}/reply/${ticket._id}`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify({
          reply: replyText,
          repliedBy: user?.name || 'Admin'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      toast.success('Reply sent successfully');
      setReplyText('');
      setShowReplyBox(false);
      onReplySent();
    } catch (error) {
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <tr className="border-b hover:bg-gray-100">
        <td className="px-6 py-4 text-gray-700">{ticket.subject}</td>
        <td className="px-6 py-4 text-gray-700">{ticket.category}</td>
        <td className="px-6 py-4 text-gray-700">{ticket.description}</td>
        <td className="px-6 py-4 text-gray-700">{ticket.priority}</td>
        <td className="px-6 py-4 text-gray-700">
          {ticket.attachment ? (
            <a 
              href={getFullAttachmentUrl(ticket.attachment)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              View Attachment
            </a>
          ) : (
            <span className="text-gray-500">No Attachment</span>
          )}
        </td>
        <td className="px-6 py-4 text-gray-700">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-gray-700">
          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className={`text-white px-3 py-1 rounded ${
              isFarmer ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isSending}
          >
            {showReplyBox ? 'Close' : 'Reply'}
          </button>
        </td>
      </tr>
      {showReplyBox && (
        <tr>
          <td colSpan={7} className="px-6 py-4">
            <div className="flex flex-col gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full p-3 border rounded-md"
                rows={3}
                disabled={isSending}
              />
              <button
                onClick={handleSendReply}
                className={`self-start text-white px-4 py-2 rounded ${
                  isFarmer ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={isSending}
              >
                {isSending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const SupportProducts = () => {
  const [customerTickets, setCustomerTickets] = useState<SupportTicket[]>([]);
  const [farmerTickets, setFarmerTickets] = useState<SupportTicket[]>([]);
  const [selectedCustomerPriority, setSelectedCustomerPriority] = useState('all');
  const [selectedFarmerPriority, setSelectedFarmerPriority] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchSupportTickets = async () => {
      setIsLoading(true);
      try {
        const [customerRes, farmerRes] = await Promise.all([
          fetch('http://localhost:8000/api/support'),
          fetch('http://localhost:8000/api/farmer-support')
        ]);

        if (!customerRes.ok || !farmerRes.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const [customerData, farmerData] = await Promise.all([
          customerRes.json(),
          farmerRes.json()
        ]);

        setCustomerTickets(Array.isArray(customerData) ? customerData : []);
        setFarmerTickets(Array.isArray(farmerData) ? farmerData : []);
      } catch (error) {
        toast.error('Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupportTickets();
  }, [refreshKey]);

  const downloadCSV = (tickets: SupportTicket[], title: string) => {
    if (tickets.length === 0) {
      toast.error(`No ${title.toLowerCase()} tickets to download`);
      return;
    }

    const headers = ['Subject', 'Category', 'Description', 'Priority', 'Created At'];
    const rows = tickets.map(ticket => [
      `"${ticket.subject.replace(/"/g, '""')}"`,
      `"${ticket.category.replace(/"/g, '""')}"`,
      `"${ticket.description.replace(/"/g, '""')}"`,
      `"${ticket.priority}"`,
      `"${new Date(ticket.createdAt).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase()}-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${title} tickets exported`);
  };

  const downloadPDF = async (tickets: SupportTicket[], title: string) => {
    if (tickets.length === 0) {
      toast.error(`No ${title.toLowerCase()} tickets to download`);
      return;
    }

    const input = document.getElementById(`${title.toLowerCase()}-tickets-table`);
    if (!input) return;

    toast.loading(`Generating ${title} PDF...`);
    
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

      pdf.save(`${title.toLowerCase()}-tickets-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(`${title} tickets exported as PDF`);
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      toast.dismiss();
    }
  };

  const getUniquePriorities = (tickets: SupportTicket[]) => {
    const priorities = tickets.map(ticket => ticket.priority);
    return ['all', ...Array.from(new Set(priorities))];
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const TicketTable = ({ tickets, isFarmer = false }: { tickets: SupportTicket[], isFarmer?: boolean }) => (
    <div className="overflow-x-auto">
      <table 
        className="min-w-full bg-white shadow-lg rounded-lg text-lg mb-10"
        id={`${isFarmer ? 'farmer' : 'customer'}-tickets-table`}
      >
        <thead>
          <tr className="bg-gray-200">
            <th className="px-6 py-4 text-left font-semibold text-gray-800">Subject</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-800">Category</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-800">Description</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-800">Priority</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-800">Attachment</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-800">Created At</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-800">Reply</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length > 0 ? (
            tickets.map(ticket => (
              <TicketRow
                key={ticket._id}
                ticket={ticket}
                isFarmer={isFarmer}
                onReplySent={handleRefresh}
              />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                No tickets found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const customerPriorities = getUniquePriorities(customerTickets);
  const farmerPriorities = getUniquePriorities(farmerTickets);

  const filteredCustomerTickets = selectedCustomerPriority === 'all'
    ? customerTickets
    : customerTickets.filter(ticket => ticket.priority === selectedCustomerPriority);

  const filteredFarmerTickets = selectedFarmerPriority === 'all'
    ? farmerTickets
    : farmerTickets.filter(ticket => ticket.priority === selectedFarmerPriority);

  return (
    <div className="relative p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
      </div>

      {isLoading ? (
        <div className="text-center text-xl">Loading...</div>
      ) : (
        <>
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Customer Support Tickets</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadCSV(filteredCustomerTickets, 'Customer')}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  onClick={() => downloadPDF(filteredCustomerTickets, 'Customer')}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  <Download size={16} />
                  Export PDF
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4 mb-6">
              <Filter className="w-6 h-6 text-gray-600" />
              <div className="flex flex-wrap gap-3">
                {customerPriorities.map(priority => (
                  <button
                    key={priority}
                    onClick={() => setSelectedCustomerPriority(priority)}
                    className={`px-5 py-3 rounded-lg text-lg ${
                      selectedCustomerPriority === priority
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priority === 'all' ? 'All Priorities' : priority}
                  </button>
                ))}
              </div>
            </div>
            <TicketTable tickets={filteredCustomerTickets} isFarmer={false} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Farmer Support Tickets</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadCSV(filteredFarmerTickets, 'Farmer')}
                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  onClick={() => downloadPDF(filteredFarmerTickets, 'Farmer')}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  <Download size={16} />
                  Export PDF
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4 mb-6">
              <Filter className="w-6 h-6 text-gray-600" />
              <div className="flex flex-wrap gap-3">
                {farmerPriorities.map(priority => (
                  <button
                    key={priority}
                    onClick={() => setSelectedFarmerPriority(priority)}
                    className={`px-5 py-3 rounded-lg text-lg ${
                      selectedFarmerPriority === priority
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priority === 'all' ? 'All Priorities' : priority}
                  </button>
                ))}
              </div>
            </div>
            <TicketTable tickets={filteredFarmerTickets} isFarmer={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default SupportProducts;