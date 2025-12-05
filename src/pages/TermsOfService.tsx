import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onNavigate: () => void;
}

export default function TermsOfService({ onNavigate }: TermsOfServiceProps) {
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
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using the ClinicalScribe AI application, you accept and agree to be bound 
              by and comply with these Terms and Conditions. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) 
              on ClinicalScribe AI for personal, non-commercial transitory viewing only. This is the grant of 
              a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the Application</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Disclaimer</h2>
            <p>
              The materials on ClinicalScribe AI are provided on an "as is" basis. ClinicalScribe AI makes no 
              warranties, expressed or implied, and hereby disclaims and negates all other warranties including, 
              without limitation, implied warranties or conditions of merchantability, fitness for a particular 
              purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Limitations</h2>
            <p>
              In no event shall ClinicalScribe AI or its suppliers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) arising out of the 
              use or inability to use the materials on ClinicalScribe AI, even if we or an authorized representative 
              has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on ClinicalScribe AI could include technical, typographical, or photographic 
              errors. ClinicalScribe AI does not warrant that any of the materials on its Application are accurate, 
              complete, or current. ClinicalScribe AI may make changes to the materials contained on its Application 
              at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Links</h2>
            <p>
              ClinicalScribe AI has not reviewed all of the sites linked to its Application and is not responsible 
              for the contents of any such linked site. The inclusion of any link does not imply endorsement by 
              ClinicalScribe AI of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Modifications</h2>
            <p>
              ClinicalScribe AI may revise these Terms and Conditions for its Application at any time without 
              notice. By using this Application, you are agreeing to be bound by the then current version of 
              these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Governing Law</h2>
            <p>
              These Terms and Conditions and any separate agreements we may enter into to provide the Application 
              are governed by and construed in accordance with the laws of Pakistan, and you irrevocably submit to 
              the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
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
