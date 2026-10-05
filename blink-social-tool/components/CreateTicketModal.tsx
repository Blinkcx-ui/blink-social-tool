'use client';

import { useState, useEffect } from 'react';

export default function CreateTicketModal({
  conversationId,
  clientId,
  customerName,
  customerHandle,
  source
}: {
  conversationId: string;
  clientId: string;
  customerName: string;
  customerHandle: string;
  source: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketTree, setTicketTree] = useState<any>({});

  // Form State
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [ticketType, setTicketType] = useState('Inquiry');
  
  const [cat1, setCat1] = useState('');
  const [cat2, setCat2] = useState('');
  const [cat3, setCat3] = useState('');
  const [cat4, setCat4] = useState('');
  const [details, setDetails] = useState('');

  // Fetch ticket categories config when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/tickets/config')
        .then(res => res.json())
        .then(data => {
          if (data.ticketFields) setTicketTree(data.ticketFields);
        })
        .catch(err => console.error("Failed to load categories"));
    }
  }, [isOpen]);

  // Derived Cascading Options based on the JSON Tree
  const cat1Options = Object.keys(ticketTree || {});
  const cat2Options = cat1 && ticketTree[cat1] ? Object.keys(ticketTree[cat1]) : [];
  const cat3Options = cat2 && ticketTree[cat1][cat2] ? Object.keys(ticketTree[cat1][cat2]) : [];
  const cat4Options = cat3 && ticketTree[cat1][cat2][cat3] ? ticketTree[cat1][cat2][cat3] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          clientId,
          customerName,
          socialAccount: `${customerHandle} via ${source}`,
          mobile,
          email,
          city,
          source,
          ticketType,
          category1: cat1,
          category2: cat2,
          category3: cat3,
          category4: cat4,
          details
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Ticket created successfully! (ID: ${data.ticket.ticketNumber})`);
        setIsOpen(false);
      } else {
        alert(data.error || 'Failed to create ticket');
      }
    } catch (err) {
      alert('Network error creating ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-orange hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors shadow-sm"
      >
        + Create Ticket
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-800">Create Support Ticket</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              
              {/* SECTION 1: Customer Profile */}
              <div>
                <h3 className="text-sm font-bold text-brand-orange uppercase tracking-wider mb-4 border-b pb-2">1. Customer Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                    <input type="text" disabled value={customerName} className="w-full p-2 border border-gray-200 rounded bg-gray-100 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Social Account (Auto-Pulled)</label>
                    <input type="text" disabled value={`${customerHandle} via ${source}`} className="w-full p-2 border border-gray-200 rounded bg-gray-100 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                    <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+1234567890" className="w-full p-2 border border-gray-300 rounded focus:outline-brand-orange text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="customer@email.com" className="w-full p-2 border border-gray-300 rounded focus:outline-brand-orange text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Jeddah" className="w-full p-2 border border-gray-300 rounded focus:outline-brand-orange text-sm" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Ticket Information */}
              <div>
                <h3 className="text-sm font-bold text-brand-orange uppercase tracking-wider mb-4 border-b pb-2">2. Ticket Information</h3>
                
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Type</label>
                  <select value={ticketType} onChange={e => setTicketType(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:outline-brand-orange">
                    <option value="Inquiry">Inquiry</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Request">Request</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category 1</label>
                    <select value={cat1} onChange={e => { setCat1(e.target.value); setCat2(''); setCat3(''); setCat4(''); }} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                      <option value="">Select Level 1</option>
                      {cat1Options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category 2</label>
                    <select value={cat2} onChange={e => { setCat2(e.target.value); setCat3(''); setCat4(''); }} disabled={!cat1} className="w-full p-2 border border-gray-300 rounded text-sm bg-white disabled:bg-gray-100">
                      <option value="">Select Level 2</option>
                      {cat2Options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category 3</label>
                    <select value={cat3} onChange={e => { setCat3(e.target.value); setCat4(''); }} disabled={!cat2} className="w-full p-2 border border-gray-300 rounded text-sm bg-white disabled:bg-gray-100">
                      <option value="">Select Level 3</option>
                      {cat3Options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category 4</label>
                    <select value={cat4} onChange={e => setCat4(e.target.value)} disabled={!cat3} className="w-full p-2 border border-gray-300 rounded text-sm bg-white disabled:bg-gray-100">
                      <option value="">Select Level 4</option>
                      {cat4Options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Details / Issue Description</label>
                  <textarea 
                    value={details} 
                    onChange={e => setDetails(e.target.value)} 
                    required 
                    rows={4} 
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-brand-orange"
                    placeholder="Describe the customer's issue..."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-2 rounded-md font-semibold text-sm transition-colors disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Submit Ticket'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}