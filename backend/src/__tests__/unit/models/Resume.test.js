const mongoose = require('mongoose');
const Resume = require('../../../models/Resume');
const User = require('../../../models/User');

describe('Resume Model', () => {
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'resume@example.com',
      password: 'password123'
    });
    userId = user._id;
  });

  it('should create a valid resume', async () => {
    const resumeData = {
      userId,
      title: 'Software Engineer Resume',
      template: 'modern',
      personalInfo: {
        fullName: 'John Doe',
        jobTitle: 'Senior Developer',
        email: 'john@example.com',
        phone: '+1234567890'
      }
    };
    
    const resume = await Resume.create(resumeData);
    
    expect(resume._id).toBeDefined();
    expect(resume.userId.toString()).toBe(userId.toString());
    expect(resume.title).toBe(resumeData.title);
    expect(resume.template).toBe('modern');
  });

  it('should fail without required fields', async () => {
    const resume = new Resume({ userId });
    let error;
    
    try {
      await resume.save();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.title).toBeDefined();
  });

  it('should generate shareable link when made public', async () => {
    const resume = await Resume.create({
      userId,
      title: 'Public Resume',
      personalInfo: { fullName: 'John Doe' }
    });
    
    resume.isPublic = true;
    await resume.save();
    
    expect(resume.shareableLink).toBeDefined();
    expect(resume.shareableLink.length).toBe(32);
  });
});