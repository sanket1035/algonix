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
    
    const launchArgs = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ]
    };
    
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchArgs.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchArgs);
    
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

// View certificate HTML
router.get('/view/:certificateId', auth, async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate = req.user.certificates.id(certificateId);
    
    if (!certificate) {
      return res.status(404).send('Certificate not found');
    }

    const html = generateCertificateHTML(req.user, certificate);
    
    // Add print trigger script
    const printableHtml = html.replace('</body>', `
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>`);

    res.setHeader('Content-Type', 'text/html');
    res.send(printableHtml);
  } catch (error) {
    res.status(500).send('Server error: ' + error.message);
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

  const earnedDate = new Date(certificate.earnedAt);
  const yyyy = earnedDate.getFullYear();
  const mm = String(earnedDate.getMonth() + 1).padStart(2, '0');
  const dd = String(earnedDate.getDate()).padStart(2, '0');
  const sigDateStr = `${yyyy}.${mm}.${dd}`;

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
        .digital-signature {
          position: relative;
          display: inline-block;
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          border-radius: 4px;
          background: #f8fafc;
          width: 250px;
          text-align: left;
          box-sizing: border-box;
        }
        .checkmark-bg {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%) rotate(-10deg);
          opacity: 0.2;
          pointer-events: none;
          z-index: 1;
        }
        .sig-info {
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px;
          color: #334155;
          line-height: 1.4;
          font-weight: bold;
          position: relative;
          z-index: 2;
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
          <div class="digital-signature">
            <div class="checkmark-bg">
              <svg width="70" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#10B981" />
              </svg>
            </div>
            <div class="sig-info">
              <div>Digitally signed by Algonix Founder</div>
              <div>Date: ${sigDateStr}</div>
              <div>Reason: Successful Completion</div>
              <div>Location: Nashik</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;