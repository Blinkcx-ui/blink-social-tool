'use client';

import { useState } from 'react';

export default function CreateTicketModal({
  conversationId,
  clientId,
  customerName,
  source,
  customerHandle,
}: {
  conversationId: string;
  clientId: string;
  customerName: string;
  source: string;
  customerHandle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-populated defaults
  const [formData, setFormData] = useState({
    contactDetails: customerHandle,
    city: '',
    category: 'Inquiry', // Default to Category 1
    details: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          clientId,
          customerName,
          source,
          ...formData,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({ ...formData, city: '', details: '' }); // Reset fields
      } else {
        alert('Failed to create ticket');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-brand-orange hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      >
        + Create Ticket
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">New Support Ticket</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Auto-populated read-only fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Customer Name</label>
                  <input type="text" disabled value={customerName} className="w-full mt-1 p-2 bg-gray-100 border rounded text-sm text-gray-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Source</label>
                  <input type="text" disabled value={source.toUpperCase()} className="w-full mt-1 p-2 bg-gray-100 border rounded text-sm text-gray-600 cursor-not-allowed" />
                </div>
              </div>

              {/* Editable Fields */}
              <div>
                <label className="block text-xs font-semibold text-gray-600">Contact Details</label>
                <input 
                  type="text" 
                  value={formData.contactDetails}
                  onChange={(e) => setFormData({...formData, contactDetails: e.target.value})}
                  className="w-full mt-1 p-2 border rounded text-sm text-gray-800 focus:outline-brand-orange" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">City</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="e.g. Jeddah"
                    className="w-full mt-1 p-2 border rounded text-sm text-gray-800 focus:outline-brand-orange" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full mt-1 p-2 border rounded text-sm text-gray-800 focus:outline-brand-orange"
                  >
                    <option value="Inquiry">Inquiry</option>
                    <option value="Complaint">Complaint</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600">Ticket Details</label>
                <textarea 
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  rows={4}
                  placeholder="Type the ticket details here..."
                  className="w-full mt-1 p-2 border rounded text-sm text-gray-800 focus:outline-brand-orange resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-brand-orange hover:bg-orange-600 text-white rounded-md disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}