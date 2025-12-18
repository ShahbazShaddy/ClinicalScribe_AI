import { Shield, Lock, Clock, FileText, Stethoscope, CheckCircle, BarChart3, Users, MessageSquare, Mail, TrendingUp, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onNavigate: () => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">ClinicalScribe AI</span>
          </div>
          <Button onClick={onNavigate} variant="outline">
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary-50 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <div className="trust-badge">
                <Shield className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="trust-badge">
                <Lock className="w-4 h-4" />
                <span>Bank-Level Encryption</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Complete AI-Powered Clinical Practice Management
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Document • Analyze • Communicate • Optimize
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              All-in-one platform combining AI clinical documentation, real-time patient risk assessment, 
              intelligent patient communication, and comprehensive practice analytics.
            </p>

            <Button 
              onClick={onNavigate}
              size="lg"
              className="text-lg px-8 py-6 h-auto medical-gradient hover:opacity-90 transition-opacity"
            >
              Start Free Trial
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Modern Clinical Practice
            </h2>
            <p className="text-lg text-muted-foreground">
              Six integrated modules to transform your workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1: Documentation */}
            <div className="p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Documentation</h3>
              <p className="text-muted-foreground">
                AI-transcribed patient conversations into structured clinical notes. SOAP, Progress, Consultation, H&P formats with automatic medical terminology.
              </p>
            </div>

            {/* Feature 2: Risk Assessment */}
            <div className="p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Risk Assessment</h3>
              <p className="text-muted-foreground">
                AI analyzes patient visits and automatically assigns risk levels (Low, Moderate, High, Critical) with detailed factors and recommendations.
              </p>
            </div>

            {/* Feature 3: Patient Chat */}
            <div className="p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Patient Communication Hub</h3>
              <p className="text-muted-foreground">
                AI-powered chatbot for patient interactions. Answer common questions, provide follow-up instructions, and maintain patient engagement.
              </p>
            </div>

            {/* Feature 4: Email Management */}
            <div className="p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Email Composer</h3>
              <p className="text-muted-foreground">
                Generate personalized patient emails automatically. Edit, regenerate with custom prompts, and track all communications with full history.
              </p>
            </div>

            {/* Feature 5: Patient Management */}
            <div className="p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Complete Patient Records</h3>
              <p className="text-muted-foreground">
                Comprehensive patient profiles with visit history, diagnoses, medications, allergies, insurance info, and risk trends over time.
              </p>
            </div>

            {/* Feature 6: Analytics Dashboard */}
            <div className="p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Practice Analytics</h3>
              <p className="text-muted-foreground">
                Real-time dashboard with morning briefing, patient statistics, risk trends, visit frequency, and high-risk patient alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Complete Workflow
            </h2>
            <p className="text-lg text-muted-foreground">From patient visit to follow-up communication</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Record & Document</h3>
              <p className="text-muted-foreground text-sm">
                Record patient conversation. AI transcribes and generates structured clinical notes instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Assess Risk</h3>
              <p className="text-muted-foreground text-sm">
                AI automatically analyzes visit and assigns risk level with detailed factors and recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Communicate</h3>
              <p className="text-muted-foreground text-sm">
                Generate personalized emails or engage via patient chatbot. Track all communications in one place.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold mb-3">Optimize Care</h3>
              <p className="text-muted-foreground text-sm">
                Monitor trends, identify high-risk patients, and optimize your practice with real-time analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="py-20 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Powerful Capabilities Built In
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'AI-powered transcription & documentation',
                'Real-time patient risk analysis & alerts',
                'Intelligent patient communication',
                'Customizable clinical note templates',
                'Complete patient record management',
                'Risk trend analysis & visualization',
                'Email history & tracking',
                'Regenerate emails with custom prompts',
                'High-risk patient dashboard',
                'Practice statistics & metrics',
                'HIPAA-compliant secure storage',
                'Multi-patient visit management'
              ].map((capability, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-card p-4 rounded-lg border border-primary-200">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{capability}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Enterprise-Grade Security
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg border border-border bg-background text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">HIPAA Compliant</h3>
              <p className="text-muted-foreground text-sm">
                Full HIPAA compliance with all required safeguards and patient privacy protections.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-background text-center">
              <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-muted-foreground text-sm">
                Bank-level encryption for all data in transit and at rest. Your patient data is always protected.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-background text-center">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Audit Logging</h3>
              <p className="text-muted-foreground text-sm">
                Complete audit trails for compliance monitoring and data access tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-b from-primary-50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Transform Your Practice
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 text-lg">
                <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                <span><strong>Save 2-3 hours daily</strong> on documentation and administrative tasks</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-lg">
                <Heart className="w-6 h-6 text-primary flex-shrink-0" />
                <span><strong>Improve patient outcomes</strong> with AI-driven risk assessment and early alerts</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-lg">
                <MessageSquare className="w-6 h-6 text-primary flex-shrink-0" />
                <span><strong>Enhanced patient engagement</strong> through personalized communication</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-lg">
                <BarChart3 className="w-6 h-6 text-primary flex-shrink-0" />
                <span><strong>Data-driven insights</strong> to optimize clinical decisions and practice metrics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Clinical Practice?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join healthcare providers using AI to deliver better patient care while working smarter, not harder.
          </p>
          <Button 
            onClick={onNavigate}
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6 h-auto"
          >
            Start Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            <strong className="text-foreground">DEMO MODE:</strong> This is a demonstration application. 
            No actual patient data should be entered.
          </p>
          <p>
            © 2025 ClinicalScribe AI. All rights reserved. • Privacy Policy • Terms of Service
          </p>
        </div>
      </footer>
    </div>
  );
}
