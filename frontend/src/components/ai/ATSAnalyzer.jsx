import React, { useState } from 'react';
import aiService from '../../services/aiService';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader } from '../ui/Card';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ATSAnalyzer = ({ resumeId, onScoreUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showJobDescription, setShowJobDescription] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeATS(
        resumeId,
        showJobDescription ? jobDescription : null
      );
      setAnalysis(result.data);
      if (onScoreUpdate) {
        onScoreUpdate(result.data.score);
      }
      toast.success('ATS analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">ATS Resume Analyzer</h3>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showJobDescription}
              onChange={(e) => setShowJobDescription(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Target specific job</span>
          </label>
        </div>
      </CardHeader>
      
      <CardContent>
        {showJobDescription && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2"
              placeholder="Paste the job description here for targeted analysis..."
            />
          </div>
        )}
        
        <Button
          onClick={handleAnalyze}
          isLoading={isAnalyzing}
          className="w-full mb-6"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Analyze Resume
            </>
          )}
        </Button>
        
        {analysis && (
          <div className="space-y-6">
            {/* Score Section */}
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">
                <span className={getScoreColor(analysis.score)}>{analysis.score}</span>
                <span className="text-2xl text-gray-400">/100</span>
              </div>
              <div className="text-lg font-semibold mb-1">{getScoreLabel(analysis.score)}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
            </div>
            
            {/* Strengths */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Areas for Improvement */}
            {analysis.improvements && analysis.improvements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-yellow-600 mt-0.5">!</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Keywords */}
            {analysis.keywords && analysis.keywords.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Recommended Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ATSAnalyzer;