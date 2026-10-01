'use client';

import { useState } from 'react';

export default function TicketsTable({ initialTickets }: { initialTickets: any[] }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter logic
  const filteredTickets = initialTickets.filter(ticket => {
    const matchStatus = statusFilter ? ticket.status === statusFilter : true;
    const matchType = typeFilter ? ticket.ticketType === typeFilter : true;
    return matchStatus && matchType;
  });

  return (
    <div className="w-full">
      {/* Top Bar: Filters & Create Button */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-end gap-4">
        <div className="flex gap-4 flex-1">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Ticket Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-slate-800 focus:outline-brand-orange"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="open">Open</option>
              <option value="solved">Solved</option>
            </select>
          </div>
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Ticket Type</label>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-slate-800 focus:outline-brand-orange"
            >
              <option value="">All Types</option>
              <option value="Complaint">Complaint</option>
              <option value="Inquiry">Inquiry</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Appointment">Appointment</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          + Create New Ticket
        </button>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[2500px]">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold text-slate-800">Ticket Ref</th>
                <th className="p-3 font-semibold text-slate-800">Ticket Date</th>
                <th className="p-3 font-semibold text-slate-800">Employee Name</th>
                <th className="p-3 font-semibold text-slate-800">Customer Name</th>
                <th className="p-3 font-semibold text-slate-800">Customer Mobile</th>
                <th className="p-3 font-semibold text-slate-800">City</th>
                <th className="p-3 font-semibold text-slate-800">Branch</th>
                <th className="p-3 font-semibold text-slate-800">Customer Type</th>
                <th className="p-3 font-semibold text-slate-800">Department</th>
                <th className="p-3 font-semibold text-slate-800">Ticket Type</th>
                <th className="p-3 font-semibold text-slate-800">Escalated?</th>
                <th className="p-3 font-semibold text-slate-800">Ticket Source</th>
                <th className="p-3 font-semibold text-slate-800">Status Description</th>
                <th className="p-3 font-semibold text-slate-800">Employee Notes</th>
                <th className="p-3 font-semibold text-slate-800">Main Category</th>
                <th className="p-3 font-semibold text-slate-800">Sub Category</th>
                <th className="p-3 font-semibold text-slate-800">Ticket Status</th>
                <th className="p-3 font-semibold text-slate-800">First Escalation</th>
                <th className="p-3 font-semibold text-slate-800">Response 1</th>
                <th className="p-3 font-semibold text-slate-800">Response 2</th>
                <th className="p-3 font-semibold text-slate-800">Response 3</th>
                <th className="p-3 font-semibold text-slate-800">Second Escalation</th>
                <th className="p-3 font-semibold text-slate-800">Response 1</th>
                <th className="p-3 font-semibold text-slate-800">Response 2</th>
                <th className="p-3 font-semibold text-slate-800">Response 3</th>
                <th className="p-3 font-semibold text-slate-800">Close Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.map((ticket, idx) => (
                <tr key={ticket.id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{ticket.ref || `TCK-${ticket.id?.substring(0,4) || idx + 1000}`}</td>
                  <td className="p-3">{ticket.date || new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{ticket.employee || '-'}</td>
                  <td className="p-3">{ticket.customerName || ticket.customer || '-'}</td>
                  <td className="p-3">{ticket.mobile || '-'}</td>
                  <td className="p-3">{ticket.city || '-'}</td>
                  <td className="p-3">{ticket.branch || '-'}</td>
                  <td className="p-3">{ticket.customerType || '-'}</td>
                  <td className="p-3">{ticket.department || '-'}</td>
                  <td className="p-3 font-medium">{ticket.ticketType || '-'}</td>
                  <td className="p-3">{ticket.escalated || '-'}</td>
                  <td className="p-3">{ticket.source || 'Manual'}</td>
                  <td className="p-3 truncate max-w-[150px]">{ticket.description || ticket.subject || '-'}</td>
                  <td className="p-3 truncate max-w-[150px]">{ticket.notes || '-'}</td>
                  <td className="p-3">{ticket.mainCategory || '-'}</td>
                  <td className="p-3">{ticket.subCategory || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      ticket.status === 'solved' ? 'bg-green-100 text-green-700' :
                      ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {ticket.status || 'open'}
                    </span>
                  </td>
                  {/* Safely mapping remaining fields with fallback to avoid crashes */}
                  <td className="p-3">{ticket.esc1 || '-'}</td>
                  <td className="p-3">{ticket.r1_1 || '-'}</td>
                  <td className="p-3">{ticket.r2_1 || '-'}</td>
                  <td className="p-3">{ticket.r3_1 || '-'}</td>
                  <td className="p-3">{ticket.esc2 || '-'}</td>
                  <td className="p-3">{ticket.r1_2 || '-'}</td>
                  <td className="p-3">{ticket.r2_2 || '-'}</td>
                  <td className="p-3">{ticket.r3_2 || '-'}</td>
                  <td className="p-3">{ticket.closeDate || '-'}</td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={26} className="p-8 text-center text-slate-400">No tickets found. Click "Create New Ticket" to start.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Create Ticket Modal for Demo */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Create New Ticket</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6">Fill in the core details. Advanced fields can be updated inside the ticket view.</p>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsCreateModalOpen(false); alert("Ticket creation simulated for demo!"); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                    <input type="text" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                    <input type="text" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ticket Type</label>
                    <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" required>
                      <option value="Complaint">Complaint</option>
                      <option value="Inquiry">Inquiry</option>
                      <option value="Suggestion">Suggestion</option>
                      <option value="Appointment">Appointment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50">
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="solved">Solved</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description / Notes</label>
                  <textarea rows={4} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" required></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="bg-brand-orange hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">Save Ticket</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}