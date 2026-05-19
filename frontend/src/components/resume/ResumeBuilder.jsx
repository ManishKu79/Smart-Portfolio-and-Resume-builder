// UPDATED ResumeBuilder.jsx
// Added:
// ✅ AI Summary Generator
// ✅ AI Description Improver
// ✅ ATS Analyzer Tab
// ✅ Batch Improver Tab
// ✅ Fixed Tabs
// ✅ Improved Structure

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useResumeStore } from '../../stores/resumeStore';
import { useAuthStore } from '../../stores/authStore';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardHeader } from '../ui/Card';

import AISuggestionButton from '../ai/AISuggestionButton';
import ATSAnalyzer from '../ai/ATSAnalyzer';
import BatchImprover from '../ai/BatchImprover';

import {
  Save,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  Template,
  ArrowLeft
} from 'lucide-react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

// SORTABLE ITEM
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
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners}>
        {children}
      </div>
    </div>
  );
};

// EXPERIENCE FORM
const ExperienceForm = ({
  experience,
  index,
  handleArrayChange,
  removeArrayItem
}) => {
  return (
    <div className="border rounded-xl p-5 mb-5 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <h4 className="font-semibold text-lg">
            {experience.position || 'New Experience'}
          </h4>
        </div>

        <button
          onClick={() => removeArrayItem('experience', index)}
          className="text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input
          label="Company"
          value={experience.company || ''}
          onChange={(e) =>
            handleArrayChange(
              'experience',
              index,
              'company',
              e.target.value
            )
          }
        />

        <Input
          label="Position"
          value={experience.position || ''}
          onChange={(e) =>
            handleArrayChange(
              'experience',
              index,
              'position',
              e.target.value
            )
          }
        />

        <Input
          label="Location"
          value={experience.location || ''}
          onChange={(e) =>
            handleArrayChange(
              'experience',
              index,
              'location',
              e.target.value
            )
          }
        />

        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">
              Description
            </label>

            <AISuggestionButton
              type="description"
              data={{
                description: experience.description || '',
                type: 'job_description'
              }}
              onAccept={(suggestion) =>
                handleArrayChange(
                  'experience',
                  index,
                  'description',
                  suggestion
                )
              }
              onReject={() => {}}
            />
          </div>

          <textarea
            rows={4}
            value={experience.description || ''}
            onChange={(e) =>
              handleArrayChange(
                'experience',
                index,
                'description',
                e.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3"
            placeholder="Describe your work..."
          />
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT
const ResumeBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    currentResume,
    templates,
    isLoading,
    createResume,
    updateResume,
    fetchResumeById,
    fetchTemplates
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
    projects: [],

    atsScore: 0
  });

  // DND
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // LOAD DATA
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

  // INPUT CHANGE
  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // ARRAY CHANGE
  const handleArrayChange = (
    arrayName,
    index,
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  // ADD ITEM
  const addArrayItem = (arrayName, defaultItem) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }));
  };

  // REMOVE ITEM
  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter(
        (_, i) => i !== index
      )
    }));
  };

  // SAVE
  const handleSave = async () => {
    try {
      if (id) {
        await updateResume(id, formData);

        toast.success('Resume updated!');
      } else {
        const result = await createResume(formData);

        toast.success('Resume created!');

        navigate(`/resume-builder/${result.data._id}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // TABS
  const tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'experience', label: 'Experience' },
    { id: 'template', label: 'Template' },
    { id: 'ats', label: 'ATS Analyzer' },
    { id: 'batch', label: 'AI Improve' }
  ];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">

      <div className="container mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <Input
              value={formData.title}
              onChange={(e) =>
                handleInputChange(
                  null,
                  'title',
                  e.target.value
                )
              }
              placeholder="Resume Title"
              className="text-2xl font-bold border-none"
            />
          </div>

          <div className="flex gap-3">

            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? 'Edit' : 'Preview'}
            </Button>

            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>

          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* SIDEBAR */}
          {!isPreview && (
            <div className="lg:col-span-1">

              <Card>
                <CardContent className="p-4">

                  <div className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full p-3 rounded-lg text-left transition ${
                          activeTab === tab.id
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                </CardContent>
              </Card>

            </div>
          )}

          {/* MAIN */}
          <div className={isPreview ? 'lg:col-span-4' : 'lg:col-span-3'}>

            <Card>

              <CardContent className="p-6">

                {/* PERSONAL */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">

                    <h3 className="text-2xl font-bold">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <Input
                        label="Full Name"
                        value={formData.personalInfo.fullName}
                        onChange={(e) =>
                          handleInputChange(
                            'personalInfo',
                            'fullName',
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Job Title"
                        value={formData.personalInfo.jobTitle}
                        onChange={(e) =>
                          handleInputChange(
                            'personalInfo',
                            'jobTitle',
                            e.target.value
                          )
                        }
                      />

                      <div className="col-span-2">

                        <div className="flex items-center justify-between mb-2">

                          <label className="text-sm font-medium">
                            Professional Summary
                          </label>

                          <AISuggestionButton
                            type="summary"
                            data={{
                              jobTitle:
                                formData.personalInfo.jobTitle,
                              experience: `${
                                formData.experience?.length || 0
                              } years`,
                              skills:
                                formData.skills?.map(
                                  (s) => s.name
                                ) || []
                            }}
                            onAccept={(suggestion) =>
                              handleInputChange(
                                'personalInfo',
                                'summary',
                                suggestion
                              )
                            }
                            onReject={() => {}}
                          />

                        </div>

                        <textarea
                          rows={5}
                          value={
                            formData.personalInfo.summary
                          }
                          onChange={(e) =>
                            handleInputChange(
                              'personalInfo',
                              'summary',
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3"
                        />

                      </div>

                    </div>
                  </div>
                )}

                {/* EXPERIENCE */}
                {activeTab === 'experience' && (
                  <div>

                    <div className="flex justify-between items-center mb-6">

                      <h3 className="text-2xl font-bold">
                        Experience
                      </h3>

                      <Button
                        onClick={() =>
                          addArrayItem('experience', {
                            company: '',
                            position: '',
                            location: '',
                            description: ''
                          })
                        }
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </Button>

                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                    >
                      <SortableContext
                        items={formData.experience.map(
                          (_, i) => i
                        )}
                        strategy={
                          verticalListSortingStrategy
                        }
                      >

                        {formData.experience.map(
                          (experience, index) => (
                            <SortableItem
                              key={index}
                              id={index}
                            >
                              <ExperienceForm
                                experience={experience}
                                index={index}
                                handleArrayChange={
                                  handleArrayChange
                                }
                                removeArrayItem={
                                  removeArrayItem
                                }
                              />
                            </SortableItem>
                          )
                        )}

                      </SortableContext>
                    </DndContext>

                  </div>
                )}

                {/* TEMPLATE */}
                {activeTab === 'template' && (
                  <div>

                    <h3 className="text-2xl font-bold mb-6">
                      Templates
                    </h3>

                    <div className="grid grid-cols-2 gap-5">

                      {templates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() =>
                            handleInputChange(
                              null,
                              'template',
                              template.id
                            )
                          }
                          className={`border rounded-xl p-4 cursor-pointer ${
                            formData.template === template.id
                              ? 'border-primary-600'
                              : ''
                          }`}
                        >
                          <Template className="w-10 h-10 mb-3" />

                          <h4 className="font-semibold">
                            {template.name}
                          </h4>

                          <p className="text-sm text-gray-500">
                            {template.description}
                          </p>

                        </div>
                      ))}

                    </div>
                  </div>
                )}

                {/* ATS */}
                {activeTab === 'ats' && (
                  <ATSAnalyzer
                    resumeId={id}
                    onScoreUpdate={(score) => {
                      setFormData((prev) => ({
                        ...prev,
                        atsScore: score
                      }));
                    }}
                  />
                )}

                {/* BATCH */}
                {activeTab === 'batch' && (
                  <BatchImprover
                    items={formData.experience
                      .flatMap((exp) =>
                        exp.description
                          ? [exp.description]
                          : []
                      )
                      .filter(Boolean)}
                    type="achievement"
                    onUpdate={(index, improved) => {
                      const updated =
                        [...formData.experience];

                      updated[index].description =
                        improved;

                      setFormData((prev) => ({
                        ...prev,
                        experience: updated
                      }));
                    }}
                  />
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;