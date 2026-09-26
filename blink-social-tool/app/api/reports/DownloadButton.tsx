'use client';

export default function DownloadButton({ platform }: { platform?: string }) {
  const handleDownload = async () => {
    try {
      const endpoint = `/api/reports/export${platform ? `?platform=${platform}` : ''}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to generate export');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `blink-social-report-${platform || 'all'}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Could not download the report. Please try again.');
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className="bg-brand-orange hover:bg-brand-orange-hover text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
    >
      Download CSV Report
    </button>
  );
}