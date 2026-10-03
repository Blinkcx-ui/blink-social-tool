'use client';

import { useState } from 'react';

export default function TicketsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8 bg-slate-50 flex-1 h-full overflow-y-auto w-full relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Tickets Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage, escalate, and resolve customer interactions.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
            + Generate New Ticket
          </button>
        </div>

        {/* Empty State Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-800 text-white border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">Ref</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  No active tickets. Click "Generate New Ticket" to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Ticket Generation Modal (Matching Report Columns) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 flex flex-col">
            
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-800">Generate Full Ticket</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            <form className="p-6 space-y-8" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
              
              {/* Core Details */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 border-b pb-2">Core & Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Ticket Date</label><input type="date" required className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Employee Name</label><input type="text" required className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Customer Name</label><input type="text" required className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Customer Mobile</label><input type="tel" required className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">City</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Branch</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Type</label>
                    <select className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50"><option>Standard</option><option>VIP</option><option>Corporate</option></select>
                  </div>
                </div>
              </section>

              {/* Classification */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 border-b pb-2">Ticket Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Department</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Ticket Type</label><select className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50"><option>Inquiry</option><option>Complaint</option><option>Suggestion</option></select></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Ticket Source</label><select className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50"><option>WhatsApp</option><option>Instagram</option><option>Twitter</option><option>Email</option></select></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Main Category</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Sub Category</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Ticket Status</label><select className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50"><option>Open</option><option>Pending</option><option>Solved</option></select></div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Status Description</label><textarea rows={2} className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50"></textarea></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Employee Notes</label><textarea rows={2} className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50"></textarea></div>
                </div>
              </section>

              {/* Escalation Matrix */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 border-b pb-2">Escalation & Responses</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Escalated?</label><select className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50"><option>No</option><option>Yes (FCR)</option><option>Escalated</option></select></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">First Escalation</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Response 1</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Response 2</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Second Escalation</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Response 1 (2)</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Response 2 (2)</label><input type="text" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Close Date</label><input type="date" className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50" /></div>
                </div>
              </section>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 -mx-6 -mb-6 flex justify-end gap-3 rounded-b-2xl">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-lg">Save Ticket Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}