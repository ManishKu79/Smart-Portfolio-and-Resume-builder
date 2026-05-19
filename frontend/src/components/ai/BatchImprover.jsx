import React, { useState } from 'react';
import aiService from '../../services/aiService';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader } from '../ui/Card';
import { Wand2, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const BatchImprover = ({ items, type, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [improvedItems, setImprovedItems] = useState({});
  const [selectedItems, setSelectedItems] = useState({});

  const handleSelectAll = () => {
    const newSelected = {};
    items.forEach((_, index) => {
      newSelected[index] = !Object.values(selectedItems).every(v => v === true);
    });
    setSelectedItems(newSelected);
  };

  const handleSelect = (index) => {
    setSelectedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleImprove = async () => {
    const selectedIndices = Object.entries(selectedItems)
      .filter(([, selected]) => selected)
      .map(([index]) => parseInt(index));
    
    if (selectedIndices.length === 0) {
      toast.error('Please select items to improve');
      return;
    }
    
    const descriptions = selectedIndices.map(index => items[index]);
    
    setIsProcessing(true);
    try {
      const result = await aiService.batchImprove(descriptions, type);
      const newImproved = { ...improvedItems };
      result.data.forEach((item, idx) => {
        newImproved[selectedIndices[idx]] = item.improved;
      });
      setImprovedItems(newImproved);
      toast.success(`Improved ${selectedIndices.length} items`);
    } catch (error) {
      toast.error('Failed to improve items');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = (index) => {
    onUpdate(index, improvedItems[index]);
    const newImproved = { ...improvedItems };
    delete newImproved[index];
    setImprovedItems(newImproved);
    toast.success('Improvement applied');
  };

  const handleReject = (index) => {
    const newImproved = { ...improvedItems };
    delete newImproved[index];
    setImprovedItems(newImproved);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">AI Batch Improver</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {Object.values(selectedItems).every(v => v === true) ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              size="sm"
              onClick={handleImprove}
              isLoading={isProcessing}
              disabled={Object.values(selectedItems).every(v => !v)}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Improve Selected
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-colors ${
                selectedItems[index] ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems[index] || false}
                  onChange={() => handleSelect(index)}
                  className="mt-1 rounded border-gray-300"
                />
                <div className="flex-1">
                  {improvedItems[index] ? (
                    <div>
                      <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {improvedItems[index]}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(index)}
                          className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(index)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchImprover;