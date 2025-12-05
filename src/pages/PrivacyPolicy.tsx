import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: () => void;
}

export default function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={onNavigate}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
            <p>
              ClinicalScribe AI ("we," "us," "our," or "Company") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you visit our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on 
              the Application includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal identification information (name, email address, phone number, etc.)</li>
              <li>Patient data and clinical notes (processed and stored securely)</li>
              <li>Usage data and analytics</li>
              <li>Device information and IP address</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, 
              and customized experience. Specifically, we may use information collected about you via the 
              Application to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze usage and trends</li>
              <li>Notify you about updates and changes to our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to protect your personal 
              information. While we strive to use commercially acceptable means to protect your personal 
              information, we cannot guarantee its absolute security.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bank-level encryption for data transmission</li>
              <li>HIPAA-compliant security protocols</li>
              <li>Secure cloud storage with regular backups</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>By Law or to Protect Rights</li>
              <li>Third-Party Service Providers</li>
              <li>With your consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-4">
              <strong>Email:</strong> 2022cs174@student.uet.edu.pk<br />
              <strong>Phone:</strong> +92 304 7201214
            </p>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Last updated: December 2025
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © 2025 ClinicalScribe AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
