import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useResumeStore } from '../../stores/resumeStore';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import PDFExportButton from '../pdf/PDFExportButton';
import { 
  FileText, 
  MoreVertical, 
  Eye, 
  Copy, 
  Trash2, 
  Globe, 
  Lock,
  Archive,
  Download
} from 'lucide-react';

<PDFExportButton 
  type="resume" 
  id={resume._id} 
  label="Export PDF"
  variant="ghost"
  size="sm"
/>

import { toast } from 'sonner';

const ResumeList = () => {
  const { resumes, isLoading, fetchResumes, deleteResume, duplicateResume, togglePublic, archiveResume } = useResumeStore();
  const [menuOpen, setMenuOpen] = useState(null);
  
  useEffect(() => {
    fetchResumes();
  }, []);
  
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteResume(id);
        toast.success('Resume deleted successfully');
      } catch (error) {
        toast.error('Failed to delete resume');
      }
    }
  };
  
  const handleDuplicate = async (id) => {
    try {
      await duplicateResume(id);
      toast.success('Resume duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate resume');
    }
  };
  
  const handleTogglePublic = async (id) => {
    try {
      await togglePublic(id);
      toast.success('Resume visibility updated');
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };
  
  const handleArchive = async (id) => {
    try {
      await archiveResume(id);
      toast.success('Resume archived');
    } catch (error) {
      toast.error('Failed to archive resume');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (resumes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Resumes Yet</h3>
          <p className="text-gray-500 mb-6">Create your first resume to get started</p>
          <Link to="/resume-builder/new">
            <Button>Create Resume</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resumes.filter(r => !r.isArchived).map((resume) => (
        <Card key={resume._id} hover>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{resume.title}</h3>
                  <p className="text-sm text-gray-500">
                    Updated {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === resume._id ? null : resume._id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {menuOpen === resume._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-10">
                    <Link
                      to={`/resume-builder/${resume._id}`}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDuplicate(resume._id)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleTogglePublic(resume._id)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      {resume.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      {resume.isPublic ? 'Make Private' : 'Make Public'}
                    </button>
                    <button
                      onClick={() => handleArchive(resume._id)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => handleDelete(resume._id, resume.title)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {resume.personalInfo?.jobTitle && (
                <p className="text-sm text-gray-600">{resume.personalInfo.jobTitle}</p>
              )}
              {resume.atsScore > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">ATS Score:</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${resume.atsScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{resume.atsScore}%</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>👁️ {resume.views || 0} views</span>
                <span>⬇️ {resume.downloads || 0} downloads</span>
              </div>
              {resume.isPublic && resume.shareableLink && (
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/resume/public/${resume.shareableLink}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Link copied to clipboard');
                  }}
                  className="text-primary-600 hover:text-primary-700"
                >
                  Share
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResumeList;