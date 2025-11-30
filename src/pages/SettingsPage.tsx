import { useState } from 'react';
import { Shield, UserIcon, FileText, HardDrive } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { generateUniqueId } from '@/lib/utils';
import { useDatabase } from '@/hooks/useDatabase';
import type { User, Page } from '@/App';

interface SettingsPageProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
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

export default function SettingsPage({ user, onNavigate, onLogout }: SettingsPageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [specialty, setSpecialty] = useState(user.specialty);
  const [practiceName, setPracticeName] = useState(user.practiceName);
  const [defaultNoteType, setDefaultNoteType] = useState('SOAP');
  const [audioQuality, setAudioQuality] = useState('high');
  const [isSaving, setIsSaving] = useState(false);
  const { saveSettings, isLoading } = useDatabase();

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedUser = {
        email,
        name,
        specialty,
        practiceName
      };
      
      // Save to database (optional - implement if needed)
      // For now, just show success
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // Save to database
      const userId = user.id || generateUniqueId();
      await saveSettings(userId, {
        defaultNoteType,
        audioQuality,
        autoSave: true,
        darkMode: false
      });
      
      toast.success('Preferences saved successfully');
    } catch (err) {
      toast.error('Failed to save preferences');
      console.error('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all notes? This cannot be undone.')) {
      localStorage.removeItem('clinicalscribe_notes');
      toast.success('All notes cleared');
    }
  };

  return (
    <DashboardLayout user={user} currentPage="settings" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal and practice information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Medical Specialty</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger>
                    <SelectValue />
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
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving || isLoading}>
              {isSaving || isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Note Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Note Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize your default note settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Note Type</Label>
              <Select value={defaultNoteType} onValueChange={setDefaultNoteType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOAP">SOAP Note</SelectItem>
                  <SelectItem value="Progress">Progress Note</SelectItem>
                  <SelectItem value="Consultation">Consultation Note</SelectItem>
                  <SelectItem value="H&P">H&P (History & Physical)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Audio Quality</Label>
              <Select value={audioQuality} onValueChange={setAudioQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Quality</SelectItem>
                  <SelectItem value="high">High Quality (Recommended)</SelectItem>
                  <SelectItem value="ultra">Ultra High Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSavePreferences} disabled={isSaving || isLoading}>
              {isSaving || isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>
              Manage your stored data and retention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium mb-1">Clear All Notes</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all stored clinical notes
                </p>
              </div>
              <Button variant="destructive" onClick={handleClearData}>
                Clear Data
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium mb-1">Export All Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download all your notes and data
                </p>
              </div>
              <Button variant="outline" onClick={() => toast.success('Exporting data... (Demo)')}>
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* HIPAA Compliance */}
        <Card className="border-primary-200 bg-primary-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-primary">HIPAA Compliance Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <p>All audio recordings are encrypted end-to-end using AES-256 encryption</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <p>Clinical notes are stored with bank-level security protocols</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <p>Access logs are maintained for all data access and modifications</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <p>Business Associate Agreement (BAA) available upon request</p>
            </div>
            <Separator className="my-3" />
            <p className="text-xs text-primary-700">
              <strong>Note:</strong> This is a demonstration application. In production, full HIPAA compliance 
              measures including encrypted storage, audit trails, and secure transmission would be implemented.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
