export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Terms of Service</h1>
        <p className="text-xs text-slate-400">Last updated: October 5, 2026</p>
        
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <h2 className="font-semibold text-slate-800 text-base">1. Acceptance of Terms</h2>
          <p>By accessing or using blinktolink.com, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          
          <h2 className="font-semibold text-slate-800 text-base">2. Use License</h2>
          <p>Permission is granted to temporarily use our social media management platform for personal or internal business operations.</p>
          
          <h2 className="font-semibold text-slate-800 text-base">3. Disclaimer</h2>
          <p>The materials on our platform are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all warranties.</p>
        </div>
      </div>
    </div>
  );
}