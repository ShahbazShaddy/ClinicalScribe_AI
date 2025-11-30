import { useState } from 'react';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useDatabase } from '@/hooks/useDatabase';
import type { User } from '@/App';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const SPECIALTIES = [
  'Family Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Cardiology',
  'Orthopedics',
  'Psychiatry',
  'Emergency Medicine',
  'Surgery',
  'Obstetrics & Gynecology',
  'Other'
];

export default function AuthPage({ onLogin, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signUpUser, getUser, isLoading, error } = useDatabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Try database first, fallback to localStorage
      try {
        const user = await getUser(email);
        if (user) {
          onLogin(user);
          toast.success('Welcome back!');
        } else {
          // Fallback to localStorage
          const savedUser = localStorage.getItem('clinicalscribe_user');
          if (savedUser) {
            onLogin(JSON.parse(savedUser));
            toast.success('Welcome back!');
          } else {
            toast.error('No account found. Please sign up first.');
          }
        }
      } catch (err) {
        // Fallback to localStorage on database error
        const savedUser = localStorage.getItem('clinicalscribe_user');
        if (savedUser && JSON.parse(savedUser).email === email) {
          onLogin(JSON.parse(savedUser));
          toast.success('Welcome back!');
        } else {
          toast.error('No account found. Please sign up first.');
        }
      }
    } else {
      // Sign up
      if (!agreedToTerms) {
        toast.error('Please agree to the Terms of Service and Privacy Policy');
        return;
      }
      
      if (!email || !password || !name || !specialty || !practiceName) {
        toast.error('Please fill in all fields');
        return;
      }

      try {
        const user = await signUpUser({
          email,
          name,
          specialty,
          practiceName
        });
        
        if (user) {
          onLogin(user);
          toast.success('Account created successfully!');
        } else {
          toast.error('Failed to create account. Please try again.');
        }
      } catch (err) {
        const errorMsg = error || (err instanceof Error ? err.message : 'Failed to create account');
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Stethoscope className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">ClinicalScribe AI</span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Medical Specialty</Label>
                  <Select value={specialty} onValueChange={setSpecialty} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="practice">Practice Name</Label>
                  <Input
                    id="practice"
                    type="text"
                    placeholder="ABC Medical Center"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Terms of Service and Privacy Policy. I understand this is a demo application.
                </label>
              </div>
            )}

            <Button type="submit" className="w-full medical-gradient" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-xs text-primary-700 text-center">
                <strong>DEMO MODE:</strong> This is a demonstration. Data is stored locally in your browser.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
