'use client';

import { useState } from 'react';

// Demo Data 
const mockData = [
  {
    ref: "TCK-1042", date: "2026-10-01", employee: "Ahmed S.", customer: "Khalid M.", mobile: "0501234567",
    city: "Jeddah", branch: "North Branch", customerType: "VIP", department: "Support",
    ticketType: "Complaint", escalated: "FCR", source: "WhatsApp", description: "Issue with service activation",
    notes: "Customer followed up twice.", mainCategory: "Technical", subCategory: "Activation",
    status: "open", esc1: "Level 2 Support", r1_1: "Checked logs", r2_1: "Awaiting dev", r3_1: "",
    esc2: "", r1_2: "", r2_2: "", r3_2: "", closeDate: ""
  },
  {
    ref: "TCK-1043", date: "2026-10-01", employee: "Sara K.", customer: "Noura A.", mobile: "0559876543",
    city: "Riyadh", branch: "Main HQ", customerType: "Standard", department: "Sales",
    ticketType: "Inquiry", escalated: "FCR", source: "Twitter", description: "Pricing inquiry for premium",
    notes: "Provided PDF brochure", mainCategory: "Sales", subCategory: "Pricing",
    status: "solved", esc1: "", r1_1: "", r2_1: "", r3_1: "",
    esc2: "", r1_2: "", r2_2: "", r3_2: "", closeDate: "2026-10-01"
  },
  {
    ref: "TCK-1044", date: "2026-09-30", employee: "Omar F.", customer: "Faisal T.", mobile: "0561122334",
    city: "Dammam", branch: "East Branch", customerType: "Corporate", department: "Operations",
    ticketType: "Suggestion", escalated: "Escalated", source: "Email", description: "Suggesting UI changes",
    notes: "Forwarded to product team", mainCategory: "Product", subCategory: "Feedback",
    status: "pending", esc1: "Product Manager", r1_1: "Reviewed", r2_1: "", r3_1: "",
    esc2: "Dev Team", r1_2: "Scheduled", r2_2: "", r3_2: "", closeDate: ""
  }
];

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredData = mockData.filter(ticket => {
    const matchStatus = statusFilter ? ticket.status === statusFilter : true;
    const matchType = typeFilter ? ticket.ticketType === typeFilter : true;
    return matchStatus && matchType;
  });

  const downloadCSV = () => {
    // 1. Translated English Headers for the CSV
    const headers = [
      "Ticket Ref", "Ticket Date", "Employee Name", "Customer Name", "Customer Mobile", "City", "Branch", "Customer Type",
      "Department", "Ticket Type", "Escalated?", "Ticket Source", "Status Description", "Employee Notes", "Main Category", "Sub Category",
      "Ticket Status", "First Escalation", "Response 1", "Response 2", "Response 3", "Second Escalation", "Response 1 (2)", "Response 2 (2)", "Response 3 (2)", "Close Date"
    ];

    const csvRows = [headers.join(",")];
    
    filteredData.forEach(row => {
      const values = [
        row.ref, row.date, row.employee, row.customer, row.mobile, row.city, row.branch, row.customerType,
        row.department, row.ticketType, row.escalated, row.source, `"${row.description}"`, `"${row.notes}"`, row.mainCategory, row.subCategory,
        row.status, row.esc1, row.r1_1, row.r2_1, row.r3_1, row.esc2, row.r1_2, row.r2_2, row.r3_2, row.closeDate
      ];
      csvRows.push(values.join(","));
    });

    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Tickets_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex-1 h-full overflow-y-auto w-full">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Reports & Export</h1>
            <p className="text-sm text-slate-500 mt-1">Filter and download advanced ticket analytics.</p>
          </div>
          <button 
            onClick={downloadCSV}
            className="bg-brand-orange hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            Download CSV Report
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4 items-end">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[2500px]">
              <thead className="bg-slate-800 text-white border-b border-gray-200">
                {/* 2. Translated English Headers for the UI Table */}
                <tr>
                  <th className="p-3 font-semibold">Ticket Ref</th>
                  <th className="p-3 font-semibold">Ticket Date</th>
                  <th className="p-3 font-semibold">Employee Name</th>
                  <th className="p-3 font-semibold">Customer Name</th>
                  <th className="p-3 font-semibold">Customer Mobile</th>
                  <th className="p-3 font-semibold">City</th>
                  <th className="p-3 font-semibold">Branch</th>
                  <th className="p-3 font-semibold">Customer Type</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold">Ticket Type</th>
                  <th className="p-3 font-semibold">Escalated?</th>
                  <th className="p-3 font-semibold">Ticket Source</th>
                  <th className="p-3 font-semibold">Status Description</th>
                  <th className="p-3 font-semibold">Employee Notes</th>
                  <th className="p-3 font-semibold">Main Category</th>
                  <th className="p-3 font-semibold">Sub Category</th>
                  <th className="p-3 font-semibold">Ticket Status</th>
                  <th className="p-3 font-semibold">First Escalation</th>
                  <th className="p-3 font-semibold">Response 1</th>
                  <th className="p-3 font-semibold">Response 2</th>
                  <th className="p-3 font-semibold">Response 3</th>
                  <th className="p-3 font-semibold">Second Escalation</th>
                  <th className="p-3 font-semibold">Response 1</th>
                  <th className="p-3 font-semibold">Response 2</th>
                  <th className="p-3 font-semibold">Response 3</th>
                  <th className="p-3 font-semibold">Close Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-slate-800">{row.ref}</td>
                    <td className="p-3">{row.date}</td>
                    <td className="p-3">{row.employee}</td>
                    <td className="p-3">{row.customer}</td>
                    <td className="p-3">{row.mobile}</td>
                    <td className="p-3">{row.city}</td>
                    <td className="p-3">{row.branch}</td>
                    <td className="p-3">{row.customerType}</td>
                    <td className="p-3">{row.department}</td>
                    <td className="p-3 font-medium">{row.ticketType}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">{row.escalated}</span>
                    </td>
                    <td className="p-3">{row.source}</td>
                    <td className="p-3 truncate max-w-[150px]">{row.description}</td>
                    <td className="p-3 truncate max-w-[150px]">{row.notes}</td>
                    <td className="p-3">{row.mainCategory}</td>
                    <td className="p-3">{row.subCategory}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        row.status === 'solved' ? 'bg-green-100 text-green-700' :
                        row.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3">{row.esc1}</td>
                    <td className="p-3">{row.r1_1}</td>
                    <td className="p-3">{row.r2_1}</td>
                    <td className="p-3">{row.r3_1}</td>
                    <td className="p-3">{row.esc2}</td>
                    <td className="p-3">{row.r1_2}</td>
                    <td className="p-3">{row.r2_2}</td>
                    <td className="p-3">{row.r3_2}</td>
                    <td className="p-3">{row.closeDate}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={26} className="p-8 text-center text-slate-400">No tickets match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}