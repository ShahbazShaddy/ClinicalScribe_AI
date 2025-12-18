<div align="center">

# 🩺 ClinicalScribe AI

### AI-Powered Clinical Practice Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**Document • Analyze • Communicate • Optimize**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [API Reference](#-api-reference)

</div>

---

## 📋 Problem Statement

Healthcare professionals spend a significant portion of their time on administrative tasks rather than patient care. Studies show that physicians spend nearly **2 hours on documentation for every 1 hour of patient interaction**. This leads to:

- **Burnout & Fatigue**: Endless paperwork contributes to physician burnout
- **Reduced Patient Time**: Less face-to-face time with patients
- **Documentation Errors**: Manual documentation is prone to errors and inconsistencies
- **Missed Risk Indicators**: Without automated analysis, critical patient risk factors can be overlooked
- **Communication Gaps**: Fragmented patient communication leads to poor follow-up care
- **Limited Insights**: Lack of real-time practice analytics hinders data-driven decisions

**ClinicalScribe AI** addresses these challenges by providing an all-in-one AI-powered platform that automates clinical documentation, analyzes patient risk in real-time, and streamlines patient communication.

---

## ✨ Features

### 🎤 Smart Clinical Documentation
- **Voice-to-Text Transcription**: Record patient conversations and get instant AI transcriptions using Whisper Large V3
- **Structured Note Generation**: Automatically generate clinical notes.
- **Real-time Alerts**: Detect critical information during recording (drug interactions, allergies, vital abnormalities)

### ❤️ Real-Time Risk Assessment
- **AI-Powered Analysis**: Automatic patient risk scoring (0-100) with risk levels:
  - 🟢 **Low** (0-25): Stable, routine visits
  - 🟡 **Moderate** (26-50): Requires monitoring
  - 🟠 **High** (51-75): Significant concerns
  - 🔴 **Critical** (76-100): Life-threatening conditions
- **Risk Factor Identification**: Detailed breakdown of contributing risk factors
- **Trend Tracking**: Monitor patient risk changes over time
- **Smart Recommendations**: AI-generated follow-up recommendations and care suggestions

### 👥 Patient Management
- **Comprehensive Patient Profiles**: Demographics, diagnoses, medications, allergies, insurance
- **Visit History**: Complete timeline of all patient encounters
- **Risk History Tracking**: Historical risk assessments and trends
- **Patient Search & Filtering**: Quick access by name, risk level, or condition

### 💬 Patient Communication Hub
- **AI Chatbot**: Context-aware chatbot for patient interactions using complete medical history
- **Email Composer**: AI-generated personalized patient emails
- **Communication History**: Track all patient communications

### 📊 Practice Analytics Dashboard
- **Morning Briefing**: Daily overview of high-priority patients and tasks
- **Practice Statistics**: Patient counts, visit trends, risk distributions
- **Visual Charts**: Interactive charts for visit patterns, age demographics, risk distribution
- **High-Risk Alerts**: Immediate visibility into patients requiring attention
- **Follow-up Tracking**: Never miss a scheduled follow-up

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework with modern hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Beautiful, accessible UI components |
| **Recharts** | Interactive data visualizations |
| **React Router** | Client-side routing |
| **React Query** | Server state management |
| **React Hook Form** | Form handling with validation |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database & authentication |
| **Drizzle ORM** | Type-safe database operations |
| **Express.js** | Email server backend |
| **Nodemailer** | Email delivery |

### AI & Machine Learning
| Technology | Purpose |
|------------|---------|
| **Groq API** | Ultra-fast LLM inference |
| **LLaMA 3.3 70B** | Text generation & analysis |
| **Whisper Large V3** | Speech-to-text transcription |

### Additional Tools
| Technology | Purpose |
|------------|---------|
| **Lucide React** | Beautiful icon library |
| **date-fns** | Date manipulation |
| **jsPDF** | PDF generation for notes |
| **Sonner** | Toast notifications |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **Groq API Key** - [Get one free](https://console.groq.com/)
- **Supabase Account** - [Create account](https://supabase.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/clinicalscribe-ai.git
   cd clinicalscribe-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Groq API for AI features
   VITE_GROQ_API_KEY=your_groq_api_key
   
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Email Server (optional)
   EMAIL_HOST=smtp.your-provider.com
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASS=your_password
   ```

4. **Set up the database**
   ```bash
   # Generate migrations
   npm run db:generate
   
   # Push schema to Supabase
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Optional: Start Email Server
```bash
npm run email-server
```

---

## 📁 Architecture

```
clinicalscribe-ai/
├── public/                 # Static assets
├── server/
│   └── email-server.js     # Express email service
├── src/
│   ├── components/         # React components
│   │   ├── layout/         # Layout components
│   │   ├── templates/      # Email/note templates
│   │   └── ui/             # shadcn/ui components
│   ├── config/             # App configuration
│   ├── db/                 # Database layer
│   │   ├── client.ts       # Supabase client
│   │   ├── schema.ts       # Drizzle schema
│   │   └── services.ts     # Database services
│   ├── hooks/              # Custom React hooks
│   │   ├── useAI.ts        # AI service hook
│   │   ├── useChat.ts      # Chat functionality
│   │   ├── useDatabase.ts  # Database operations
│   │   └── usePatientChat.ts
│   ├── lib/                # Utilities & data
│   ├── pages/              # Page components
│   ├── services/           # External services
│   │   ├── emailService.ts
│   │   ├── riskAssessment.ts
│   │   ├── speechToText.ts
│   │   └── textGeneration.ts
│   └── types/              # TypeScript types
├── supabase/
│   └── migrations/         # Database migrations
└── package.json
```

---

## 🔌 API Reference

### AI Services

#### Speech-to-Text
```typescript
import { transcribeAudio } from '@/services/speechToText';

const result = await transcribeAudio(audioFile, 'en', prompt, verbose);
// Returns: { text: string, segments?: TranscriptionSegment[] }
```

#### Text Generation
```typescript
import { generateText, streamText } from '@/services/textGeneration';

// Standard generation
const response = await generateText(messages, systemPrompt, temperature, maxTokens);

// Streaming
await streamText(messages, systemPrompt, temp, tokens, (chunk) => console.log(chunk));
```

#### Risk Assessment
```typescript
import { analyzeVisitRisk } from '@/services/riskAssessment';

const assessment = await analyzeVisitRisk(visitData, patientData, previousVisits);
// Returns: { riskLevel, riskScore, riskFactors, summary, concerns, recommendations }
```

### Database Services

```typescript
import { 
  createPatient, 
  getPatientsByUserId, 
  createVisit,
  getDashboardStats,
  getHighRiskPatients 
} from '@/db/services';
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run email-server` | Start email backend |
| `npm run db:generate` | Generate DB migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

---

## 🔒 Security & Compliance

- **HIPAA Considerations**: Built with healthcare compliance in mind
- **Data Encryption**: All data encrypted in transit and at rest
- **Row Level Security**: Supabase RLS ensures data isolation
- **No PHI in Logs**: Sensitive data is never logged
- **Secure API Keys**: Environment-based configuration

> ⚠️ **Note**: For production healthcare use, ensure full HIPAA compliance review and implement additional security measures as required by your organization.

---

## 🗺 Roadmap

- [ ] Multi-provider support (OpenAI, Anthropic)
- [ ] Mobile application (React Native)
- [ ] EHR integrations (Epic, Cerner)
- [ ] Voice commands during recording
- [ ] Appointment scheduling
- [ ] Billing code suggestions (CPT/ICD-10)
- [ ] Multi-language support
- [ ] Offline mode with sync

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for ultra-fast AI inference
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Whisper](https://openai.com/research/whisper) for speech recognition

---

<div align="center">

**Built with ❤️ for Healthcare Professionals**

[⬆ Back to Top](#-clinicalscribe-ai)

</div>
