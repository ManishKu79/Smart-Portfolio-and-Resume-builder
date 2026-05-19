const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class PDFService {
  constructor() {
    this.browser = null;
    this.initBrowser();
  }

  async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      logger.info('PDF service initialized');
    } catch (error) {
      logger.error('Failed to initialize PDF service:', error);
    }
  }

  async getBrowser() {
    if (!this.browser) {
      await this.initBrowser();
    }
    return this.browser;
  }

  // Generate PDF from HTML
  async generatePDF(html, options = {}) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Default PDF options
      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px'
        },
        ...options
      };

      // Generate PDF
      const pdf = await page.pdf(pdfOptions);
      return pdf;
    } catch (error) {
      logger.error('PDF generation error:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  // Generate resume PDF
  async generateResumePDF(resume, user, options = {}) {
    const html = this.renderResumeHTML(resume, user, options);
    return await this.generatePDF(html, {
      format: 'A4',
      printBackground: true,
      ...options
    });
  }

  // Generate portfolio PDF
  async generatePortfolioPDF(portfolio, user, options = {}) {
    const html = this.renderPortfolioHTML(portfolio, user, options);
    return await this.generatePDF(html, {
      format: 'A4',
      printBackground: true,
      ...options
    });
  }

  // Render Resume HTML
  renderResumeHTML(resume, user, options = {}) {
    const template = resume.template || 'modern';
    const color = resume.templateColor || '#3B82F6';
    
    const templates = {
      modern: this.renderModernResume,
      classic: this.renderClassicResume,
      creative: this.renderCreativeResume,
      minimal: this.renderMinimalResume,
      professional: this.renderProfessionalResume
    };

    const renderer = templates[template] || this.renderModernResume;
    return renderer.call(this, resume, user, color, options);
  }

  // Modern Resume Template
  renderModernResume(resume, user, color, options) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${resume.personalInfo.fullName} - Resume</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          
          .resume-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
          }
          
          .header {
            background: ${color};
            color: white;
            padding: 40px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
          }
          
          .header .title {
            font-size: 18px;
            opacity: 0.9;
          }
          
          .header .contact {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            font-size: 14px;
          }
          
          .content {
            padding: 40px;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: ${color};
            border-bottom: 2px solid ${color};
            padding-bottom: 8px;
            margin-bottom: 20px;
          }
          
          .experience-item, .education-item, .project-item {
            margin-bottom: 20px;
          }
          
          .item-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .item-subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
          }
          
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .skill-tag {
            background: #f0f0f0;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 14px;
          }
          
          .summary {
            line-height: 1.8;
            margin-bottom: 30px;
          }
          
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="header">
            <h1>${this.escapeHtml(resume.personalInfo.fullName || '')}</h1>
            <div class="title">${this.escapeHtml(resume.personalInfo.jobTitle || '')}</div>
            <div class="contact">
              ${resume.personalInfo.email ? `<span>📧 ${this.escapeHtml(resume.personalInfo.email)}</span>` : ''}
              ${resume.personalInfo.phone ? `<span>📞 ${this.escapeHtml(resume.personalInfo.phone)}</span>` : ''}
              ${resume.personalInfo.location ? `<span>📍 ${this.escapeHtml(resume.personalInfo.location)}</span>` : ''}
              ${resume.personalInfo.linkedin ? `<span>🔗 ${this.escapeHtml(resume.personalInfo.linkedin)}</span>` : ''}
              ${resume.personalInfo.github ? `<span>💻 ${this.escapeHtml(resume.personalInfo.github)}</span>` : ''}
            </div>
          </div>
          
          <div class="content">
            ${resume.personalInfo.summary ? `
              <div class="section">
                <div class="section-title">Professional Summary</div>
                <div class="summary">${this.escapeHtml(resume.personalInfo.summary)}</div>
              </div>
            ` : ''}
            
            ${resume.experience && resume.experience.length > 0 ? `
              <div class="section">
                <div class="section-title">Work Experience</div>
                ${resume.experience.map(exp => `
                  <div class="experience-item">
                    <div class="item-title">${this.escapeHtml(exp.position)}</div>
                    <div class="item-subtitle">${this.escapeHtml(exp.company)} | ${exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - ${exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}</div>
                    <p>${this.escapeHtml(exp.description || '')}</p>
                    ${exp.achievements && exp.achievements.length > 0 ? `
                      <ul style="margin-top: 10px; margin-left: 20px;">
                        ${exp.achievements.map(achievement => `<li>${this.escapeHtml(achievement)}</li>`).join('')}
                      </ul>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${resume.education && resume.education.length > 0 ? `
              <div class="section">
                <div class="section-title">Education</div>
                ${resume.education.map(edu => `
                  <div class="education-item">
                    <div class="item-title">${this.escapeHtml(edu.degree)} in ${this.escapeHtml(edu.field)}</div>
                    <div class="item-subtitle">${this.escapeHtml(edu.institution)} | ${edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - ${edu.current ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}</div>
                    <p>${this.escapeHtml(edu.description || '')}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${resume.skills && resume.skills.length > 0 ? `
              <div class="section">
                <div class="section-title">Skills</div>
                <div class="skills">
                  ${resume.skills.map(skill => `<span class="skill-tag">${this.escapeHtml(skill.name)}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            
            ${resume.projects && resume.projects.length > 0 ? `
              <div class="section">
                <div class="section-title">Projects</div>
                ${resume.projects.map(project => `
                  <div class="project-item">
                    <div class="item-title">${this.escapeHtml(project.name)}</div>
                    <p>${this.escapeHtml(project.description || '')}</p>
                    ${project.technologies && project.technologies.length > 0 ? `
                      <div class="skills" style="margin-top: 10px;">
                        ${project.technologies.map(tech => `<span class="skill-tag">${this.escapeHtml(tech)}</span>`).join('')}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Classic Resume Template
  renderClassicResume(resume, user, color, options) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${resume.personalInfo.fullName} - Resume</title>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.5;
            color: #000;
            background: white;
          }
          
          .resume-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          
          h1 {
            font-size: 28px;
            text-align: center;
            margin-bottom: 5px;
          }
          
          .contact-info {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid #000;
          }
          
          .section {
            margin-bottom: 20px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            margin-bottom: 10px;
            padding-bottom: 5px;
          }
          
          .item {
            margin-bottom: 15px;
          }
          
          .item-header {
            font-weight: bold;
          }
          
          .item-date {
            float: right;
            font-weight: normal;
          }
          
          .item-company {
            font-style: italic;
          }
          
          .skills-list {
            display: inline-block;
            margin-right: 10px;
          }
          
          @media print {
            body {
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <h1>${this.escapeHtml(resume.personalInfo.fullName || '')}</h1>
          <div class="contact-info">
            ${resume.personalInfo.email || ''} | ${resume.personalInfo.phone || ''} | ${resume.personalInfo.location || ''}
          </div>
          
          ${resume.personalInfo.summary ? `
            <div class="section">
              <div class="section-title">Summary</div>
              <p>${this.escapeHtml(resume.personalInfo.summary)}</p>
            </div>
          ` : ''}
          
          ${resume.experience && resume.experience.length > 0 ? `
            <div class="section">
              <div class="section-title">Experience</div>
              ${resume.experience.map(exp => `
                <div class="item">
                  <div class="item-header">
                    ${this.escapeHtml(exp.position)}
                    <span class="item-date">${exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - ${exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}</span>
                  </div>
                  <div class="item-company">${this.escapeHtml(exp.company)}</div>
                  <p>${this.escapeHtml(exp.description || '')}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${resume.skills && resume.skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Skills</div>
              <p>${resume.skills.map(skill => skill.name).join(' • ')}</p>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }

  // Creative Resume Template
  renderCreativeResume(resume, user, color, options) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${resume.personalInfo.fullName} - Resume</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Poppins', 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, ${color}10, #ffffff);
            padding: 40px;
          }
          
          .resume-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          
          .sidebar {
            background: ${color};
            color: white;
            padding: 30px;
            width: 33%;
            float: left;
          }
          
          .main {
            padding: 30px;
            width: 67%;
            float: left;
          }
          
          .name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .title {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 20px;
          }
          
          .contact-item {
            margin-bottom: 10px;
            font-size: 14px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid ${color};
          }
          
          .skill-item {
            margin-bottom: 10px;
          }
          
          .skill-name {
            font-weight: bold;
          }
          
          .skill-bar {
            height: 6px;
            background: rgba(0,0,0,0.1);
            border-radius: 3px;
            margin-top: 5px;
            overflow: hidden;
          }
          
          .skill-level {
            height: 100%;
            background: white;
            border-radius: 3px;
          }
          
          .experience-item, .education-item {
            margin-bottom: 20px;
          }
          
          .item-title {
            font-weight: bold;
            font-size: 16px;
          }
          
          .item-subtitle {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
          }
          
          .clearfix::after {
            content: "";
            clear: both;
            display: table;
          }
          
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="resume-container clearfix">
          <div class="sidebar">
            <div class="name">${this.escapeHtml(resume.personalInfo.fullName || '')}</div>
            <div class="title">${this.escapeHtml(resume.personalInfo.jobTitle || '')}</div>
            
            <div style="margin-top: 30px;">
              <div class="section-title" style="border-bottom-color: white;">Contact</div>
              ${resume.personalInfo.email ? `<div class="contact-item">📧 ${this.escapeHtml(resume.personalInfo.email)}</div>` : ''}
              ${resume.personalInfo.phone ? `<div class="contact-item">📞 ${this.escapeHtml(resume.personalInfo.phone)}</div>` : ''}
              ${resume.personalInfo.location ? `<div class="contact-item">📍 ${this.escapeHtml(resume.personalInfo.location)}</div>` : ''}
            </div>
            
            ${resume.skills && resume.skills.length > 0 ? `
              <div style="margin-top: 30px;">
                <div class="section-title" style="border-bottom-color: white;">Skills</div>
                ${resume.skills.map(skill => `
                  <div class="skill-item">
                    <div class="skill-name">${this.escapeHtml(skill.name)}</div>
                    <div class="skill-bar">
                      <div class="skill-level" style="width: ${skill.level * 20}%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          <div class="main">
            ${resume.personalInfo.summary ? `
              <div class="section">
                <div class="section-title">About Me</div>
                <p>${this.escapeHtml(resume.personalInfo.summary)}</p>
              </div>
            ` : ''}
            
            ${resume.experience && resume.experience.length > 0 ? `
              <div class="section">
                <div class="section-title">Work Experience</div>
                ${resume.experience.map(exp => `
                  <div class="experience-item">
                    <div class="item-title">${this.escapeHtml(exp.position)}</div>
                    <div class="item-subtitle">${this.escapeHtml(exp.company)} | ${exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - ${exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}</div>
                    <p>${this.escapeHtml(exp.description || '')}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${resume.projects && resume.projects.length > 0 ? `
              <div class="section">
                <div class="section-title">Projects</div>
                ${resume.projects.map(project => `
                  <div class="experience-item">
                    <div class="item-title">${this.escapeHtml(project.name)}</div>
                    <p>${this.escapeHtml(project.description || '')}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Minimal Resume Template
  renderMinimalResume(resume, user, color, options) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${resume.personalInfo.fullName} - Resume</title>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: white;
            padding: 60px;
          }
          
          .resume-container {
            max-width: 700px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 50px;
          }
          
          h1 {
            font-size: 42px;
            font-weight: 300;
            letter-spacing: -1px;
            margin-bottom: 10px;
          }
          
          .title {
            font-size: 18px;
            color: #666;
            font-weight: 300;
          }
          
          .contact {
            margin-top: 20px;
            font-size: 14px;
            color: #999;
          }
          
          .section {
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 20px;
            color: #999;
          }
          
          .item {
            margin-bottom: 25px;
          }
          
          .item-title {
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .item-meta {
            font-size: 14px;
            color: #999;
            margin-bottom: 10px;
          }
          
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .skill {
            font-size: 14px;
            color: #666;
          }
          
          hr {
            border: none;
            border-top: 1px solid #eee;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="header">
            <h1>${this.escapeHtml(resume.personalInfo.fullName || '')}</h1>
            <div class="title">${this.escapeHtml(resume.personalInfo.jobTitle || '')}</div>
            <div class="contact">
              ${resume.personalInfo.email || ''} ${resume.personalInfo.phone ? `• ${resume.personalInfo.phone}` : ''} ${resume.personalInfo.location ? `• ${resume.personalInfo.location}` : ''}
            </div>
          </div>
          
          ${resume.personalInfo.summary ? `
            <div class="section">
              <div class="section-title">Profile</div>
              <p>${this.escapeHtml(resume.personalInfo.summary)}</p>
            </div>
          ` : ''}
          
          ${resume.experience && resume.experience.length > 0 ? `
            <div class="section">
              <div class="section-title">Experience</div>
              ${resume.experience.map(exp => `
                <div class="item">
                  <div class="item-title">${this.escapeHtml(exp.position)} at ${this.escapeHtml(exp.company)}</div>
                  <div class="item-meta">${exp.startDate ? new Date(exp.startDate).getFullYear() : ''} — ${exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}</div>
                  <p>${this.escapeHtml(exp.description || '')}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${resume.skills && resume.skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="skills">
                ${resume.skills.map(skill => `<span class="skill">${this.escapeHtml(skill.name)}</span>`).join(' • ')}
              </div>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }

  // Professional Resume Template
  renderProfessionalResume(resume, user, color, options) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${resume.personalInfo.fullName} - Resume</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Georgia', serif;
            color: #2c3e50;
            background: white;
          }
          
          .resume-container {
            max-width: 850px;
            margin: 0 auto;
            padding: 50px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${color};
          }
          
          h1 {
            font-size: 32px;
            color: ${color};
            margin-bottom: 10px;
          }
          
          .title {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 15px;
          }
          
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            font-size: 13px;
            color: #95a5a6;
          }
          
          .two-column {
            display: flex;
            gap: 40px;
            margin-top: 30px;
          }
          
          .left-column {
            flex: 1;
          }
          
          .right-column {
            flex: 2;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: ${color};
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ecf0f1;
          }
          
          .experience-item, .education-item {
            margin-bottom: 20px;
          }
          
          .item-title {
            font-weight: bold;
            font-size: 15px;
          }
          
          .item-company {
            font-style: italic;
            color: #7f8c8d;
            font-size: 13px;
            margin: 5px 0;
          }
          
          .item-date {
            font-size: 12px;
            color: #95a5a6;
          }
          
          .skill-item {
            margin-bottom: 12px;
          }
          
          .skill-name {
            font-weight: 500;
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .skill-bar {
            height: 4px;
            background: #ecf0f1;
            border-radius: 2px;
          }
          
          .skill-progress {
            height: 100%;
            background: ${color};
            border-radius: 2px;
          }
          
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="header">
            <h1>${this.escapeHtml(resume.personalInfo.fullName || '')}</h1>
            <div class="title">${this.escapeHtml(resume.personalInfo.jobTitle || '')}</div>
            <div class="contact-info">
              ${resume.personalInfo.email ? `<span>${this.escapeHtml(resume.personalInfo.email)}</span>` : ''}
              ${resume.personalInfo.phone ? `<span>${this.escapeHtml(resume.personalInfo.phone)}</span>` : ''}
              ${resume.personalInfo.location ? `<span>${this.escapeHtml(resume.personalInfo.location)}</span>` : ''}
              ${resume.personalInfo.linkedin ? `<span>linkedin.com/in/${this.escapeHtml(resume.personalInfo.linkedin)}</span>` : ''}
            </div>
          </div>
          
          <div class="two-column">
            <div class="left-column">
              ${resume.skills && resume.skills.length > 0 ? `
                <div class="section">
                  <div class="section-title">Core Competencies</div>
                  ${resume.skills.map(skill => `
                    <div class="skill-item">
                      <div class="skill-name">${this.escapeHtml(skill.name)}</div>
                      <div class="skill-bar">
                        <div class="skill-progress" style="width: ${skill.level * 20}%;"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${resume.languages && resume.languages.length > 0 ? `
                <div class="section">
                  <div class="section-title">Languages</div>
                  ${resume.languages.map(lang => `
                    <div class="skill-item">
                      <div class="skill-name">${this.escapeHtml(lang.name)}</div>
                      <div class="skill-bar">
                        <div class="skill-progress" style="width: ${this.getLanguageLevel(lang.proficiency)}%;"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            
            <div class="right-column">
              ${resume.personalInfo.summary ? `
                <div class="section">
                  <div class="section-title">Professional Profile</div>
                  <p style="line-height: 1.6;">${this.escapeHtml(resume.personalInfo.summary)}</p>
                </div>
              ` : ''}
              
              ${resume.experience && resume.experience.length > 0 ? `
                <div class="section">
                  <div class="section-title">Professional Experience</div>
                  ${resume.experience.map(exp => `
                    <div class="experience-item">
                      <div class="item-title">${this.escapeHtml(exp.position)}</div>
                      <div class="item-company">${this.escapeHtml(exp.company)}</div>
                      <div class="item-date">${exp.startDate ? new Date(exp.startDate).getFullYear() : ''} — ${exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}</div>
                      <p style="margin-top: 8px; line-height: 1.5;">${this.escapeHtml(exp.description || '')}</p>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${resume.education && resume.education.length > 0 ? `
                <div class="section">
                  <div class="section-title">Education</div>
                  ${resume.education.map(edu => `
                    <div class="education-item">
                      <div class="item-title">${this.escapeHtml(edu.degree)} in ${this.escapeHtml(edu.field)}</div>
                      <div class="item-company">${this.escapeHtml(edu.institution)}</div>
                      <div class="item-date">${edu.startDate ? new Date(edu.startDate).getFullYear() : ''} — ${edu.current ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Render Portfolio HTML
  renderPortfolioHTML(portfolio, user, options = {}) {
    const color = portfolio.customization?.primaryColor || '#3B82F6';
    const theme = portfolio.customization?.layout || 'default';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${portfolio.title} - Portfolio</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: '${portfolio.customization?.fontFamily || 'Inter'}', -apple-system, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: white;
          }
          
          .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 3px solid ${color};
          }
          
          h1 {
            font-size: 36px;
            color: ${color};
            margin-bottom: 15px;
          }
          
          .subtitle {
            font-size: 18px;
            color: #666;
          }
          
          .section {
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 24px;
            color: ${color};
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
          }
          
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .skill {
            background: #f5f5f5;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
          }
          
          .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 30px;
          }
          
          .project-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
          }
          
          .project-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: ${color};
          }
          
          .contact-info {
            margin-top: 20px;
            text-align: center;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
          }
          
          @media print {
            .container {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.escapeHtml(portfolio.title)}</h1>
            ${portfolio.description ? `<div class="subtitle">${this.escapeHtml(portfolio.description)}</div>` : ''}
            ${user ? `<div class="subtitle" style="margin-top: 10px;">${this.escapeHtml(user.name)}</div>` : ''}
          </div>
          
          ${portfolio.sections.filter(s => s.isEnabled).sort((a, b) => a.order - b.order).map(section => {
            switch(section.type) {
              case 'about':
                return `
                  <div class="section">
                    <div class="section-title">${this.escapeHtml(section.title)}</div>
                    <div>${this.escapeHtml(section.content?.description || '')}</div>
                  </div>
                `;
              case 'skills':
                return `
                  <div class="section">
                    <div class="section-title">${this.escapeHtml(section.title)}</div>
                    <div class="skills">
                      ${(section.content?.skills || []).map(skill => `
                        <span class="skill">${this.escapeHtml(skill.name)}</span>
                      `).join('')}
                    </div>
                  </div>
                `;
              case 'projects':
                return `
                  <div class="section">
                    <div class="section-title">${this.escapeHtml(section.title)}</div>
                    <div class="projects-grid">
                      ${(section.content?.projects || []).map(project => `
                        <div class="project-card">
                          <div class="project-title">${this.escapeHtml(project.name)}</div>
                          <p>${this.escapeHtml(project.description || '')}</p>
                          ${project.technologies ? `
                            <div class="skills" style="margin-top: 15px;">
                              ${project.technologies.map(tech => `<span class="skill">${this.escapeHtml(tech)}</span>`).join('')}
                            </div>
                          ` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              default:
                return '';
            }
          }).join('')}
          
          ${portfolio.sections.find(s => s.type === 'contact') ? `
            <div class="contact-info">
              <p>For inquiries, please contact:</p>
              <p>${user?.email || ''}</p>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }

  // Helper: Escape HTML
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Helper: Get language level percentage
  getLanguageLevel(proficiency) {
    const levels = {
      'basic': 25,
      'conversational': 50,
      'fluent': 75,
      'native': 100
    };
    return levels[proficiency] || 50;
  }

  // Close browser on shutdown
  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info('PDF service closed');
    }
  }
}

module.exports = new PDFService();