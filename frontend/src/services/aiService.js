import api from './api';

class AIService {
  // Generate professional summary
  async generateSummary(data) {
    const response = await api.post('/ai/generate-summary', data);
    return response.data;
  }
  
  // Improve description/bullet point
  async improveDescription(description, type = 'job_description', context = {}) {
    const response = await api.post('/ai/improve-description', {
      description,
      type,
      context
    });
    return response.data;
  }
  
  // Suggest skills based on job title
  async suggestSkills(jobTitle, currentSkills = [], experienceLevel = 'entry') {
    const response = await api.post('/ai/suggest-skills', {
      jobTitle,
      currentSkills,
      experienceLevel
    });
    return response.data;
  }
  
  // Analyze resume for ATS optimization
  async analyzeATS(resumeId, jobDescription = null) {
    const response = await api.post('/ai/analyze-ats', {
      resumeId,
      jobDescription
    });
    return response.data;
  }
  
  // Optimize resume for specific job
  async optimizeForJob(resumeId, jobDescription) {
    const response = await api.post('/ai/optimize-for-job', {
      resumeId,
      jobDescription
    });
    return response.data;
  }
  
  // Generate interview questions
  async generateInterviewQuestions(resumeId) {
    const response = await api.post('/ai/generate-interview-questions', {
      resumeId
    });
    return response.data;
  }
  
  // Batch improve multiple descriptions
  async batchImprove(descriptions, type = 'job_description') {
    const response = await api.post('/ai/batch-improve', {
      descriptions,
      type
    });
    return response.data;
  }
}

export default new AIService();