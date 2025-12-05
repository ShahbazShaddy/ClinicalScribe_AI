import { Shield, Lock, Clock, FileText, Stethoscope, CheckCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onNavigate: (page?: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">ClinicalScribe AI</span>
          </div>
          <Button onClick={() => onNavigate('auth')} variant="outline">
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary-50 to-background">
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
              AI-Powered Clinical Documentation
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Save 2 Hours Daily
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Transform patient conversations into comprehensive clinical notes instantly. 
              Accurate medical terminology, multiple note formats, HIPAA-compliant security.
            </p>

            <Button 
              onClick={() => onNavigate('auth')}
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

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Clinical Documentation
            </h2>
            <p className="text-lg text-muted-foreground">
              Designed specifically for healthcare providers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">HIPAA Compliant</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with end-to-end encryption. Your patient data is always protected and private.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multiple Note Formats</h3>
              <p className="text-muted-foreground">
                Generate SOAP notes, Progress notes, Consultation notes, and H&P with accurate medical terminology.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save Hours Daily</h3>
              <p className="text-muted-foreground">
                Reduce documentation time by up to 70%. Spend more time with patients, less time on paperwork.
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
              Simple 3-Step Process
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Record</h3>
              <p className="text-muted-foreground">
                Record your patient conversation with one click. Our AI listens and transcribes in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Generate</h3>
              <p className="text-muted-foreground">
                AI analyzes the conversation and generates structured clinical notes with ICD-10 and CPT codes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Review & Export</h3>
              <p className="text-muted-foreground">
                Review, edit if needed, and export to your EHR or download as PDF in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Healthcare Providers Choose Us
            </h2>
            <div className="space-y-4">
              {[
                'Accurate medical terminology recognition',
                'Automatic ICD-10 and CPT code suggestions',
                'Customizable note templates for your specialty',
                'Seamless integration with existing workflows',
                'Real-time transcription with waveform visualization',
                'Secure cloud storage with instant access anywhere'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-card p-4 rounded-lg border border-primary-200">
                  <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Tiers */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that works for your practice
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 rounded-lg border border-border bg-card hover:border-primary transition-colors flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground mb-6">Perfect for individual practitioners</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Button className="mb-8 medical-gradient" onClick={() => onNavigate('auth')}>
                Get Started
              </Button>
              <ul className="space-y-3 flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Up to 50 notes/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Basic templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Standard support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Cloud storage</span>
                </li>
              </ul>
            </div>

            {/* Professional Plan */}
            <div className="p-8 rounded-lg border-2 border-primary bg-card shadow-lg flex flex-col relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <p className="text-muted-foreground mb-6">For busy clinics and group practices</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">$79</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Button className="mb-8 medical-gradient" onClick={() => onNavigate('auth')}>
                Get Started
              </Button>
              <ul className="space-y-3 flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Unlimited notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">All templates + custom</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Team collaboration (up to 5)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">API access</span>
                </li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-lg border border-border bg-card hover:border-primary transition-colors flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground mb-6">For large healthcare organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">Custom</span>
              </div>
              <Button variant="outline" className="mb-8">
                Contact Sales
              </Button>
              <ul className="space-y-3 flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Everything in Professional</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Unlimited users</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Dedicated support & training</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">SLA guarantee</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Get In Touch
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center md:justify-start gap-4 bg-primary-700 rounded-lg p-6">
                <Phone className="w-8 h-8 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm opacity-90">Call Us</p>
                  <a href="tel:+923047201214" className="text-lg font-semibold hover:underline break-all">
                    +92 304 7201214
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 bg-primary-700 rounded-lg p-6">
                <Mail className="w-8 h-8 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm opacity-90">Email Us</p>
                  <a href="mailto:2022cs174@student.uet.edu.pk" className="text-sm font-semibold hover:underline break-all">
                    2022cs174@student.uet.edu.pk
                  </a>
                </div>
              </div>
            </div>
            <p className="text-center mt-8 opacity-90">
              Our team is here to answer any questions and help you get started.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Documentation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of healthcare providers saving hours every day
          </p>
          <Button 
            onClick={() => onNavigate('auth')}
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
          <p>
            © 2025 ClinicalScribe AI. All rights reserved. • 
            <button 
              onClick={() => onNavigate('privacy')}
              className="text-primary hover:underline cursor-pointer"
            >
              {' '}Privacy Policy{' '}
            </button>
            • 
            <button 
              onClick={() => onNavigate('terms')}
              className="text-primary hover:underline cursor-pointer"
            >
              {' '}Terms of Service
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}
