import React, { useState } from 'react';
import api from '../../services/api';
import Button from '../ui/Button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PDFExportButton = ({ type, id, label, variant = 'primary', size = 'md', className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [format, setFormat] = useState('A4');
  const [template, setTemplate] = useState('modern');
  const [options, setOptions] = useState({ formats: [], templates: [] });

  React.useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await api.get('/pdf/options');
      setOptions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch PDF options:', error);
    }
  };

  const handleExport = async (customFormat = format, customTemplate = template) => {
    setIsLoading(true);
    try {
      let url;
      if (type === 'resume') {
        url = `/pdf/resume/${id}/export?format=${customFormat}`;
        if (customTemplate) url += `&template=${customTemplate}`;
      } else {
        url = `/pdf/portfolio/${id}/export?format=${customFormat}`;
      }
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${type}_${id}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('PDF exported successfully!');
      setShowOptions(false);
    } catch (error) {
      toast.error('Failed to export PDF. Please try again.');
      console.error('PDF export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const url = type === 'resume' 
        ? `/pdf/resume/${id}/preview`
        : `/pdf/portfolio/${id}/preview`;
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const previewUrl = window.URL.createObjectURL(blob);
      window.open(previewUrl, '_blank');
      window.URL.revokeObjectURL(previewUrl);
    } catch (error) {
      toast.error('Failed to preview PDF');
    } finally {
      setIsLoading(false);
    }
  };

  if (showOptions) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">PDF Export Options</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Paper Size</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2"
              >
                {options.formats?.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            
            {type === 'resume' && options.templates && (
              <div>
                <label className="block text-sm font-medium mb-2">Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2"
                >
                  {options.templates.map(t => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowOptions(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleExport(format, template)} isLoading={isLoading}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowOptions(true)}
        isLoading={isLoading}
        className={className}
      >
        <Download className="w-4 h-4 mr-2" />
        {label || 'Export PDF'}
      </Button>
      
      <Button
        variant="outline"
        size={size}
        onClick={handlePreview}
        isLoading={isLoading}
      >
        <FileText className="w-4 h-4 mr-2" />
        Preview
      </Button>
    </div>
  );
};

export default PDFExportButton;