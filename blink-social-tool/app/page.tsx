export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards */}
        <div className="bg-brand-card p-6 rounded-lg border border-brand-border shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Pending Messages</h3>
          <p className="text-3xl font-bold text-brand-orange mt-2">14</p>
        </div>
        <div className="bg-brand-card p-6 rounded-lg border border-brand-border shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">AI Handled Today</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">128</p>
        </div>
        <div className="bg-brand-card p-6 rounded-lg border border-brand-border shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Active Accounts</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">5</p>
        </div>
      </div>
    </div>
  );
}