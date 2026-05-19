import html2pdf from 'html2pdf.js';

export const exportToPDF = (elementId, options = {}) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  const defaultOptions = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: 'document.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      letterRendering: true,
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'in', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  return html2pdf().set(mergedOptions).from(element).save();
};

export const exportResumeToPDF = async (resumeData, template = 'modern') => {
  // Create a hidden iframe for rendering
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  const html = generateResumeHTML(resumeData, template);
  
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(html);
  iframe.contentWindow.document.close();
  
  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Print from iframe
  iframe.contentWindow.print();
  
  // Remove iframe after printing
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
};

const generateResumeHTML = (resume, template) => {
  // Template HTML generation (similar to backend templates)
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${resume.personalInfo?.fullName || 'Resume'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          color: #2563eb;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${resume.personalInfo?.fullName || ''}</h1>
        <p>${resume.personalInfo?.jobTitle || ''}</p>
        <p>${resume.personalInfo?.email || ''} | ${resume.personalInfo?.phone || ''}</p>
      </div>
      
      ${resume.personalInfo?.summary ? `
        <div class="section">
          <div class="section-title">Summary</div>
          <p>${resume.personalInfo.summary}</p>
        </div>
      ` : ''}
      
      ${resume.experience?.length > 0 ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${resume.experience.map(exp => `
            <div style="margin-bottom: 15px;">
              <strong>${exp.position}</strong> at ${exp.company}<br>
              ${exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - ${exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
              <p>${exp.description || ''}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </body>
    </html>
  `;
};