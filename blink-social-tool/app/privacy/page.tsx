export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: October 5, 2026</p>
        
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <h2 className="font-semibold text-slate-800 text-base">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when setting up your workspace, connecting social accounts, or creating support tickets.</p>
          
          <h2 className="font-semibold text-slate-800 text-base">2. How We Use Information</h2>
          <p>We use the information collected to operate, maintain, and provide you with the features and functionality of blinktolink.com.</p>
          
          <h2 className="font-semibold text-slate-800 text-base">3. Data Security</h2>
          <p>We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access or alteration.</p>
        </div>
      </div>
    </div>
  );
}