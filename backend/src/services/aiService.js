const OpenAI = require('openai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = null;
    this.initializeOpenAI();
  }

  initializeOpenAI() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      logger.info('OpenAI service initialized');
    } else {
      logger.warn('OpenAI API key not configured - AI features will use mock responses');
    }
  }

  // Generate professional summary based on user data
  async generateSummary(userData) {
    try {
      const prompt = this.buildSummaryPrompt(userData);
      
      if (!this.openai) {
        return this.getMockSummary(userData);
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume writer. Generate a compelling professional summary based on the user information provided. Keep it concise (2-3 sentences) and impactful.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      logger.error('AI summary generation error:', error);
      return this.getMockSummary(userData);
    }
  }

  // Improve job description or bullet points
  async improveDescription(description, context = {}) {
    try {
      const prompt = `Improve the following ${context.type || 'job description'} to be more professional, impactful, and results-oriented. Use action verbs and quantify achievements where possible.\n\nOriginal: ${description}\n\nImproved version:`;

      if (!this.openai) {
        return this.getMockImprovedDescription(description);
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer. Improve the given text to be more professional, impactful, and ATS-friendly. Use action verbs and quantify achievements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      logger.error('AI description improvement error:', error);
      return this.getMockImprovedDescription(description);
    }
  }

  // Suggest skills based on job title and experience
  async suggestSkills(jobTitle, experience, currentSkills = []) {
    try {
      const prompt = `Based on the job title "${jobTitle}" and experience level, suggest relevant technical and soft skills. Current skills: ${currentSkills.join(', ')}. Suggest 5-10 additional skills that would be valuable.`;

      if (!this.openai) {
        return this.getMockSkills(jobTitle);
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a career advisor. Suggest relevant skills for the given job title and experience level. Return only a comma-separated list of skills.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 150
      });

      const skillsText = response.choices[0].message.content.trim();
      return skillsText.split(',').map(s => s.trim());
    } catch (error) {
      logger.error('AI skill suggestion error:', error);
      return this.getMockSkills(jobTitle);
    }
  }

  // Analyze resume for ATS optimization
  async analyzeATS(resumeData, jobDescription = null) {
    try {
      const prompt = this.buildATSAnalysisPrompt(resumeData, jobDescription);

      if (!this.openai) {
        return this.getMockATSAnalysis(resumeData);
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an ATS (Applicant Tracking System) expert. Analyze the resume and provide a detailed score (0-100) with specific recommendations for improvement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      });

      const analysis = response.choices[0].message.content.trim();
      return this.parseATSAnalysis(analysis);
    } catch (error) {
      logger.error('AI ATS analysis error:', error);
      return this.getMockATSAnalysis(resumeData);
    }
  }

  // Optimize resume for specific job description
  async optimizeForJob(resumeData, jobDescription) {
    try {
      const prompt = `Job Description: ${jobDescription}\n\nResume: ${JSON.stringify(resumeData.personalInfo)} Experience: ${resumeData.experience?.length || 0} items\n\nProvide specific recommendations to tailor this resume for the job description. Include keyword suggestions and content modifications.`;

      if (!this.openai) {
        return this.getMockOptimization();
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a resume optimization expert. Provide specific, actionable recommendations to tailor a resume for a specific job description.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      });

      return {
        success: true,
        recommendations: response.choices[0].message.content.trim(),
        keywords: this.extractKeywords(jobDescription)
      };
    } catch (error) {
      logger.error('AI job optimization error:', error);
      return this.getMockOptimization();
    }
  }

  // Generate interview questions based on resume
  async generateInterviewQuestions(resumeData) {
    try {
      const prompt = `Based on this resume (${resumeData.personalInfo?.jobTitle} with ${resumeData.experience?.length || 0} years of experience), generate 10 common interview questions a recruiter might ask.`;

      if (!this.openai) {
        return this.getMockInterviewQuestions();
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced hiring manager. Generate relevant interview questions based on the resume provided.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const questions = response.choices[0].message.content.trim();
      return questions.split('\n').filter(q => q.trim());
    } catch (error) {
      logger.error('AI interview questions error:', error);
      return this.getMockInterviewQuestions();
    }
  }

  // Build prompt for summary generation
  buildSummaryPrompt(userData) {
    return `Job Title: ${userData.jobTitle || 'Professional'}
Experience: ${userData.experience || 'Entry level'}
Key Skills: ${userData.skills?.join(', ') || 'Various'}
Industry: ${userData.industry || 'Technology'}

Generate a professional summary for this person.`;
  }

  // Build prompt for ATS analysis
  buildATSAnalysisPrompt(resumeData, jobDescription) {
    return `Resume Analysis Request:
Name: ${resumeData.personalInfo?.fullName || 'Unknown'}
Job Title: ${resumeData.personalInfo?.jobTitle || 'Not specified'}
Experience: ${resumeData.experience?.length || 0} positions
Skills: ${resumeData.skills?.length || 0} skills listed
Education: ${resumeData.education?.length || 0} degrees

${jobDescription ? `Target Job Description: ${jobDescription.substring(0, 500)}` : 'No specific job description provided'}

Provide:
1. Overall ATS score (0-100)
2. Strengths (3-5 points)
3. Areas for improvement (3-5 points)
4. Keyword recommendations
5. Formatting suggestions`;
  }

  // Parse ATS analysis response
  parseATSAnalysis(analysis) {
    // Extract score using regex
    const scoreMatch = analysis.match(/(\d+)[-\s]*(?:out of 100|\/100|%)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

    // Extract sections
    const strengths = this.extractSection(analysis, 'strengths?', 3);
    const improvements = this.extractSection(analysis, 'improvements?|areas for improvement', 3);
    const keywords = this.extractSection(analysis, 'keywords?', 5);

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths: strengths,
      improvements: improvements,
      keywords: keywords,
      fullAnalysis: analysis,
      timestamp: new Date().toISOString()
    };
  }

  // Extract section from text
  extractSection(text, sectionName, maxItems = 5) {
    const regex = new RegExp(`${sectionName}:?(.*?)(?=\\n\\s*\\n|\\n\\s*[A-Z]|$)`, 'is');
    const match = text.match(regex);
    
    if (match) {
      const items = match[1].split(/\n/).filter(line => line.trim().length > 0);
      return items.slice(0, maxItems).map(item => item.replace(/^[-*•]\s*/, '').trim());
    }
    
    return [];
  }

  // Extract keywords from job description
  extractKeywords(jobDescription) {
    const commonKeywords = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes', 'Agile', 'Leadership', 'Communication', 'Problem Solving'];
    const found = commonKeywords.filter(keyword => 
      jobDescription.toLowerCase().includes(keyword.toLowerCase())
    );
    return found.slice(0, 10);
  }

  // Mock responses for development (when OpenAI key not available)
  getMockSummary(userData) {
    return `Experienced ${userData.jobTitle || 'professional'} with a demonstrated history of working in the ${userData.industry || 'technology'} industry. Skilled in various technologies and methodologies. Strong professional with a track record of delivering high-quality results.`;
  }

  getMockImprovedDescription(description) {
    return `✓ ${description.charAt(0).toUpperCase() + description.slice(1)}\n✓ Delivered measurable improvements and results\n✓ Collaborated with cross-functional teams to achieve project goals`;
  }

  getMockSkills(jobTitle) {
    const skillsMap = {
      'developer': ['JavaScript', 'Python', 'React', 'Node.js', 'Git', 'SQL', 'REST APIs', 'Agile Methodology'],
      'designer': ['Figma', 'Adobe Creative Suite', 'UI/UX Design', 'Wireframing', 'Prototyping', 'User Research'],
      'manager': ['Project Management', 'Leadership', 'Strategic Planning', 'Budget Management', 'Team Building'],
      'default': ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Critical Thinking']
    };

    for (const [key, skills] of Object.entries(skillsMap)) {
      if (jobTitle.toLowerCase().includes(key)) {
        return skills;
      }
    }
    return skillsMap.default;
  }

  getMockATSAnalysis(resumeData) {
    return {
      score: 78,
      strengths: ['Clear professional summary', 'Relevant experience section', 'Good use of action verbs'],
      improvements: ['Add more quantifiable achievements', 'Include industry keywords', 'Optimize formatting for ATS scanners'],
      keywords: ['Leadership', 'Project Management', 'Strategic Planning'],
      fullAnalysis: 'Mock ATS analysis for development purposes.'
    };
  }

  getMockOptimization() {
    return {
      success: true,
      recommendations: '1. Add more keywords from the job description\n2. Quantify your achievements with specific numbers\n3. Highlight relevant experience at the top\n4. Customize your professional summary',
      keywords: ['JavaScript', 'React', 'Node.js', 'AWS']
    };
  }

  getMockInterviewQuestions() {
    return [
      'Tell me about yourself and your professional background.',
      'What are your greatest professional strengths?',
      'Describe a challenging project you worked on.',
      'Where do you see yourself in 5 years?',
      'Why are you interested in this position?'
    ];
  }
}

module.exports = new AIService();