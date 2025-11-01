const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate certificate PDF
router.get('/generate/:certificateId', auth, async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate = req.user.certificates.id(certificateId);
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const html = generateCertificateHTML(req.user, certificate);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.name.replace(/\s+/g, '_')}_Certificate.pdf"`);
    res.send(pdf);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user certificates
router.get('/my-certificates', auth, async (req, res) => {
  try {
    res.json(req.user.certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

function generateCertificateHTML(user, certificate) {
  const userName = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || user.username;
  const date = certificate.earnedAt.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Georgia', serif;
          margin: 0;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .certificate {
          background: white;
          padding: 60px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 800px;
          width: 100%;
          border: 8px solid #f8f9fa;
          position: relative;
        }
        .certificate::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 3px solid #667eea;
          border-radius: 10px;
        }
        .header {
          margin-bottom: 40px;
        }
        .logo {
          font-size: 48px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 10px;
        }
        .title {
          font-size: 36px;
          color: #2c3e50;
          margin-bottom: 20px;
          font-weight: normal;
        }
        .subtitle {
          font-size: 18px;
          color: #7f8c8d;
          margin-bottom: 40px;
        }
        .recipient {
          font-size: 28px;
          color: #2c3e50;
          margin-bottom: 30px;
          font-weight: bold;
        }
        .achievement {
          font-size: 24px;
          color: #667eea;
          margin-bottom: 40px;
          font-weight: bold;
        }
        .details {
          font-size: 16px;
          color: #7f8c8d;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 60px;
          padding-top: 30px;
          border-top: 2px solid #ecf0f1;
        }
        .date {
          font-size: 14px;
          color: #7f8c8d;
        }
        .signature {
          text-align: center;
        }
        .signature-line {
          border-top: 2px solid #2c3e50;
          width: 200px;
          margin-bottom: 10px;
        }
        .signature-text {
          font-size: 14px;
          color: #7f8c8d;
        }
        .badge {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <div class="logo">ALGONIX</div>
          <div class="title">Certificate of Achievement</div>
          <div class="subtitle">This is to certify that</div>
        </div>
        
        <div class="recipient">${userName}</div>
        
        <div class="achievement">has successfully completed</div>
        
        <div class="badge">${certificate.name}</div>
        
        <div class="details">
          This certificate recognizes the completion of ${certificate.level} level challenges
          and demonstrates proficiency in algorithmic problem solving and programming skills.
        </div>
        
        <div class="footer">
          <div class="date">
            Issued on ${date}
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-text">Algonix Platform</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;