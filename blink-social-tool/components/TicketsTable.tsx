'use client';

import { useState } from 'react';

type Ticket = {
  id: string;
  customerName: string;
  contactDetails: string;
  city: string | null;
  source: string;
  category: string;
  details: string;
  createdAt: Date;
};

export default function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSource, setFilterSource] = useState('All');

  // Apply filters
  const filteredTickets = tickets.filter((ticket) => {
    const matchCategory = filterCategory === 'All' || ticket.category === filterCategory;
    const matchSource = filterSource === 'All' || ticket.source.toLowerCase() === filterSource.toLowerCase();
    return matchCategory && matchSource;
  });

  // Export to CSV
  const handleExport = () => {
    const headers = ['Date', 'Customer Name', 'Contact', 'City', 'Source', 'Category', 'Details'];
    const csvRows = filteredTickets.map((t) => [
      new Date(t.createdAt).toLocaleDateString(),
      `"${t.customerName}"`,
      `"${t.contactDetails}"`,
      `"${t.city || ''}"`,
      t.source.toUpperCase(),
      t.category,
      `"${t.details.replace(/"/g, '""')}"`, // Escape quotes for CSV
    ]);

    const csvContent = [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'support_tickets_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6 mt-6">
      {/* Controls: Filters & Export */}
      <div className="flex justify-between items-end mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Filter by Category</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 border border-brand-border rounded-md text-sm bg-gray-50 focus:outline-brand-orange"
            >
              <option value="All">All Categories</option>
              <option value="Inquiry">Inquiry</option>
              <option value="Complaint">Complaint</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Filter by Source</label>
            <select 
              value={filterSource} 
              onChange={(e) => setFilterSource(e.target.value)}
              className="p-2 border border-brand-border rounded-md text-sm bg-gray-50 focus:outline-brand-orange"
            >
              <option value="All">All Sources</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="bg-brand-orange hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Export CSV Report
        </button>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{ticket.customerName}</td>
                  <td className="px-4 py-3">{ticket.contactDetails}</td>
                  <td className="px-4 py-3">{ticket.city || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold uppercase">
                      {ticket.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      ticket.category === 'Complaint' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" title={ticket.details}>
                    {ticket.details}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No tickets found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}