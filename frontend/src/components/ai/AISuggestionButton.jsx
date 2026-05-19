import React, { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import aiService from '../../services/aiService';
import { toast } from 'sonner';

const AISuggestionButton = ({ 
  type, 
  data, 
  onAccept, 
  onReject,
  variant = 'ghost',
  size = 'sm',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const getSuggestion = async () => {
    setIsLoading(true);
    try {
      let result;
      switch (type) {
        case 'summary':
          result = await aiService.generateSummary(data);
          setSuggestion(result.data.summary);
          break;
        case 'description':
          result = await aiService.improveDescription(data.description, data.type);
          setSuggestion(result.data.improved);
          break;
        case 'skills':
          result = await aiService.suggestSkills(data.jobTitle, data.currentSkills);
          setSuggestion(result.data.suggestedSkills);
          break;
        default:
          return;
      }
      setShowSuggestion(true);
    } catch (error) {
      toast.error('Failed to generate AI suggestion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    onAccept(suggestion);
    setShowSuggestion(false);
    setSuggestion(null);
    toast.success('AI suggestion applied!');
  };

  const handleReject = () => {
    onReject();
    setShowSuggestion(false);
    setSuggestion(null);
  };

  return (
    <>
      <button
        onClick={getSuggestion}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          variant === 'primary' 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            : 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
        } ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        <span className="text-sm">AI Suggest</span>
      </button>

      {showSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold">AI Suggestion</h3>
                </div>
                <button onClick={handleReject} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                {type === 'skills' && Array.isArray(suggestion) ? (
                  <div className="flex flex-wrap gap-2">
                    {suggestion.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {suggestion}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleAccept}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply Suggestion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AISuggestionButton;