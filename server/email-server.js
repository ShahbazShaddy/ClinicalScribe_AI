import express from 'express';
import cors from 'cors';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file for local development
// For production (Render), environment variables are set directly in the dashboard
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || process.env.EMAIL_SERVER_PORT || 8787;

// Initialize SendGrid
function ensureSendGridConfig() {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('Missing SENDGRID_API_KEY environment variable');
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'email-server' });
});

app.post('/api/send-email', async (req, res) => {
  try {
    ensureSendGridConfig();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  const { to, toName, subject, body, from, fromName } = req.body || {};

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, and body are required.' });
  }

  const fromEmail = from || process.env.SENDGRID_FROM_EMAIL || 'noreply@clinicalscribe.com';
  const fromNameFinal = fromName || process.env.SENDGRID_FROM_NAME || 'ClinicalScribe AI';

  const msg = {
    to: toName ? { email: to, name: toName } : to,
    from: { email: fromEmail, name: fromNameFinal },
    subject,
    text: body,
    html: body.replace(/\n/g, '<br>'),
  };

  try {
    const [response] = await sgMail.send(msg);
    res.json({ 
      messageId: response.headers['x-message-id'] || `sg-${Date.now()}`,
      status: 'sent'
    });
  } catch (error) {
    console.error('SendGrid send error:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
});
