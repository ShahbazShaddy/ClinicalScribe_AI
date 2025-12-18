import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || process.env.EMAIL_SERVER_PORT || 8787;

function ensureSmtpConfig() {
  const required = [
    'VITE_SMTP_HOST',
    'VITE_SMTP_PORT',
    'VITE_SMTP_USER',
    'VITE_SMTP_PASSWORD',
    'VITE_SMTP_FROM_EMAIL',
  ];

  const missing = required.filter((key) => !process.env[key] || process.env[key]?.length === 0);
  if (missing.length > 0) {
    throw new Error(`Missing SMTP environment variables: ${missing.join(', ')}`);
  }
}

app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'email-server' });
});

app.post('/api/send-email', async (req, res) => {
  try {
    ensureSmtpConfig();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  const { to, toName, subject, body, from, fromName } = req.body || {};

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, and body are required.' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.VITE_SMTP_HOST,
    port: parseInt(process.env.VITE_SMTP_PORT || '587', 10),
    secure: process.env.VITE_SMTP_SECURE === 'true',
    auth: {
      user: process.env.VITE_SMTP_USER,
      pass: process.env.VITE_SMTP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `${fromName || process.env.VITE_SMTP_FROM_NAME || 'ClinicalScribe AI'} <${from || process.env.VITE_SMTP_FROM_EMAIL}>`,
      to: toName ? `${toName} <${to}>` : to,
      subject,
      text: body,
    });

    res.json({ messageId: info.messageId });
  } catch (error) {
    console.error('SMTP send error:', error);
    res.status(500).json({ error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
});
