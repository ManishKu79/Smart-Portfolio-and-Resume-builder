import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useResumeStore } from '../../stores/resumeStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardHeader } from '../ui/Card';
import { 
  Save, 
  Eye, 
  Download, 
  Share2, 
  Plus, 
  Trash2,
  GripVertical,
  Sparkles,
  Template,
  ArrowLeft
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

// Sortable item component
const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

// Experience Form Component
const ExperienceForm = ({ experience, onChange, onRemove }) => {
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <h4 className="font-semibold">{experience.position || 'New Experience'}</h4>
        </div>
        <button onClick={onRemove} className="text-red-500 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company"
          value={experience.company || ''}
          onChange={(e) => onChange('company', e.target.value)}
          placeholder="Company name"
        />
        <Input
          label="Position"
          value={experience.position || ''}
          onChange={(e) => onChange('position', e.target.value)}
          placeholder="Job title"
        />
        <Input
          label="Location"
          value={experience.location || ''}
          onChange={(e) => onChange('location', e.target.value)}
          placeholder="City, State"
        />
        <div className="flex gap-4">
          <Input
            label="Start Date"
            type="date"
            value={experience.startDate ? experience.startDate.split('T')[0] : ''}
            onChange={(e) => onChange('startDate', e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={experience.endDate ? experience.endDate.split('T')[0] : ''}
            onChange={(e) => onChange('endDate', e.target.value)}
            disabled={experience.current}
          />
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={experience.current || false}
              onChange={(e) => onChange('current', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">I currently work here</span>
          </label>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={experience.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2"
            placeholder="Describe your responsibilities and achievements..."
          />
        </div>
      </div>
    </div>
  );
};

// Main Resume Builder Component
const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentResume, 
    templates,
    isLoading,
    createResume,
    updateResume,
    fetchResumeById,
    fetchTemplates,
    setCurrentResume
  } = useResumeStore();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    template: 'modern',
    personalInfo: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: []
  });
  
  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  
  useEffect(() => {
    fetchTemplates();
    if (id) {
      fetchResumeById(id);
    }
  }, [id]);
  
  useEffect(() => {
    if (currentResume && id) {
      setFormData(currentResume);
    }
  }, [currentResume]);
  
  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };
  
  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }));
  };
  
  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };
  
  const handleSave = async () => {
    try {
      if (id) {
        await updateResume(id, formData);
        toast.success('Resume updated successfully!');
      } else {
        const result = await createResume(formData);
        toast.success('Resume created successfully!');
        navigate(`/resume-builder/${result.data._id}`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save resume');
    }
  };
  
  const handleReorder = (arrayName, oldIndex, newIndex) => {
    const items = [...formData[arrayName]];
    const [reorderedItem] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, reorderedItem);
    setFormData(prev => ({ ...prev, [arrayName]: items }));
  };
  
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'template', label: 'Template', icon: '🎨' }
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange(null, 'title', e.target.value)}
                placeholder="Resume Title"
                className="text-2xl font-bold border-none px-0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Last saved: {currentResume?.updatedAt ? new Date(currentResume.updatedAt).toLocaleString() : 'Not saved yet'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
              {isPreview ? <Eye className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Form Tabs */}
          {!isPreview && (
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="text-xl">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Form Content */}
          <div className={isPreview ? 'lg:col-span-4' : 'lg:col-span-3'}>
            {isPreview ? (
              // Preview Mode
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold">Resume Preview</h2>
                  <p className="text-gray-500">This is how your resume will look</p>
                </CardHeader>
                <CardContent>
                  <div className={`resume-preview template-${formData.template} p-8`}>
                    {/* Template-specific rendering will go here */}
                    <div className="text-center">
                      <h1 className="text-3xl font-bold">{formData.personalInfo.fullName}</h1>
                      <p className="text-xl text-gray-600">{formData.personalInfo.jobTitle}</p>
                      <div className="flex justify-center gap-4 mt-4">
                        {formData.personalInfo.email && <span>{formData.personalInfo.email}</span>}
                        {formData.personalInfo.phone && <span>{formData.personalInfo.phone}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Edit Mode
              <Card>
                <CardContent className="p-6">
                  {/* Personal Info Tab */}
                  {activeTab === 'personal' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          value={formData.personalInfo.fullName}
                          onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                          placeholder="John Doe"
                        />
                        <Input
                          label="Job Title"
                          value={formData.personalInfo.jobTitle}
                          onChange={(e) => handleInputChange('personalInfo', 'jobTitle', e.target.value)}
                          placeholder="Software Engineer"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={formData.personalInfo.email}
                          onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                          placeholder="john@example.com"
                        />
                        <Input
                          label="Phone"
                          value={formData.personalInfo.phone}
                          onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                          placeholder="+1 234 567 8900"
                        />
                        <Input
                          label="Location"
                          value={formData.personalInfo.location}
                          onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                          placeholder="New York, NY"
                        />
                        <Input
                          label="LinkedIn"
                          value={formData.personalInfo.linkedin}
                          onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                          placeholder="linkedin.com/in/username"
                        />
                        <Input
                          label="GitHub"
                          value={formData.personalInfo.github}
                          onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                          placeholder="github.com/username"
                        />
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-2">Professional Summary</label>
                          <textarea
                            value={formData.personalInfo.summary}
                            onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                            rows={5}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2"
                            placeholder="Write a brief summary of your professional background..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Experience Tab */}
                  {activeTab === 'experience' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Work Experience</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem('experience', {
                            company: '',
                            position: '',
                            location: '',
                            startDate: '',
                            endDate: '',
                            current: false,
                            description: ''
                          })}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Experience
                        </Button>
                      </div>
                      
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => {
                          const { active, over } = event;
                          if (active.id !== over.id) {
                            const oldIndex = formData.experience.findIndex(i => i._id === active.id);
                            const newIndex = formData.experience.findIndex(i => i._id === over.id);
                            handleReorder('experience', oldIndex, newIndex);
                          }
                        }}
                      >
                        <SortableContext
                          items={formData.experience.map(exp => exp._id || exp)}
                          strategy={verticalListSortingStrategy}
                        >
                          {formData.experience.map((exp, index) => (
                            <SortableItem key={exp._id || index} id={exp._id || index}>
                              <ExperienceForm
                                experience={exp}
                                onChange={(field, value) => handleArrayChange('experience', index, field, value)}
                                onRemove={() => removeArrayItem('experience', index)}
                              />
                            </SortableItem>
                          ))}
                        </SortableContext>
                      </DndContext>
                      
                      {formData.experience.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No work experience added yet. Click the button above to add.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Template Tab */}
                  {activeTab === 'template' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">Choose Template</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              formData.template === template.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'hover:border-gray-400'
                            }`}
                            onClick={() => handleInputChange(null, 'template', template.id)}
                          >
                            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded mb-3 flex items-center justify-center">
                              <Template className="w-12 h-12 text-gray-400" />
                            </div>
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-gray-500">{template.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;